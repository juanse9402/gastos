import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import AuthPortal from './components/AuthPortal';
import CashierView from './components/CashierView';
import AdminDashboard from './components/AdminDashboard';
import DailyClosesReview from './components/DailyClosesReview';
import TransactionsTable from './components/TransactionsTable';
import CategoryManager from './components/CategoryManager';
import UserManager from './components/UserManager';
import SuppliersManager from './components/SuppliersManager';
import PinModal from './components/PinModal';
import ExportModal from './components/ExportModal';
import SupabaseModal from './components/SupabaseModal';

import { 
  INITIAL_COMPANIES, 
  INITIAL_USERS, 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_DAILY_CLOSES, 
  INITIAL_CAFE_DATA,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIER_INVOICES,
  getDefaultCategoriesForIndustry 
} from './data/initialData';

import { SUPABASE_SCHEMA_SQL } from './data/supabaseSql';

import {
  checkSupabaseStatus,
  fetchCompanies,
  fetchAppUsers,
  fetchTenantData,
  saveCompanyToSupabase,
  saveDailyCloseToSupabase,
  updateDailyCloseStatusInSupabase,
  saveTransactionsToSupabase,
  deleteTransactionFromSupabase,
  updateTransactionInSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  updateUserPasswordInSupabase,
  saveAppUserToSupabase,
  deleteAppUserFromSupabase,
  setupRealtimeSubscription
} from './services/db';

