import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, Trash2, Edit3, ArrowUpDown, 
  Calendar, Tag, DollarSign, Check, X, Download 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionsTable({ transactions, categories, onAddTransaction, onDeleteTransaction, onEditTransaction }) {
  const todayStr = new Date().toISOString().split('T')[0];

  // New transaction form state
  const [fecha, setFecha] = useState(todayStr);
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('Gasto');
  const [categoria, setCategoria] = useState('Papa Casteblanco');
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('Banco');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterMetodo, setFilterMetodo] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Filtered categories according to selected Tipo
  const availableCategoriesForForm = useMemo(() => {
    return categories.filter(c => c.type === tipo);
  }, [categories, tipo]);

  // Handle Tipo change in form
  const handleTipoChange = (newTipo) => {
    setTipo(newTipo);
    const firstCat = categories.find(c => c.type === newTipo);
    if (firstCat) setCategoria(firstCat.name);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const numMonto = parseFloat(monto);
    if (!numMonto || numMonto <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    if (!descripcion.trim()) {
      alert('Por favor ingresa una descripción.');
      return;
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      fecha,
      descripcion: descripcion.trim(),
      tipo,
      categoria,
      monto: numMonto,
      metodo
    };

    onAddTransaction(newTx);
    setDescripcion('');
    setMonto('');
  };

  // Start edit
  const startEdit = (tx) => {
    setEditingId(tx.id);
    setEditFormData({ ...tx });
  };

  const saveEdit = () => {
    onEditTransaction(editingId, editFormData);
    setEditingId(null);
  };

  // Filter and Sort logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.categoria.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTipo = filterTipo === 'all' || t.tipo === filterTipo;
      const matchesMetodo = filterMetodo === 'all' || t.metodo === filterMetodo;
      const matchesCat = filterCat === 'all' || t.categoria === filterCat;

      return matchesSearch && matchesTipo && matchesMetodo && matchesCat;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'fecha') {
        comparison = a.fecha.localeCompare(b.fecha);
      } else if (sortBy === 'monto') {
        comparison = a.monto - b.monto;
      } else if (sortBy === 'categoria') {
        comparison = a.categoria.localeCompare(b.categoria);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [transactions, searchQuery, filterTipo, filterMetodo, filterCat, sortBy, sortOrder]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Registration Form (Replacing Excel REGISTRAR Macro) */}
      <div className="glass-card" style={{ border: '1px solid var(--border-card)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(17, 24, 39, 0.8))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--amber-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} />
              Registrar Nuevo Movimiento (Ingreso o Gasto)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Reemplazo seguro del formulario y macro de Excel. Guarda al instante sin riesgo de romper fórmulas.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-control"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                value={tipo}
                onChange={e => handleTipoChange(e.target.value)}
              >
                <option value="Gasto">Gasto (Egreso)</option>
                <option value="Ingreso">Ingreso</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                className="form-control"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
              >
                {availableCategoriesForForm.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monto ($ COP)</label>
              <input
                type="number"
                step="any"
                className="form-control"
                style={{ fontWeight: 'bold' }}
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="$ 0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Canal / Medio de Pago</label>
              <select
                className="form-control"
                value={metodo}
                onChange={e => setMetodo(e.target.value)}
              >
                <option value="Banco">🏦 Banco (Transferencia / Datáfono)</option>
                <option value="Efectivo">💵 Efectivo (Caja Física)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Descripción del Concepto</label>
              <input
                type="text"
                className="form-control"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Ej. Compra 10 bultos de Papa Casteblanco o Venta fin de semana"
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button
              type="submit"
              className={tipo === 'Ingreso' ? 'btn btn-emerald' : 'btn btn-primary'}
              style={{ padding: '0.75rem 2rem' }}
            >
              <Plus size={18} />
              Registrar {tipo}
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Buscar por descripción o categoría..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tipo Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Tipo:</span>
            <button
              type="button"
              className={`btn btn-sm ${filterTipo === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterTipo('all')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTipo === 'Ingreso' ? 'btn-emerald' : 'btn-outline'}`}
              onClick={() => setFilterTipo('Ingreso')}
            >
              Ingresos
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTipo === 'Gasto' ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => setFilterTipo('Gasto')}
            >
              Gastos
            </button>
          </div>

          {/* Método Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Canal:</span>
            <button
              type="button"
              className={`btn btn-sm ${filterMetodo === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterMetodo('all')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterMetodo === 'Efectivo' ? 'btn-emerald' : 'btn-outline'}`}
              onClick={() => setFilterMetodo('Efectivo')}
            >
              💵 Efectivo
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterMetodo === 'Banco' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterMetodo('Banco')}
            >
              🏦 Banco
            </button>
          </div>

          {/* Category Filter */}
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Mostrando <strong style={{ color: '#fff' }}>{filteredTransactions.length}</strong> movimientos
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('fecha'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Fecha <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy('categoria'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Categoría <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Método</th>
                <th style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => { setSortBy('monto'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                    Monto <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isEditing = editingId === tx.id;

                  if (isEditing) {
                    return (
                      <tr key={tx.id} style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
                        <td>
                          <input
                            type="date"
                            className="form-control"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                            value={editFormData.fecha}
                            onChange={e => setEditFormData({ ...editFormData, fecha: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                            value={editFormData.descripcion}
                            onChange={e => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            className="form-control"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                            value={editFormData.tipo}
                            onChange={e => setEditFormData({ ...editFormData, tipo: e.target.value })}
                          >
                            <option value="Gasto">Gasto</option>
                            <option value="Ingreso">Ingreso</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-control"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                            value={editFormData.categoria}
                            onChange={e => setEditFormData({ ...editFormData, categoria: e.target.value })}
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-control"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                            value={editFormData.metodo}
                            onChange={e => setEditFormData({ ...editFormData, metodo: e.target.value })}
                          >
                            <option value="Banco">🏦 Banco</option>
                            <option value="Efectivo">💵 Efectivo</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', textAlign: 'right', fontWeight: 'bold' }}
                            value={editFormData.monto}
                            onChange={e => setEditFormData({ ...editFormData, monto: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                            <button type="button" className="btn btn-emerald btn-sm" onClick={saveEdit}>
                              <Check size={14} />
                            </button>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.fecha)}</td>
                      <td style={{ fontWeight: 600 }}>{tx.descripcion}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: tx.tipo === 'Ingreso' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: tx.tipo === 'Ingreso' ? 'var(--emerald-light)' : 'var(--rose-light)'
                        }}>
                          {tx.tipo}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {tx.categoria}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: tx.metodo === 'Efectivo' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                          color: tx.metodo === 'Efectivo' ? 'var(--emerald-light)' : 'var(--blue-primary)',
                          border: tx.metodo === 'Efectivo' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)'
                        }}>
                          {tx.metodo === 'Efectivo' ? '💵 Efectivo' : '🏦 Banco'}
                        </span>
                      </td>
                      <td style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1rem',
                        color: tx.tipo === 'Ingreso' ? 'var(--emerald-light)' : 'var(--text-main)'
                      }}>
                        {tx.tipo === 'Ingreso' ? '+' : '-'} {formatCurrency(tx.monto)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => startEdit(tx)}
                            title="Editar transacción"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar el movimiento "${tx.descripcion}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title="Eliminar transacción"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
