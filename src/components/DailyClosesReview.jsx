import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Eye, ArrowRight, ShieldCheck, ChevronDown, ChevronUp, Trash2, Bike } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import DailySummarySheet from './DailySummarySheet';

export default function DailyClosesReview({ dailyCloses, onApproveClose, onRejectClose, onDeleteClose }) {
  const [expandedCloseId, setExpandedCloseId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedCloseId(prev => prev === id ? null : id);
  };

  const pendingCount = dailyCloses.filter(c => c.estadoRevision !== 'Aprobado').length;
  const closesWithDomiciliario = dailyCloses.filter(c => Number(c.pagoDomiciliario) > 0);
  const totalHistoricoDomiciliario = closesWithDomiciliario.reduce((acc, c) => acc + (Number(c.pagoDomiciliario) || 0), 0);

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

      {/* Control Histórico Informativo de Domiciliarios (No suma a caja ni gastos) */}
      <div className="glass-card" style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(17, 24, 39, 0.7))',
        border: '1px dashed rgba(245, 158, 11, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--amber-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Bike size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                Control Histórico de Pagos a Domiciliario
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.12rem 0.5rem',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                textTransform: 'uppercase'
              }}>
                Informativo • No suma al total
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Registro de control por turno ({closesWithDomiciliario.length} {closesWithDomiciliario.length === 1 ? 'turno registrado' : 'turnos registrados'}). No afecta el cuadre de caja ni se descuenta de las finanzas generales.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Acumulado Histórico Domiciliarios
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24' }}>
            {formatCurrency(totalHistoricoDomiciliario)}
          </div>
        </div>
      </div>

      {/* Vista Total del Día Tipo Resumen (Solo visualización, idéntica al formato Excel) */}
      <DailySummarySheet
        dailyCloses={dailyCloses}
        title="Vista Total del Día (Resumen General)"
      />

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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Top Row: Cashier Info & Date */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: c.descuadre === 0 ? 'rgba(59, 130, 246, 0.15)' : c.descuadre > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: c.descuadre === 0 ? 'var(--blue-primary)' : c.descuadre > 0 ? 'var(--emerald-light)' : 'var(--rose-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.15rem',
                          flexShrink: 0
                        }}>
                          {c.descuadre === 0 ? '✓' : c.descuadre > 0 ? '▲' : '▼'}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{formatDate(c.fecha)}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>({c.hora})</span>
                            <span style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '8px',
                              background: 'var(--bg-input)',
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              fontWeight: 600
                            }}>
                              {c.turno}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Cajero: <strong style={{ color: 'var(--text-main)' }}>{c.cajero}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Approval Status Badge on Top Right */}
                      <div>
                        {isApproved ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'var(--emerald-light)',
                            background: 'rgba(16, 185, 129, 0.15)',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            <CheckCircle2 size={14} />
                            Aprobado & Consolidado
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'var(--amber-light)',
                            background: 'rgba(245, 158, 11, 0.15)',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            <Clock size={14} />
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Metrics Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 105px), 1fr))',
                      gap: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Caja Esperada</div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', marginTop: '0.15rem' }}>{formatCurrency(c.cajaEsperada)}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Justificado</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '0.15rem' }}>{formatCurrency(c.totalCalculado)}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--amber-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Bike size={12} />
                          <span>Domiciliario (No suma)</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.92rem', marginTop: '0.15rem' }}>
                          {Number(c.pagoDomiciliario) > 0 ? formatCurrency(c.pagoDomiciliario) : '$ -'}
                        </div>
                        {c.domiciliarioDetalle && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{c.domiciliarioDetalle}</div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Descuadre</div>
                        <div style={{ marginTop: '0.15rem' }}>
                          <span className={`badge-cuadre ${c.descuadre > 0 ? 'sobra' : c.descuadre < 0 ? 'falta' : 'exacto'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                            {c.estadoCuadre} {c.descuadre !== 0 && `(${formatCurrency(Math.abs(c.descuadre))})`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {!isApproved && (
                        <button
                          type="button"
                          className="btn btn-emerald btn-sm"
                          onClick={() => onApproveClose(c.id)}
                          title="Aprobar e integrar automáticamente en las finanzas del restaurante"
                          style={{ flex: '1 1 auto', minHeight: '38px', justifyContent: 'center' }}
                        >
                          <ShieldCheck size={15} />
                          <span>Aprobar Cierre</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleExpand(c.id)}
                        style={{ minHeight: '38px', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <span style={{ fontSize: '0.8rem' }}>{isExpanded ? 'Ocultar Desglose' : 'Ver Desglose'}</span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
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
                          style={{ minHeight: '38px', padding: '0.4rem 0.75rem', color: 'var(--rose-light)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
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
                              .filter(([k, count]) => !k.startsWith('_') && count > 0)
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

                      <div style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.06)',
                        border: '1px dashed rgba(245, 158, 11, 0.3)'
                      }}>
                        <div style={{ color: 'var(--amber-light)', marginBottom: '0.2rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Bike size={14} />
                          <span>Domiciliario (Histórico • No suma)</span>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '1rem' }}>
                          {Number(c.pagoDomiciliario) > 0 ? formatCurrency(c.pagoDomiciliario) : '$ -'}
                        </div>
                        {c.domiciliarioDetalle && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                            {c.domiciliarioDetalle}
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
