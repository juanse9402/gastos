import { supabase } from '../lib/supabase';
import { 
  INITIAL_COMPANIES, 
  INITIAL_USERS, 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_DAILY_CLOSES, 
  INITIAL_CAFE_DATA,
  getDefaultCategoriesForIndustry 
} from '../data/initialData';

// Status of connection & tables
let isInitializedCache = null;

export async function checkSupabaseStatus() {
  try {
    const { data, error } = await supabase.from('companies').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
        isInitializedCache = false;
        return { connected: true, initialized: false, error: 'Tablas aún no creadas en Supabase' };
      }
      return { connected: false, initialized: false, error: error.message };
    }
    isInitializedCache = true;
    return { connected: true, initialized: true };
  } catch (err) {
    return { connected: false, initialized: false, error: err.message };
  }
}

// 1. Fetch Companies
export async function fetchCompanies() {
  try {
    const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map(c => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji || '🏢',
      industry: c.industry,
      createdAt: c.created_at
    }));
  } catch {
    return null;
  }
}

// 2. Fetch App Users
export async function fetchAppUsers() {
  try {
    const { data, error } = await supabase.from('app_users').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map(u => ({
      id: u.id,
      companyId: u.company_id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role
    }));
  } catch {
    return null;
  }
}

// 3. Fetch Tenant Full Dataset
export async function fetchTenantData(companyId, companyIndustry = 'Comidas Rápidas') {
  try {
    const [catsRes, txsRes, closesRes] = await Promise.all([
      supabase.from('categories').select('*').eq('company_id', companyId),
      supabase.from('transactions').select('*').eq('company_id', companyId).order('fecha', { ascending: false }),
      supabase.from('daily_closes').select('*').eq('company_id', companyId).order('fecha', { ascending: false })
    ]);

    if (catsRes.error || txsRes.error || closesRes.error) {
      return null;
    }

    let categories = (catsRes.data || []).map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      icon: c.icon,
      color: c.color
    }));

    if (categories.length === 0) {
      categories = getDefaultCategoriesForIndustry(companyIndustry);
    }

    const transactions = (txsRes.data || []).map(t => ({
      id: t.id,
      fecha: t.fecha,
      descripcion: t.descripcion,
      tipo: t.tipo,
      categoria: t.categoria,
      monto: Number(t.monto),
      metodo: t.metodo,
      notas: t.notas || ''
    }));

    const dailyCloses = (closesRes.data || []).map(c => ({
      id: c.id,
      fecha: c.fecha,
      hora: c.hora || '',
      cajero: c.cajero,
      turno: c.turno,
      cajaEsperada: Number(c.caja_esperada || 0),
      efectivo: Number(c.efectivo || 0),
      banco: Number(c.banco || 0),
      gastos: Number(c.gastos || 0),
      nomina: Number(c.nomina || 0),
      totalCalculado: Number(c.total_calculado || 0),
      descuadre: Number(c.descuadre || 0),
      estadoCuadre: c.estado_cuadre,
      estadoRevision: c.estado_revision,
      notas: c.notas || '',
      desgloseBilletes: c.desglose_billetes || {},
      bancosDetalle: c.bancos_detalle || []
    }));

    return { categories, transactions, dailyCloses };
  } catch {
    return null;
  }
}

// 4. Save New Company & Users to Supabase
export async function saveCompanyToSupabase(newCompany, newUsers, defaultCategories) {
  try {
    await supabase.from('companies').insert([{
      id: newCompany.id,
      name: newCompany.name,
      emoji: newCompany.emoji || '🏢',
      industry: newCompany.industry
    }]);

    if (newUsers && newUsers.length > 0) {
      await supabase.from('app_users').insert(newUsers.map(u => ({
        id: u.id,
        company_id: newCompany.id,
        name: u.name,
        email: u.email,
        password: u.password || '1234',
        role: u.role
      })));
    }

    if (defaultCategories && defaultCategories.length > 0) {
      await supabase.from('categories').insert(defaultCategories.map(c => ({
        id: c.id,
        company_id: newCompany.id,
        name: c.name,
        type: c.type,
        icon: c.icon || null,
        color: c.color || '#3b82f6'
      })));
    }
  } catch (err) {
    console.warn('Could not sync company to Supabase:', err);
  }
}

