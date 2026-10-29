import React, { useState, useMemo } from 'react';
import { Calendar, Eye, Layers, Bike } from 'lucide-react';
import { formatDate } from '../utils/formatters';

// Formato estilo hoja de cálculo ($ 1.825.700,00 o $ - cuando es 0)
const formatSheetAmount = (val, dashOnZero = false) => {
  const num = Number(val) || 0;
  if (num === 0 && dashOnZero) {
    return { symbol: '$', number: '-' };
  }
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(num));
  return { symbol: '$', number: formatted };
};

export default function DailySummarySheet({
  dailyCloses = [],
  liveValues = null, // Opcional: { fecha, cajaEsperada, efectivo, banco, gastos, nomina, pagoDomiciliario }
  title = 'Vista Total del Día (Resumen)'
}) {
  // Obtener fechas únicas disponibles en los cierres
  const availableDates = useMemo(() => {
    const set = new Set();
    dailyCloses.forEach(c => {
      if (c.fecha) set.add(c.fecha);
    });
    if (liveValues?.fecha) set.add(liveValues.fecha);
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [dailyCloses, liveValues?.fecha]);

  const defaultDate = liveValues?.fecha || availableDates[0] || new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [viewMode, setViewMode] = useState(liveValues ? 'live' : 'day'); // 'live' | 'day'
  const [selectedShiftId, setSelectedShiftId] = useState('all'); // 'all' o id de un cierre del día

  const closesForDate = useMemo(() => {
    return dailyCloses.filter(c => c.fecha === selectedDate);
  }, [dailyCloses, selectedDate]);

  // Calcular los datos puramente para visualización (no modifica ni suma en ningún estado externo)
  const summary = useMemo(() => {
    if (viewMode === 'live' && liveValues) {
      const caja = Number(liveValues.cajaEsperada) || 0;
      const efectivo = Number(liveValues.efectivo) || 0;
      const banco = Number(liveValues.banco) || 0;
      const gastos = Number(liveValues.gastos) || 0;
      const nomina = Number(liveValues.nomina) || 0;
      const domiciliario = Number(liveValues.pagoDomiciliario) || 0;
      const total = efectivo + banco + gastos + nomina;
      const descuadre = total - caja;
      return {
        caja,
        efectivo,
        banco,
        gastos,
        nomina,
        domiciliario,
        total,
        descuadre,
        turnosCount: 1,
        subtitle: 'Datos del formulario en vivo'
      };
    }

    const targetCloses =
      selectedShiftId === 'all'
        ? closesForDate
        : closesForDate.filter(c => c.id === selectedShiftId);

    const caja = targetCloses.reduce((acc, c) => acc + (Number(c.cajaEsperada) || 0), 0);
    const efectivo = targetCloses.reduce((acc, c) => acc + (Number(c.efectivo) || 0), 0);
    const banco = targetCloses.reduce((acc, c) => acc + (Number(c.banco) || 0), 0);
    const gastos = targetCloses.reduce((acc, c) => acc + (Number(c.gastos) || 0), 0);
    const nomina = targetCloses.reduce((acc, c) => acc + (Number(c.nomina) || 0), 0);
    const domiciliario = targetCloses.reduce((acc, c) => acc + (Number(c.pagoDomiciliario) || 0), 0);
    const total = efectivo + banco + gastos + nomina;
    const descuadre = total - caja;

    return {
      caja,
      efectivo,
      banco,
      gastos,
      nomina,
      domiciliario,
      total,
      descuadre,
      turnosCount: targetCloses.length,
      subtitle:
        selectedShiftId === 'all'
          ? `Consolidado del día (${targetCloses.length} ${targetCloses.length === 1 ? 'turno' : 'turnos'})`
          : 'Turno seleccionado'
    };
  }, [viewMode, liveValues, closesForDate, selectedShiftId]);

  const estadoTexto =
    summary.descuadre > 0 ? 'Sobra' : summary.descuadre < 0 ? 'Falta' : 'Cuadrado';

  const highlightBg =
    summary.descuadre > 0
      ? '#70ad47' // Verde estilo Excel como en la imagen
      : summary.descuadre < 0
      ? '#e11d48' // Rojo cuando falta
      : '#2563eb'; // Azul cuando es exacto

  const rows = [
    { label: 'CAJA', val: formatSheetAmount(summary.caja, true) },
    { label: 'Efectivo', val: formatSheetAmount(summary.efectivo, true) },
    { label: 'Banco', val: formatSheetAmount(summary.banco, true) },
    { label: 'Gastos', val: formatSheetAmount(summary.gastos, true) },
    { label: 'Nomina', val: formatSheetAmount(summary.nomina, true) },
    { label: 'Total', val: formatSheetAmount(summary.total, false), isTotal: true }
  ];

  const descuadreFormatted = formatSheetAmount(summary.descuadre, false);

  return (
    <div
      className="glass-card"
      style={{
        border: '1px solid var(--border-card)',
        background: 'linear-gradient(180deg, rgba(19, 27, 46, 0.95) 0%, rgba(14, 21, 36, 0.95) 100%)'
      }}
    >
      {/* Encabezado y Controles de Filtro */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
          marginBottom: '1.1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Eye size={18} style={{ color: 'var(--emerald-light)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{title}</h3>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald-light)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                textTransform: 'uppercase'
              }}
            >
              Solo Visualización • No suma en ningún lado
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            {summary.subtitle}
          </p>
        </div>

        {/* Controles para alternar entre Turno en Vivo / Total del Día / Fecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {liveValues && (
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(0,0,0,0.3)',
                padding: '0.2rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('live')}
                style={{
                  border: 'none',
                  borderRadius: '7px',
                  padding: '0.28rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'live' ? 'var(--emerald-primary)' : 'transparent',
                  color: viewMode === 'live' ? '#fff' : 'var(--text-muted)'
                }}
              >
                Turno en Vivo
              </button>
              <button
                type="button"
                onClick={() => setViewMode('day')}
                style={{
                  border: 'none',
                  borderRadius: '7px',
                  padding: '0.28rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'day' ? 'var(--amber-primary)' : 'transparent',
                  color: viewMode === 'day' ? '#fff' : 'var(--text-muted)'
                }}
              >
                Total del Día
              </button>
            </div>
          )}

          {viewMode === 'day' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} style={{ color: 'var(--amber-light)' }} />
                <select
                  className="form-control"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', minWidth: '140px' }}
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedShiftId('all');
                  }}
                >
                  {availableDates.length === 0 ? (
                    <option value={defaultDate}>{formatDate(defaultDate)}</option>
                  ) : (
                    availableDates.map(d => (
                      <option key={d} value={d}>
                        {formatDate(d)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {closesForDate.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={14} style={{ color: 'var(--blue-light)' }} />
                  <select
                    className="form-control"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    value={selectedShiftId}
                    onChange={e => setSelectedShiftId(e.target.value)}
                  >
                    <option value="all">Todos los turnos ({closesForDate.length})</option>
                    {closesForDate.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.turno} - {c.cajero} ({c.hora || 'S/H'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabla estilo Hoja de Cálculo idéntica a la imagen de referencia */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0.25rem 0' }}>
        <div
          style={{
            background: '#ffffff',
            color: '#111827',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
            width: '100%',
            maxWidth: '430px',
            fontFamily: "'Calibri', 'Segoe UI', Roboto, sans-serif"
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1.05rem' }}>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRight: '1px solid #e2e8f0',
                      fontWeight: row.isTotal ? 600 : 400,
                      color: '#0f172a',
                      width: '38%'
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRight: '1px solid #e2e8f0',
                      position: 'relative',
                      width: '44%',
                      fontWeight: row.isTotal ? 600 : 400,
                      color: '#0f172a'
                    }}
                  >
                    {/* Triángulo verde de fórmula en la esquina superior izquierda de Total como en Excel */}
                    {row.isTotal && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 0,
                          height: 0,
                          borderTop: '7px solid #16a34a',
                          borderRight: '7px solid transparent'
                        }}
                      />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{row.val.symbol}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{row.val.number}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.5rem 0.65rem', width: '18%' }} />
                </tr>
              ))}

              {/* Fila de Descuadre resaltada igual a la imagen */}
              <tr>
                <td
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRight: '1px solid #e2e8f0',
                    color: '#0f172a'
                  }}
                >
                  Descuadre
                </td>
                <td
                  style={{
                    padding: '0.55rem 0.85rem',
                    background: highlightBg,
                    color: '#ffffff',
                    fontWeight: 700,
                    border: '2px solid #2f521b',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{descuadreFormatted.symbol}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{descuadreFormatted.number}</span>
                  </div>
                </td>
                <td
                  style={{
                    padding: '0.55rem 0.65rem',
                    color: '#0f172a',
                    fontWeight: 500
                  }}
                >
                  {estadoTexto}
                </td>
              </tr>

              {/* Si hay pago a domiciliario registrado, se muestra debajo como nota informativa sin sumarse al Total */}
              {summary.domiciliario > 0 && (
                <tr style={{ borderTop: '2px dashed #cbd5e1', background: '#fffbeb' }}>
                  <td
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRight: '1px solid #fde68a',
                      fontSize: '0.82rem',
                      color: '#92400e',
                      fontWeight: 600
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Bike size={13} />
                      Domiciliario
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRight: '1px solid #fde68a',
                      fontSize: '0.88rem',
                      color: '#92400e',
                      fontWeight: 700
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>$</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatSheetAmount(summary.domiciliario, false).number}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '0.45rem 0.5rem',
                      fontSize: '0.68rem',
                      color: '#b45309',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    No suma
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

