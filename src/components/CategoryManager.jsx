import React, { useState } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function CategoryManager({ categories, onAddCategory, onDeleteCategory }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Gasto');
  const [color, setColor] = useState('#f59e0b');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      id: `cat-${Date.now()}`,
      name: name.trim(),
      type,
      color
    });

    setName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem' }}>Administración de Categorías de La Papería</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configura y personaliza los conceptos de gastos e ingresos del negocio.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Create form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-light)' }}>
            <Plus size={18} />
            Crear Nueva Categoría
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre del Rubro o Insumo</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Salsas Especiales, Empaques, Aceite"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  className="form-control"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Gasto">Gasto</option>
                  <option value="Ingreso">Ingreso</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Color Distintivo</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    style={{ width: '42px', height: '42px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                    value={color}
                    onChange={e => setColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} />
                Agregar Categoría
              </button>
            </div>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={18} style={{ color: 'var(--amber-light)' }} />
            Categorías Existentes ({categories.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color || '#f59e0b' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    background: cat.type === 'Ingreso' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: cat.type === 'Ingreso' ? 'var(--emerald-light)' : 'var(--rose-light)'
                  }}>
                    {cat.type}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--text-dim)', padding: '0.3rem 0.5rem' }}
                  onClick={() => {
                    if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
                      onDeleteCategory(cat.id);
                    }
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