import { 
  BarChart3, 
  Inbox, 
  BookOpen, 
  Tag, 
  Users,
  Truck,
  Database,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

export default function App() {
  // 1. Companies & Users (Multi-tenant)
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('cloud_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('cloud_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // 2. Tenants Data dictionary: { [companyId]: { transactions, dailyCloses, categories, suppliers, supplierInvoices } }
  const [tenantsData, setTenantsData] = useState(() => {
    const saved = localStorage.getItem('cloud_tenants_data');
    if (saved) return JSON.parse(saved);
    return {
      'comp-paperia': {
        transactions: INITIAL_TRANSACTIONS,
        dailyCloses: INITIAL_DAILY_CLOSES,
        categories: INITIAL_CATEGORIES,
        suppliers: INITIAL_SUPPLIERS,
        supplierInvoices: INITIAL_SUPPLIER_INVOICES
      },
      'comp-cafe': {
        ...INITIAL_CAFE_DATA,
        suppliers: [],
        supplierInvoices: []
      }
    };
  });

  // 3. Current Authenticated User & Company
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cloud_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Supabase Status & Modals
  const [dbStatus, setDbStatus] = useState({ connected: false, initialized: false, checking: true });
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [dismissDbBanner, setDismissDbBanner] = useState(false);

  // Active Company based on currentUser
  const activeCompany = useMemo(() => {
    if (!currentUser) return null;
    return companies.find(c => c.id === currentUser.companyId) || companies[0];
  }, [currentUser, companies]);

  // Current Role: 'cajero' | 'admin'
  const [currentRole, setCurrentRole] = useState(() => {
    return currentUser?.role || 'cajero';
  });

  // Active dataset for current activeCompany
  const currentCompanyData = useMemo(() => {
    if (!activeCompany) {
      return { transactions: [], dailyCloses: [], categories: [], suppliers: [], supplierInvoices: [] };
    }
    const data = tenantsData[activeCompany.id] || {
      transactions: [],
      dailyCloses: [],
      categories: getDefaultCategoriesForIndustry(activeCompany.industry),
      suppliers: [],
      supplierInvoices: []
    };

    return {
      ...data,
      suppliers: data.suppliers !== undefined ? data.suppliers : (activeCompany.id === 'comp-paperia' ? INITIAL_SUPPLIERS : []),
      supplierInvoices: data.supplierInvoices !== undefined ? data.supplierInvoices : (activeCompany.id === 'comp-paperia' ? INITIAL_SUPPLIER_INVOICES : [])
    };
  }, [activeCompany, tenantsData]);

  const transactions = currentCompanyData.transactions || [];
  const dailyCloses = currentCompanyData.dailyCloses || [];
  const categories = currentCompanyData.categories || [];
  const suppliers = currentCompanyData.suppliers || [];
  const supplierInvoices = currentCompanyData.supplierInvoices || [];

  // Modals & Tabs
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cloud_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('cloud_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cloud_tenants_data', JSON.stringify(tenantsData));
  }, [tenantsData]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cloud_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cloud_auth_user');
    }
  }, [currentUser]);

  // Check Supabase connection and tables on mount
  const verifyDbStatus = useCallback(async () => {
    const status = await checkSupabaseStatus();
    setDbStatus({ ...status, checking: false });

    if (status.initialized) {
      const [remoteCompanies, remoteUsers] = await Promise.all([
        fetchCompanies(),
        fetchAppUsers()
      ]);
      if (remoteCompanies && remoteCompanies.length > 0) {
        setCompanies(remoteCompanies);
      }
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(remoteUsers);
      }
    }
  }, []);

  useEffect(() => {
    verifyDbStatus();
  }, [verifyDbStatus]);

  // Real-time synchronization when activeCompany changes & DB is initialized
  useEffect(() => {
    if (!activeCompany || !dbStatus.initialized) return;

    let isMounted = true;
    const loadRemoteData = async () => {
      const data = await fetchTenantData(activeCompany.id, activeCompany.industry);
      if (isMounted && data) {
        setTenantsData(prev => ({
          ...prev,
          [activeCompany.id]: {
            ...prev[activeCompany.id],
            ...data
          }
        }));
      }
    };

    loadRemoteData();

    // Subscribe to Realtime updates on Postgres tables
    const unsubscribe = setupRealtimeSubscription(activeCompany.id, () => {
      loadRemoteData();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [activeCompany?.id, dbStatus.initialized]);

  // Helper to update active company's data
  const updateActiveCompanyData = (updater) => {
    if (!activeCompany) return;
    setTenantsData(prev => {
      const current = prev[activeCompany.id] || {
        transactions: [],
        dailyCloses: [],
        categories: getDefaultCategoriesForIndustry(activeCompany.industry)
      };
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return {
        ...prev,
        [activeCompany.id]: updated
      };
    });
  };

  // Auth Handlers
  const handleLogin = (user, company) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setAdminTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('cajero');
  };

  const handleRegisterCompany = async (newCompany, newUsers) => {
    // 1. Add company locally
    setCompanies(prev => [...prev, newCompany]);
    
    // 2. Add users locally
    setUsers(prev => [...prev, ...newUsers]);

    // 3. Initialize tenant data locally
    const defaultCats = getDefaultCategoriesForIndustry(newCompany.industry);
    setTenantsData(prev => ({
      ...prev,
      [newCompany.id]: {
        transactions: [],
        dailyCloses: [],
        categories: defaultCats
      }
    }));

    // 4. Sync to Supabase if initialized
    if (dbStatus.initialized) {
      await saveCompanyToSupabase(newCompany, newUsers, defaultCats);
    }
  };

  // User Management Handlers (Internal & Password Recovery)
  const handleUpdateUserPassword = async (userId, newPassword) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    if (dbStatus.initialized) {
      await updateUserPasswordInSupabase(userId, newPassword);
    }
  };

  const handleAddUser = async (newUser) => {
    setUsers(prev => [...prev, newUser]);
    if (dbStatus.initialized) {
      await saveAppUserToSupabase(newUser);
    }
  };

  const handleUpdateUser = async (userId, fields) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...fields } : u));
    if (fields.password && dbStatus.initialized) {
      await updateUserPasswordInSupabase(userId, fields.password);
    }
  };

  const handleDeleteUser = async (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (dbStatus.initialized) {
      await deleteAppUserFromSupabase(userId);
    }
  };

  // Role switching
  const handleSelectRole = (role) => {
    if (role === 'admin') {
      if (currentRole === 'admin') return;
      if (currentUser?.role === 'admin') {
        setCurrentRole('admin');
      } else {
        setIsPinModalOpen(true);
      }
    } else {
      setCurrentRole('cajero');
    }
  };

  const handlePinSuccess = () => {
    setCurrentRole('admin');
    setIsPinModalOpen(false);
  };

  // Admin PIN: find admin user for this company
  const companyAdminUser = useMemo(() => {
    if (!activeCompany) return null;
    return users.find(u => u.companyId === activeCompany.id && u.role === 'admin');
  }, [users, activeCompany]);

  const activeAdminPin = companyAdminUser?.password || '1234';

  // Cashier actions
  const handleAddDailyClose = async (newClose) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      dailyCloses: [newClose, ...prev.dailyCloses]
    }));

    if (dbStatus.initialized && activeCompany) {
      await saveDailyCloseToSupabase(activeCompany.id, newClose);
    }
  };

  // Admin approval of daily close
  const handleApproveClose = async (closeId) => {
    const targetClose = dailyCloses.find(c => c.id === closeId);
    if (!targetClose) return;

    // Update close status to Aprobado
    const updatedCloses = dailyCloses.map(c => 
      c.id === closeId ? { ...c, estadoRevision: 'Aprobado' } : c
    );

    const newTxs = [];

    // 1. Efectivo de ventas del turno
    if (targetClose.efectivo > 0) {
      newTxs.push({
        id: `tx-sale-efectivo-${targetClose.id}`,
        fecha: targetClose.fecha,
        descripcion: `Ventas Efectivo Turno ${targetClose.turno} (${targetClose.cajero})`,
        tipo: 'Ingreso',
        categoria: 'Ventas Local',
        monto: targetClose.efectivo,
        metodo: 'Efectivo'
      });
    }

    // 2. Banco / Transferencias / Datáfono del turno
    if (targetClose.banco > 0) {
      newTxs.push({
        id: `tx-sale-banco-${targetClose.id}`,
        fecha: targetClose.fecha,
        descripcion: `Ventas Banco / Digital Turno ${targetClose.turno} (${targetClose.cajero})`,
        tipo: 'Ingreso',
        categoria: 'Ventas Local',
        monto: targetClose.banco,
        metodo: 'Banco'
      });
    }

    // 3. Gastos de turno salidos de caja
    if (targetClose.gastos > 0) {
      newTxs.push({
        id: `tx-exp-${targetClose.id}`,
        fecha: targetClose.fecha,
        descripcion: `Gastos de Caja Turno: ${targetClose.gastosDetalle || 'Caja Menor'}`,
        tipo: 'Gasto',
        categoria: 'Compras Diarias',
        monto: targetClose.gastos,
        metodo: 'Efectivo'
      });
    }

    // 4. Nómina del turno pagada en efectivo
    if (targetClose.nomina > 0) {
      newTxs.push({
        id: `tx-nom-${targetClose.id}`,
        fecha: targetClose.fecha,
        descripcion: `Adelanto Nómina Turno: ${targetClose.nominaDetalle || 'Personal'}`,
        tipo: 'Gasto',
        categoria: 'Sueldos / Nómina',
        monto: targetClose.nomina,
        metodo: 'Efectivo'
      });
    }

    updateActiveCompanyData(prev => ({
      ...prev,
      dailyCloses: updatedCloses,
      transactions: [...newTxs, ...prev.transactions]
    }));

    if (dbStatus.initialized && activeCompany) {
      await updateDailyCloseStatusInSupabase(closeId, 'Aprobado');
      if (newTxs.length > 0) {
        await saveTransactionsToSupabase(activeCompany.id, newTxs);
      }
    }
  };

  // Transaction CRUD
  const handleAddTransaction = async (newTx) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));

    if (dbStatus.initialized && activeCompany) {
      await saveTransactionsToSupabase(activeCompany.id, newTx);
    }
  };

  const handleDeleteTransaction = async (txId) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== txId)
    }));

    if (dbStatus.initialized) {
      await deleteTransactionFromSupabase(txId);
    }
  };

  const handleEditTransaction = async (txId, updatedData) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === txId ? { ...t, ...updatedData } : t)
    }));

    if (dbStatus.initialized) {
      await updateTransactionInSupabase(txId, updatedData);
    }
  };

  // Category CRUD
  const handleAddCategory = async (newCat) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));

    if (dbStatus.initialized && activeCompany) {
      await saveCategoryToSupabase(activeCompany.id, newCat);
    }
  };

  const handleDeleteCategory = async (catId) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== catId)
    }));

    if (dbStatus.initialized) {
      await deleteCategoryFromSupabase(catId);
    }
  };

  // Supplier CRUD and Payments
  const handleAddSupplier = (newSupplier) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      suppliers: [newSupplier, ...(prev.suppliers || [])]
    }));
  };

  const handleEditSupplier = (supplierId, updatedData) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      suppliers: (prev.suppliers || []).map(s => s.id === supplierId ? { ...s, ...updatedData } : s)
    }));
  };

  const handleDeleteSupplier = (supplierId) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      suppliers: (prev.suppliers || []).filter(s => s.id !== supplierId)
    }));
  };

  const handleDeleteSupplierInvoice = (invoiceId) => {
    updateActiveCompanyData(prev => {
      const inv = (prev.supplierInvoices || []).find(i => i.id === invoiceId);
      const remainingInvoices = (prev.supplierInvoices || []).filter(i => i.id !== invoiceId);
      
      let updatedSuppliers = prev.suppliers || [];
      if (inv && inv.saldoPendiente > 0) {
        updatedSuppliers = updatedSuppliers.map(s => 
          s.id === inv.supplierId 
            ? { ...s, saldoPendiente: Math.max(0, (Number(s.saldoPendiente) || 0) - Number(inv.saldoPendiente)) }
            : s
        );
      }

      return {
        ...prev,
        suppliers: updatedSuppliers,
        supplierInvoices: remainingInvoices
      };
    });
  };

  const handleDeleteDailyClose = (closeId) => {
    updateActiveCompanyData(prev => ({
      ...prev,
      dailyCloses: (prev.dailyCloses || []).filter(c => c.id !== closeId)
    }));
  };

  const handleAddSupplierInvoice = (newInvoice, immediatePayment) => {
    updateActiveCompanyData(prev => {
      const currentSuppliers = prev.suppliers || [];
      const updatedSuppliers = immediatePayment ? currentSuppliers : currentSuppliers.map(s => 
        s.id === newInvoice.supplierId ? { ...s, saldoPendiente: (Number(s.saldoPendiente) || 0) + Number(newInvoice.total) } : s
      );

      return {
        ...prev,
        suppliers: updatedSuppliers,
        supplierInvoices: [newInvoice, ...(prev.supplierInvoices || [])]
      };
    });

    if (immediatePayment) {
      const tx = {
        id: `tx-supp-imm-${Date.now()}`,
        fecha: immediatePayment.fecha,
        descripcion: `Compra Contado: ${immediatePayment.supplierName} (${immediatePayment.numeroFactura})`,
        tipo: 'Gasto',
        categoria: immediatePayment.categoria || 'Insumos y Materia Prima',
        monto: immediatePayment.monto,
        metodo: immediatePayment.metodo,
        notas: 'Factura pagada de contado'
      };
      handleAddTransaction(tx);
    }
  };

  const handleRegisterSupplierPayment = (paymentData) => {
    updateActiveCompanyData(prev => {
      const currentInvoices = prev.supplierInvoices || [];
      const currentSuppliers = prev.suppliers || [];

      // 1. Update invoice if specified
      let updatedInvoices = currentInvoices;
      if (paymentData.invoiceId) {
        updatedInvoices = currentInvoices.map(inv => {
          if (inv.id === paymentData.invoiceId) {
            const newBal = Math.max(0, (Number(inv.saldoPendiente) || 0) - Number(paymentData.monto));
            return {
              ...inv,
              saldoPendiente: newBal,
              estado: newBal <= 0 ? 'Pagado' : 'Parcial',
              pagos: [
                ...(inv.pagos || []),
                {
                  id: `pay-${Date.now()}`,
                  fecha: paymentData.fecha,
                  monto: paymentData.monto,
                  metodo: paymentData.metodo,
                  notas: paymentData.notas
                }
              ]
            };
          }
          return inv;
        });
      }

      // 2. Update supplier balance
      const updatedSuppliers = currentSuppliers.map(sup => {
        if (sup.id === paymentData.supplierId) {
          const newBal = Math.max(0, (Number(sup.saldoPendiente) || 0) - Number(paymentData.monto));
          return { ...sup, saldoPendiente: newBal };
        }
        return sup;
      });

      return {
        ...prev,
        suppliers: updatedSuppliers,
        supplierInvoices: updatedInvoices
      };
    });

    // 3. Inject transaction into cash flow
    const newTx = {
      id: `tx-supp-pay-${Date.now()}`,
      fecha: paymentData.fecha,
      descripcion: `Pago Proveedor: ${paymentData.supplierName} (${paymentData.numeroFactura})`,
      tipo: 'Gasto',
      categoria: paymentData.categoria || 'Insumos y Materia Prima',
      monto: paymentData.monto,
      metodo: paymentData.metodo,
      notas: paymentData.notas || 'Abono / Pago de factura'
    };
    handleAddTransaction(newTx);
  };

  // Reset to initial demo data
  const handleResetDemo = () => {
    if (activeCompany?.id === 'comp-paperia') {
      updateActiveCompanyData({
        transactions: INITIAL_TRANSACTIONS,
        dailyCloses: INITIAL_DAILY_CLOSES,
        categories: INITIAL_CATEGORIES
      });
    } else {
      updateActiveCompanyData({
        transactions: [],
        dailyCloses: [],
        categories: getDefaultCategoriesForIndustry(activeCompany.industry)
      });
    }
  };

  // Count pending daily closes and supplier invoices
  const pendingClosesCount = dailyCloses.filter(c => c.estadoRevision !== 'Aprobado').length;
  const pendingInvoicesCount = (supplierInvoices || []).filter(inv => inv.estado !== 'Pagado').length;

  // IF NO USER IS LOGGED IN -> SHOW AUTH PORTAL!
  if (!currentUser) {
    return (
      <>
        <AuthPortal
          companies={companies}
          users={users}
          onLogin={handleLogin}
          onRegisterCompany={handleRegisterCompany}
          onUpdateUserPassword={handleUpdateUserPassword}
          dbStatus={dbStatus}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          dbStatus={dbStatus}
          onRefreshStatus={verifyDbStatus}
          sqlCode={SUPABASE_SCHEMA_SQL}
        />
      </>
    );
  }

  // LOGGED IN USER EXPERIENCE
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeCompany={activeCompany}
        currentUser={currentUser}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onOpenExport={() => setIsExportModalOpen(true)}
        onLogout={handleLogout}
        closesPendingCount={pendingClosesCount}
        dbStatus={dbStatus}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      {/* Supabase SQL Setup Reminder Banner */}
      {!dbStatus.initialized && !dismissDbBanner && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fbbf24' }}>
            <Database size={16} />
            <span>
              <strong>Base de Datos Supabase Conectada:</strong> Falta ejecutar el script SQL inicial para habilitar la sincronización en tiempo real en la nube entre múltiples dispositivos.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsSupabaseModalOpen(true)}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
            >
              <Sparkles size={13} />
              <span>Ver Script SQL Listo</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissDbBanner(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}
              title="Ocultar aviso"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <main className="container" style={{ flex: 1 }}>
        
        {/* PERFIL CAJERO */}
        {currentRole === 'cajero' && (
          <CashierView
            currentUser={currentUser}
            dailyCloses={dailyCloses}
            onAddDailyClose={handleAddDailyClose}
          />
        )}

        {/* PERFIL ADMINISTRADOR */}
        {currentRole === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Admin Header & Tabs */}
            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-light)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber-light)' }} />
                    PANEL DE CONTROL GERENCIAL • {activeCompany?.name}
                  </div>
                  <h1 style={{ fontSize: '1.6rem', marginTop: '0.15rem' }}>Administración Financiera</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setCurrentRole('cajero')}
                  >
                    Ver Vista de Cajero
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs-nav" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <button
                  type="button"
                  className={`tab-btn ${adminTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setAdminTab('dashboard')}
                >
                  <BarChart3 size={17} />
                  <span>Dashboard Ejecutivo</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${adminTab === 'closes' ? 'active' : ''}`}
                  onClick={() => setAdminTab('closes')}
                  style={{ position: 'relative' }}
                >
                  <Inbox size={17} />
                  <span>Arqueos de Cajeros</span>
                  {pendingClosesCount > 0 && (
                    <span
                      style={{
                        background: 'var(--rose-primary)',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '0.1rem 0.45rem',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        marginLeft: '0.3rem'
                      }}
                    >
                      {pendingClosesCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`tab-btn ${adminTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => setAdminTab('transactions')}
                >
                  <BookOpen size={17} />
                  <span>Libro de Movimientos</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${adminTab === 'suppliers' ? 'active' : ''}`}
                  onClick={() => setAdminTab('suppliers')}
                  style={{ position: 'relative' }}
                >
                  <Truck size={17} />
                  <span>Proveedores & Pagos</span>
                  {pendingInvoicesCount > 0 && (
                    <span
                      style={{
                        background: 'var(--rose-primary)',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '0.1rem 0.45rem',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        marginLeft: '0.3rem'
                      }}
                    >
                      {pendingInvoicesCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`tab-btn ${adminTab === 'categories' ? 'active' : ''}`}
                  onClick={() => setAdminTab('categories')}
                >
                  <Tag size={17} />
                  <span>Categorías</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminTab('users')}
                >
                  <Users size={17} />
                  <span>Personal & Accesos</span>
                </button>
              </div>
            </div>

            {/* Admin Tab Content */}
            {adminTab === 'dashboard' && (
              <AdminDashboard
                transactions={transactions}
                categories={categories}
              />
            )}

            {adminTab === 'closes' && (
              <DailyClosesReview
                dailyCloses={dailyCloses}
                onApproveClose={handleApproveClose}
                onDeleteClose={handleDeleteDailyClose}
              />
            )}

            {adminTab === 'transactions' && (
              <TransactionsTable
                transactions={transactions}
                categories={categories}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransaction}
              />
            )}

            {adminTab === 'suppliers' && (
              <SuppliersManager
                suppliers={suppliers}
                invoices={supplierInvoices}
                activeCompany={activeCompany}
                onAddSupplier={handleAddSupplier}
                onEditSupplier={handleEditSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onAddInvoice={handleAddSupplierInvoice}
                onDeleteInvoice={handleDeleteSupplierInvoice}
                onRegisterPayment={handleRegisterSupplierPayment}
              />
            )}

            {adminTab === 'categories' && (
              <CategoryManager
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {adminTab === 'users' && (
              <UserManager
                users={users}
                activeCompany={activeCompany}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        )}
      </main>

      {/* Security PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        currentPin={activeAdminPin}
      />

      {/* Export & Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        dailyCloses={dailyCloses}
        categories={categories}
        activeCompany={activeCompany}
        onRestoreData={(data) => {
          if (data.transactions) updateActiveCompanyData({ transactions: data.transactions });
          if (data.dailyCloses) updateActiveCompanyData({ dailyCloses: data.dailyCloses });
          if (data.categories) updateActiveCompanyData({ categories: data.categories });
        }}
        onResetDemo={handleResetDemo}
      />

      {/* Supabase Cloud Connection & SQL Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        dbStatus={dbStatus}
        onRefreshStatus={verifyDbStatus}
        sqlCode={SUPABASE_SCHEMA_SQL}
      />
    </div>
  );
}
