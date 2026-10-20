import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Eye, ArrowRight, ShieldCheck, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function DailyClosesReview({ dailyCloses, onApproveClose, onRejectClose, onDeleteClose }) {
  const [expandedCloseId, setExpandedCloseId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedCloseId(prev => prev === id ? null : id);
  };

  const pendingCount = dailyCloses.filter(c => c.estadoRevision !== 'Aprobado').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Revisión de Arqueos & Cierres Diarios</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Audita los cierres enviados por los cajeros y aprueba para consolidar en las finanzas generales.
          </p>
        </div>

        {pendingCount > 0 && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '20px',
            padding: '0.4rem 1rem',
            color: 'var(--amber-light)',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Clock size={16} />
            {pendingCount} {pendingCount === 1 ? 'cierre pendiente' : 'cierres pendientes'} de aprobación
          </div>
        )}
      </div>

      <div className="glass-card">
        {dailyCloses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
            No hay cierres de caja registrados todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dailyCloses.map(c => {
              const isExpanded = expandedCloseId === c.id;
              const isApproved = c.estadoRevision === 'Aprobado';

              return (
                <div
                  key={c.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1.25rem',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: c.descuadre === 0 ? 'rgba(59, 130, 246, 0.15)' : c.descuadre > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: c.descuadre === 0 ? 'var(--blue-primary)' : c.descuadre > 0 ? 'var(--emerald-light)' : 'var(--rose-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}>
                        {c.descuadre === 0 ? '✓' : c.descuadre > 0 ? '▲' : '▼'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{formatDate(c.fecha)}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>({c.hora})</span>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '8px',
                            background: 'var(--bg-input)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                          }}>
                            {c.turno}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Cajero: <strong style={{ color: 'var(--text-main)' }}>{c.cajero}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Summary values */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>CAJA Esperada</div>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(c.cajaEsperada)}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Justificado</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(c.totalCalculado)}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Descuadre</div>
                        <span className={`badge-cuadre ${c.descuadre > 0 ? 'sobra' : c.descuadre < 0 ? 'falta' : 'exacto'}`}>
                          {c.estadoCuadre} {c.descuadre !== 0 && `(${formatCurrency(Math.abs(c.descuadre))})`}
                        </span>
                      </div>

                      {/* Approval badge / buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isApproved ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'var(--emerald-light)',
                            background: 'rgba(16, 185, 129, 0.15)',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            <CheckCircle2 size={15} />
                            Aprobado & Consolidado
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-emerald btn-sm"
                            onClick={() => onApproveClose(c.id)}
                            title="Aprobar e integrar automáticamente en las finanzas del restaurante"
                          >
                            <ShieldCheck size={15} />
                            Aprobar Cierre
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => toggleExpand(c.id)}
                          style={{ padding: '0.4rem 0.6rem' }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {onDeleteClose && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar el arqueo del cajero ${c.cajero} (${formatDate(c.fecha)})? Útil si fue de prueba o un error.`)) {
                                onDeleteClose(c.id);
                              }
                            }}
                            title="Eliminar este arqueo (prueba o error)"
                            style={{ padding: '0.4rem 0.6rem', color: 'var(--rose-light)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '1.25rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                      gap: '1rem',
                      fontSize: '0.85rem',
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Efectivo Físico</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--emerald-light)', fontSize: '1rem' }}>
                          {formatCurrency(c.efectivo)}
                        </div>
                        {c.desgloseBilletes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                            {Object.entries(c.desgloseBilletes)
                              .filter(([_, count]) => count > 0)
                              .map(([k, count]) => `${count}x $${k}`)
                              .join(' • ')}
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Banco / Transferencias</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--blue-primary)', fontSize: '1rem' }}>
                          {formatCurrency(c.banco)}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Gastos Menores del Turno</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          {c.gastos > 0 ? formatCurrency(c.gastos) : '$ -'}
                        </div>
                        {c.gastosDetalle && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {c.gastosDetalle}
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Nómina Pagada de Caja</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--purple-primary)', fontSize: '1rem' }}>
                          {c.nomina > 0 ? formatCurrency(c.nomina) : '$ -'}
                        </div>
                        {c.nominaDetalle && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {c.nominaDetalle}
                          </div>
                        )}
                      </div>

                      {c.notas && (
                        <div style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                          <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>Observaciones del cajero: </span>
                          <span style={{ color: 'var(--text-main)' }}>{c.notas}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
