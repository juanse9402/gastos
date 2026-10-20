import React, { useState, useMemo } from 'react';
import { 
  Truck, Receipt, CreditCard, PlusCircle, Search, 
  DollarSign, Calendar, Building2, CheckCircle2, AlertCircle, 
  Phone, MessageCircle, FileText, X, ChevronRight, TrendingDown,
  Trash2, ExternalLink, Clock, ArrowRight, ShieldCheck, Banknote, Edit3
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function SuppliersManager({ 
  suppliers = [], 
  invoices = [], 
  activeCompany,
  onAddSupplier, 
  onEditSupplier,
  onDeleteSupplier,
  onAddInvoice,
  onDeleteInvoice,
  onRegisterPayment
}) {
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'invoices' | 'payments'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos'); // 'Todos' | 'Pendiente' | 'Pagado'

  // Modals state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // New Supplier form state
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState('Insumos y Materia Prima');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supNit, setSupNit] = useState('');
  const [supCity, setSupCity] = useState('');
  const [supError, setSupError] = useState('');
  const [supSuccess, setSupSuccess] = useState('');

  // Edit Supplier form state
  const [editSupName, setEditSupName] = useState('');
  const [editSupCategory, setEditSupCategory] = useState('');
  const [editSupContact, setEditSupContact] = useState('');
  const [editSupPhone, setEditSupPhone] = useState('');
  const [editSupNit, setEditSupNit] = useState('');
  const [editSupCity, setEditSupCity] = useState('');
  const [editSupError, setEditSupError] = useState('');
  const [editSupSuccess, setEditSupSuccess] = useState('');

  // New Invoice form state
  const [invSupplierId, setInvSupplierId] = useState('');
  const [invNumber, setInvNumber] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState('');
  const [invDescription, setInvDescription] = useState('');
  const [invTotal, setInvTotal] = useState('');
  const [invPaidImmediately, setInvPaidImmediately] = useState(false);
  const [invPaymentMethod, setInvPaymentMethod] = useState('Banco');
  const [invError, setInvError] = useState('');

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Banco'); // 'Efectivo' | 'Banco'
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState('');

  // Summary Metrics
  const totalDebt = useMemo(() => {
    return invoices
      .filter(inv => inv.estado !== 'Pagado')
      .reduce((sum, inv) => sum + (Number(inv.saldoPendiente) || 0), 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    let sum = 0;
    invoices.forEach(inv => {
      (inv.pagos || []).forEach(p => {
        sum += Number(p.monto || 0);
      });
    });
    return sum;
  }, [invoices]);

  const pendingInvoices = useMemo(() => {
    return invoices.filter(inv => inv.estado !== 'Pagado');
  }, [invoices]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const match = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (s.contacto && s.contacto.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (s.categoria && s.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
      return match;
    });
  }, [suppliers, searchTerm]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = statusFilter === 'Todos' || inv.estado === statusFilter;
      const matchSearch = inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, searchTerm]);

  // All Payments flat list
  const allPayments = useMemo(() => {
    const list = [];
    invoices.forEach(inv => {
      (inv.pagos || []).forEach(p => {
        list.push({
          ...p,
          invoiceId: inv.id,
          numeroFactura: inv.numeroFactura,
          supplierName: inv.supplierName
        });
      });
    });
    return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [invoices]);

  // Handlers
  const handleOpenAddSupplier = () => {
    setSupName('');
    setSupCategory('Insumos y Materia Prima');
    setSupContact('');
    setSupPhone('');
    setSupNit('');
    setSupCity('Popayán');
    setSupError('');
    setSupSuccess('');
    setIsAddSupplierOpen(true);
  };

  const handleSupplierSubmit = (e) => {
    e.preventDefault();
    setSupError('');

    if (!supName.trim()) {
      setSupError('El nombre del proveedor es obligatorio.');
      return;
    }

    const newSupplier = {
      id: `supp-${Date.now()}`,
      companyId: activeCompany?.id,
      name: supName.trim(),
      categoria: supCategory,
      contacto: supContact.trim(),
      telefono: supPhone.trim(),
      nit: supNit.trim(),
      ciudad: supCity.trim(),
      saldoPendiente: 0
    };

    onAddSupplier(newSupplier);
    setSupSuccess(`¡Proveedor "${newSupplier.name}" registrado con éxito!`);
    setTimeout(() => {
      setIsAddSupplierOpen(false);
    }, 900);
  };

  const handleOpenEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setEditSupName(sup.name || '');
    setEditSupCategory(sup.categoria || 'Insumos y Materia Prima');
    setEditSupContact(sup.contacto || '');
    setEditSupPhone(sup.telefono || '');
    setEditSupNit(sup.nit || '');
    setEditSupCity(sup.ciudad || 'Popayán');
    setEditSupError('');
    setEditSupSuccess('');
  };

  const handleEditSupplierSubmit = (e) => {
    e.preventDefault();
    setEditSupError('');
    if (!editSupName.trim()) {
      setEditSupError('El nombre del proveedor es obligatorio.');
      return;
    }
    if (onEditSupplier && editingSupplier) {
      onEditSupplier(editingSupplier.id, {
        name: editSupName.trim(),
        categoria: editSupCategory,
        contacto: editSupContact.trim(),
        telefono: editSupPhone.trim(),
        nit: editSupNit.trim(),
        ciudad: editSupCity.trim()
      });
      setEditSupSuccess('¡Proveedor actualizado con éxito!');
      setTimeout(() => {
        setEditingSupplier(null);
      }, 700);
    }
  };

  const handleOpenAddInvoice = (preselectedSupplierId = '') => {
    setInvSupplierId(preselectedSupplierId || (suppliers[0]?.id || ''));
    setInvNumber(`FAC-${Math.floor(1000 + Math.random() * 9000)}`);
    setInvDate(new Date().toISOString().split('T')[0]);
    
    // Default due date: +15 days
    const due = new Date();
    due.setDate(due.getDate() + 15);
    setInvDueDate(due.toISOString().split('T')[0]);

    setInvDescription('');
    setInvTotal('');
    setInvPaidImmediately(false);
    setInvPaymentMethod('Banco');
    setInvError('');
    setIsAddInvoiceOpen(true);
  };

  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    setInvError('');

    const numericTotal = parseFloat(invTotal);
    if (!numericTotal || numericTotal <= 0) {
      setInvError('Ingresa un monto total válido para la factura.');
      return;
    }

    const supplier = suppliers.find(s => s.id === invSupplierId);
    if (!supplier) {
      setInvError('Selecciona un proveedor válido.');
      return;
    }

    const newInvoice = {
      id: `inv-${Date.now()}`,
      companyId: activeCompany?.id,
      supplierId: supplier.id,
      supplierName: supplier.name,
      numeroFactura: invNumber.trim() || 'S/N',
      fecha: invDate,
      fechaVencimiento: invDueDate || invDate,
      descripcion: invDescription.trim() || `Compra a ${supplier.name}`,
      total: numericTotal,
      saldoPendiente: invPaidImmediately ? 0 : numericTotal,
      estado: invPaidImmediately ? 'Pagado' : 'Pendiente',
      pagos: invPaidImmediately ? [
        {
          id: `pay-${Date.now()}`,
          fecha: invDate,
          monto: numericTotal,
          metodo: invPaymentMethod,
          notas: 'Pago de contado al recibir factura'
        }
      ] : []
    };

    onAddInvoice(newInvoice, invPaidImmediately ? {
      monto: numericTotal,
      metodo: invPaymentMethod,
      fecha: invDate,
      supplierName: supplier.name,
      numeroFactura: newInvoice.numeroFactura,
      categoria: supplier.categoria || 'Insumos y Materia Prima'
    } : null);

    setIsAddInvoiceOpen(false);
  };

  const handleOpenPayment = (supplier = null, invoice = null) => {
    setSelectedSupplierForPayment(supplier);
    setSelectedInvoiceForPayment(invoice);
    setPayAmount(invoice ? invoice.saldoPendiente.toString() : (supplier ? supplier.saldoPendiente.toString() : ''));
    setPayMethod('Banco');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayNotes(invoice ? `Pago factura ${invoice.numeroFactura}` : `Abono a cuenta ${supplier?.name || ''}`);
    setPayError('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPayError('');

    const numericAmount = parseFloat(payAmount);
    if (!numericAmount || numericAmount <= 0) {
      setPayError('Ingresa un monto de pago válido.');
      return;
    }

    const targetSupplier = selectedSupplierForPayment || 
      (selectedInvoiceForPayment ? suppliers.find(s => s.id === selectedInvoiceForPayment.supplierId) : null);

    if (!targetSupplier) {
      setPayError('No se encontró el proveedor a abonar.');
      return;
    }

    onRegisterPayment({
      supplierId: targetSupplier.id,
      supplierName: targetSupplier.name,
      invoiceId: selectedInvoiceForPayment?.id || null,
      numeroFactura: selectedInvoiceForPayment?.numeroFactura || 'Abono General',
      monto: numericAmount,
      metodo: payMethod,
      fecha: payDate,
      notas: payNotes.trim(),
      categoria: targetSupplier.categoria || 'Insumos y Materia Prima'
    });

    setIsPaymentModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Header */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-light)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Truck size={18} />
            MÓDULO DE PROVEEDORES & COMPRAS • {activeCompany?.name}
          </div>
          <h2 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0.15rem' }}>Cuentas por Pagar e Insumos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Controla compras de materia prima, facturas a crédito y salidas de dinero por Efectivo o Banco.
          </p>
        </div>

        <div className="horizontal-scroller" style={{ alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleOpenAddSupplier}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
          >
            <PlusCircle size={15} />
            <span>+ Nuevo Proveedor</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleOpenAddInvoice()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', borderColor: 'rgba(59, 130, 246, 0.4)', color: 'var(--blue-light)' }}
          >
            <Receipt size={15} />
            <span>+ Factura</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenPayment()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.15rem' }}
          >
            <CreditCard size={15} />
            <span>💳 Pagar / Abonar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '1rem' }}>
        
        {/* Total Deuda */}
        <div className="glass-card" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid var(--rose-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Deuda Total a Proveedores
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: totalDebt > 0 ? '#fb7185' : '#34d399', marginTop: '0.25rem' }}>
                {formatCurrency(totalDebt)}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            {pendingInvoices.length} {pendingInvoices.length === 1 ? 'factura pendiente' : 'facturas pendientes'} de pago
          </div>
        </div>

        {/* Total Pagado */}
        <div className="glass-card" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Pagado a Proveedores
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--emerald-light)', marginTop: '0.25rem' }}>
                {formatCurrency(totalPaid)}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            {allPayments.length} abonos / pagos registrados
          </div>
        </div>

        {/* Proveedores Activos */}
        <div className="glass-card" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid var(--blue-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Proveedores Registrados
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--blue-light)', marginTop: '0.25rem' }}>
                {suppliers.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>empresas</span>
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Insumos, carnes, papas, bebidas, empaques
          </div>
        </div>

      </div>

      {/* Tabs & Search Navigation Bar */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="horizontal-scroller" style={{ gap: '0.5rem', width: '100%', maxWidth: '100%' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('suppliers')}
            style={{ borderRadius: '10px', padding: '0.45rem 0.9rem' }}
          >
            <Building2 size={14} />
            <span>Directorio de Proveedores ({suppliers.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'invoices' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('invoices')}
            style={{ borderRadius: '10px', padding: '0.45rem 0.9rem', position: 'relative' }}
          >
            <Receipt size={14} />
            <span>Facturas & Cuentas por Pagar</span>
            {pendingInvoices.length > 0 && (
              <span style={{ background: 'var(--rose-primary)', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', marginLeft: '0.35rem' }}>
                {pendingInvoices.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('payments')}
            style={{ borderRadius: '10px', padding: '0.45rem 0.9rem' }}
          >
            <CreditCard size={14} />
            <span>Historial de Pagos ({allPayments.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar proveedor o factura..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* VIEW 1: DIRECTORIO DE PROVEEDORES */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {filteredSuppliers.map(sup => {
            const hasDebt = sup.saldoPendiente > 0;
            const cleanPhone = sup.telefono ? sup.telefono.replace(/\D/g, '') : '';

            return (
              <div 
                key={sup.id} 
                className="glass-card" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${hasDebt ? 'var(--amber-primary)' : 'var(--emerald-primary)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--amber-light)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {sup.categoria}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {sup.nit && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>NIT: {sup.nit}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditSupplier(sup)}
                        title="Editar datos del proveedor"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: 'var(--amber-light)',
                          cursor: 'pointer',
                          padding: '0.2rem 0.4rem',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <Edit3 size={12} />
                      </button>
                      {onDeleteSupplier && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar al proveedor "${sup.name}"? Los datos de este proveedor serán eliminados.`)) {
                              onDeleteSupplier(sup.id);
                            }
                          }}
                          title="Eliminar Proveedor (Prueba o Error)"
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            borderRadius: '6px',
                            color: 'var(--rose-light)',
                            cursor: 'pointer',
                            padding: '0.2rem 0.4rem',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0.35rem 0' }}>
                    {sup.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.75rem 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {sup.contacto && (
                      <div><strong>Contacto:</strong> {sup.contacto}</div>
                    )}
                    {sup.telefono && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={13} style={{ color: 'var(--emerald-light)' }} />
                        <span>{sup.telefono}</span>
                        {cleanPhone && (
                          <a 
                            href={`https://wa.me/57${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              color: '#34d399', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.2rem', 
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              background: 'rgba(16, 185, 129, 0.12)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '6px'
                            }}
                            title="Abrir WhatsApp para pedir insumos"
                          >
                            <MessageCircle size={12} />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                    {sup.ciudad && (
                      <div><strong>Ubicación:</strong> {sup.ciudad}</div>
                    )}
                  </div>
                </div>

                {/* Saldo Pendiente & Actions */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Saldo por Pagar:</span>
                    <span style={{ 
                      fontSize: '1.05rem', 
                      fontWeight: 800, 
                      color: hasDebt ? '#fb7185' : '#34d399' 
                    }}>
                      {hasDebt ? formatCurrency(sup.saldoPendiente) : 'Al Día ($0)'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenAddInvoice(sup.id)}
                      style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                    >
                      <Receipt size={13} />
                      <span>+ Factura</span>
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm ${hasDebt ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleOpenPayment(sup, null)}
                      style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                    >
                      <CreditCard size={13} />
                      <span>Pagar / Abonar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: FACTURAS & CUENTAS POR PAGAR */}
      {activeTab === 'invoices' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filtrar Estado:</span>
              {['Todos', 'Pendiente', 'Pagado'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px' }}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenAddInvoice()}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              <PlusCircle size={14} />
              <span>+ Nueva Factura</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Fecha / Vencimiento</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Proveedor</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>N° Factura</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Descripción / Insumos</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Total</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Saldo Pendiente</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Estado</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const isPaid = inv.estado === 'Pagado';
                  const isPartial = inv.estado === 'Parcial';

                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem' }}>
                        <div>{formatDate(inv.fecha)}</div>
                        <div style={{ fontSize: '0.72rem', color: isPaid ? 'var(--text-dim)' : 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={11} />
                          <span>Vence: {formatDate(inv.fechaVencimiento)}</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                        {inv.supplierName}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {inv.numeroFactura}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                        {inv.descripcion}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                        {formatCurrency(inv.total)}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, fontSize: '0.9rem', color: isPaid ? '#34d399' : '#fb7185' }}>
                        {formatCurrency(inv.saldoPendiente)}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: isPaid ? 'rgba(16, 185, 129, 0.15)' : (isPartial ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)'),
                          color: isPaid ? '#34d399' : (isPartial ? 'var(--amber-light)' : '#fb7185'),
                          border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : (isPartial ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)')}`
                        }}>
                          {inv.estado}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                          {!isPaid ? (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenPayment(null, inv)}
                              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                            >
                              <CreditCard size={12} />
                              <span>Pagar</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Saldada</span>
                          )}

                          {onDeleteInvoice && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Estás seguro de eliminar la factura "${inv.numeroFactura}"? Si fue una factura de prueba o errónea, esto recalculará y descontará el saldo pendiente.`)) {
                                  onDeleteInvoice(inv.id);
                                }
                              }}
                              title="Eliminar factura (error o prueba)"
                              style={{
                                background: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.25)',
                                color: 'var(--rose-light)',
                                borderRadius: '6px',
                                padding: '0.3rem 0.45rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: HISTORIAL DE PAGOS REALIZADOS */}
      {activeTab === 'payments' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Historial de Salidas de Dinero por Pagos a Proveedores</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Fecha de Pago</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Proveedor</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Factura Asociada</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Método de Salida</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Notas / Comprobante</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Monto Pagado</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map((p, idx) => {
                  const isCash = p.metodo === 'Efectivo';

                  return (
                    <tr key={p.id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem' }}>
                        {formatDate(p.fecha)}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                        {p.supplierName}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {p.numeroFactura}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isCash ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: isCash ? '#34d399' : 'var(--blue-light)',
                          border: `1px solid ${isCash ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}>
                          {isCash ? <Banknote size={12} /> : <CreditCard size={12} />}
                          {isCash ? 'Efectivo (Caja)' : 'Banco (Transferencia/Nequi)'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {p.notas || 'Sin notas'}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', color: 'var(--emerald-light)' }}>
                        {formatCurrency(p.monto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NUEVO PROVEEDOR */}
      {isAddSupplierOpen && (
        <div className="modal-overlay" onClick={() => setIsAddSupplierOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={20} style={{ color: 'var(--amber-light)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Registrar Nuevo Proveedor</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {supError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose-primary)', color: '#fca5a5', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {supError}
              </div>
            )}

            {supSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-primary)', color: 'var(--emerald-light)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {supSuccess}
              </div>
            )}

            <form onSubmit={handleSupplierSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Proveedor / Razón Social</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Distribuidora Papas Andina, Postobón"
                  value={supName}
                  onChange={e => setSupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría de Insumos que Provee</label>
                <select
                  className="form-control"
                  value={supCategory}
                  onChange={e => setSupCategory(e.target.value)}
                >
                  <option value="Insumos / Papa">🥔 Insumos / Papa & Aceites</option>
                  <option value="Carnes & Toppings">🥩 Carnes, Tocineta & Salchichas</option>
                  <option value="Gaseosas & Bebidas">🥤 Gaseosas, Jugos & Cervezas</option>
                  <option value="Salsas & Quesos">🧀 Salsas Especiales & Quesos</option>
                  <option value="Empaques & Desechables">📦 Empaques, Cajas & Vasos</option>
                  <option value="Servicios Públicos & Gas">💡 Gas, Luz, Agua o Mantenimiento</option>
                  <option value="Insumos y Materia Prima">📦 Insumos Generales</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Persona de Contacto</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Carlos Ruiz"
                    value={supContact}
                    onChange={e => setSupContact(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Ej. 3124567890"
                    value={supPhone}
                    onChange={e => setSupPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">NIT / Cédula</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. 900.123.456-1"
                    value={supNit}
                    onChange={e => setSupNit(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Popayán"
                    value={supCity}
                    onChange={e => setSupCity(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddSupplierOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PROVEEDOR */}
      {editingSupplier && (
        <div className="modal-overlay" onClick={() => setEditingSupplier(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} style={{ color: 'var(--amber-light)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Editar Proveedor</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {editSupError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose-primary)', color: '#fca5a5', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {editSupError}
              </div>
            )}

            {editSupSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-primary)', color: 'var(--emerald-light)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {editSupSuccess}
              </div>
            )}

            <form onSubmit={handleEditSupplierSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Proveedor / Razón Social</label>
                <input
                  type="text"
                  className="form-control"
                  value={editSupName}
                  onChange={e => setEditSupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría de Insumo</label>
                <select
                  className="form-control"
                  value={editSupCategory}
                  onChange={e => setEditSupCategory(e.target.value)}
                >
                  <option value="Papa y Tubérculos">Papa y Tubérculos</option>
                  <option value="Carnes & Embutidos">Carnes & Embutidos</option>
                  <option value="Bebidas y Licores">Bebidas y Licores</option>
                  <option value="Salsas & Condimentos">Salsas & Condimentos</option>
                  <option value="Empaques & Desechables">Empaques & Desechables</option>
                  <option value="Aseo y Mantenimiento">Aseo y Mantenimiento</option>
                  <option value="Servicios y Arriendos">Servicios y Arriendos</option>
                  <option value="Insumos y Materia Prima">Insumos y Materia Prima (General)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Contacto / Vendedor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editSupContact}
                    onChange={e => setEditSupContact(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={editSupPhone}
                    onChange={e => setEditSupPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">NIT / Cédula</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editSupNit}
                    onChange={e => setEditSupNit(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editSupCity}
                    onChange={e => setEditSupCity(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingSupplier(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR COMPRA / FACTURA */}
      {isAddInvoiceOpen && (
        <div className="modal-overlay" onClick={() => setIsAddInvoiceOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={20} style={{ color: 'var(--blue-light)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Registrar Compra / Factura</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddInvoiceOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {invError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose-primary)', color: '#fca5a5', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {invError}
              </div>
            )}

            <form onSubmit={handleInvoiceSubmit}>
              <div className="form-group">
                <label className="form-label">Proveedor</label>
                <select
                  className="form-control"
                  value={invSupplierId}
                  onChange={e => setInvSupplierId(e.target.value)}
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.categoria})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">N° Factura o Remisión</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. FAC-1024"
                    value={invNumber}
                    onChange={e => setInvNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha de Compra</label>
                  <input
                    type="date"
                    className="form-control"
                    value={invDate}
                    onChange={e => setInvDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Insumos / Descripción de la Compra</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. 10 bultos de papa pastusa, aceite vegetal"
                  value={invDescription}
                  onChange={e => setInvDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Monto Total ($ COP)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={invTotal}
                    onChange={e => setInvTotal(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha Límite Vencimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={invDueDate}
                    onChange={e => setInvDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Contado vs Crédito */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={invPaidImmediately}
                    onChange={e => setInvPaidImmediately(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>¿Pagada de contado inmediatamente al recibirla?</span>
                </label>

                {invPaidImmediately && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Método de Salida de Dinero:</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${invPaymentMethod === 'Efectivo' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setInvPaymentMethod('Efectivo')}
                        style={{ flex: 1, padding: '0.35rem' }}
                      >
                        💵 Efectivo (Caja)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${invPaymentMethod === 'Banco' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setInvPaymentMethod('Banco')}
                        style={{ flex: 1, padding: '0.35rem' }}
                      >
                        🏦 Banco (Transferencia/Nequi)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddInvoiceOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Guardar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR PAGO / ABONO A PROVEEDOR */}
      {isPaymentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} style={{ color: 'var(--emerald-light)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Registrar Pago a Proveedor</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {payError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose-primary)', color: '#fca5a5', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {payError}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit}>
              {/* Proveedor o Factura Seleccionada */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Destinatario del Pago
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
                  {selectedInvoiceForPayment ? selectedInvoiceForPayment.supplierName : (selectedSupplierForPayment ? selectedSupplierForPayment.name : 'Abono a Proveedor')}
                </div>
                {selectedInvoiceForPayment && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--emerald-light)', marginTop: '0.2rem' }}>
                    Factura: {selectedInvoiceForPayment.numeroFactura} • Saldo Pendiente: {formatCurrency(selectedInvoiceForPayment.saldoPendiente)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Monto a Pagar ($ COP)</label>
                <input
                  type="number"
                  className="form-control"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="0"
                  required
                  style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-light)' }}
                />
              </div>

              {/* Origen del Dinero: Conciliación Efectivo vs Bancos */}
              <div className="form-group">
                <label className="form-label">¿De dónde sale el dinero? (Conciliación)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${payMethod === 'Efectivo' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPayMethod('Efectivo')}
                    style={{ padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Banknote size={15} />
                    <span>💵 Caja Efectivo</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${payMethod === 'Banco' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPayMethod('Banco')}
                    style={{ padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <CreditCard size={15} />
                    <span>🏦 Banco / Nequi</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                  {payMethod === 'Efectivo' ? 'Descontará del dinero en efectivo de la caja menor.' : 'Descontará de la cuenta bancaria / transferencias digitales.'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Fecha del Pago</label>
                  <input
                    type="date"
                    className="form-control"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Comprobante / Referencia</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. N° Aprobación Nequi"
                    value={payNotes}
                    onChange={e => setPayNotes(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-emerald"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirmar & Registrar Egreso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