// 5. Create Daily Close
export async function saveDailyCloseToSupabase(companyId, close) {
  try {
    const payload = {
      id: close.id,
      company_id: companyId,
      fecha: close.fecha,
      hora: close.hora || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      cajero: close.cajero,
      turno: close.turno,
      caja_esperada: close.cajaEsperada,
      efectivo: close.efectivo,
      banco: close.banco,
      gastos: close.gastos,
      nomina: close.nomina,
      total_calculado: close.totalCalculado,
      descuadre: close.descuadre,
      estado_cuadre: close.estadoCuadre,
      estado_revision: close.estadoRevision,
      notas: close.notas || '',
      desglose_billetes: close.desgloseBilletes || {},
      bancos_detalle: close.bancosDetalle || []
    };
    const { error } = await supabase.from('daily_closes').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase saveDailyClose error:', err);
    return false;
  }
}

// 6. Update Daily Close Status (Aprobación)
export async function updateDailyCloseStatusInSupabase(closeId, newStatus) {
  try {
    const { error } = await supabase
      .from('daily_closes')
      .update({ estado_revision: newStatus })
      .eq('id', closeId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase updateDailyCloseStatus error:', err);
    return false;
  }
}

// 7. Save Transactions (Single or Batch)
export async function saveTransactionsToSupabase(companyId, txs) {
  try {
    const list = Array.isArray(txs) ? txs : [txs];
    const payload = list.map(tx => ({
      id: tx.id,
      company_id: companyId,
      fecha: tx.fecha,
      descripcion: tx.descripcion,
      tipo: tx.tipo,
      categoria: tx.categoria,
      monto: tx.monto,
      metodo: tx.metodo,
      notas: tx.notas || ''
    }));
    const { error } = await supabase.from('transactions').upsert(payload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase saveTransactions error:', err);
    return false;
  }
}

// 8. Delete Transaction
export async function deleteTransactionFromSupabase(txId) {
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', txId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase deleteTransaction error:', err);
    return false;
  }
}

// 9. Update Transaction
export async function updateTransactionInSupabase(txId, updates) {
  try {
    const payload = {};
    if (updates.fecha !== undefined) payload.fecha = updates.fecha;
    if (updates.descripcion !== undefined) payload.descripcion = updates.descripcion;
    if (updates.tipo !== undefined) payload.tipo = updates.tipo;
    if (updates.categoria !== undefined) payload.categoria = updates.categoria;
    if (updates.monto !== undefined) payload.monto = updates.monto;
    if (updates.metodo !== undefined) payload.metodo = updates.metodo;
    if (updates.notas !== undefined) payload.notas = updates.notas;

    const { error } = await supabase.from('transactions').update(payload).eq('id', txId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase updateTransaction error:', err);
    return false;
  }
}

// 10. Save Category
export async function saveCategoryToSupabase(companyId, cat) {
  try {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      company_id: companyId,
      name: cat.name,
      type: cat.type,
      icon: cat.icon || null,
      color: cat.color || '#3b82f6'
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase saveCategory error:', err);
    return false;
  }
}

// 11. Delete Category
export async function deleteCategoryFromSupabase(catId) {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', catId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase deleteCategory error:', err);
    return false;
  }
}

// 12. Setup Realtime Listener
export function setupRealtimeSubscription(companyId, onUpdate) {
  try {
    const channel = supabase
      .channel(`company-realtime-${companyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `company_id=eq.${companyId}` },
        () => onUpdate('transactions')
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_closes', filter: `company_id=eq.${companyId}` },
        () => onUpdate('daily_closes')
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories', filter: `company_id=eq.${companyId}` },
        () => onUpdate('categories')
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription not available:', err);
    return () => {};
  }
}

// 13. Update User Password / PIN in Supabase
export async function updateUserPasswordInSupabase(userId, newPassword) {
  try {
    const { error } = await supabase
      .from('app_users')
      .update({ password: newPassword })
      .eq('id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase updateUserPassword error:', err);
    return false;
  }
}

// 14. Save or Insert Staff User into Supabase
export async function saveAppUserToSupabase(user) {
  try {
    const { error } = await supabase.from('app_users').upsert({
      id: user.id,
      company_id: user.companyId,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase saveAppUser error:', err);
    return false;
  }
}

// 15. Delete Staff User from Supabase
export async function deleteAppUserFromSupabase(userId) {
  try {
    const { error } = await supabase.from('app_users').delete().eq('id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase deleteAppUser error:', err);
    return false;
  }
}
