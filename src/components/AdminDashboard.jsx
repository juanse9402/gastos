import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, 
  BarChart3, Calendar, Filter, ArrowUpRight, ArrowDownRight, 
  Clock, CalendarDays, Coins, Landmark, CreditCard, Banknote,
  ArrowRightLeft, CheckCircle2, ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

// Safe local date parsing
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d || 1);
};

const formatLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export default function AdminDashboard({ transactions, categories }) {
  // Granularity state: 'dia' | 'semana' | 'mes' | 'año' | 'todo' | 'rango'
  const [granularity, setGranularity] = useState('mes');

  // Channel filter: 'all' | 'Efectivo' | 'Banco'
  const [selectedMethod, setSelectedMethod] = useState('all');

  const todayStr = formatLocalDate(new Date());
  
  // Specific selections
  const [selectedDay, setSelectedDay] = useState('2026-09-29');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedWeekStart, setSelectedWeekStart] = useState('2026-09-28');
  const [rangeStart, setRangeStart] = useState('2026-09-01');
  const [rangeEnd, setRangeEnd] = useState('2026-09-30');

  // Available dates
  const { availableYears, availableMonths } = useMemo(() => {
    const years = new Set();
    const months = new Set();
    transactions.forEach(t => {
      if (t.fecha) {
        if (t.fecha.length >= 4) years.add(t.fecha.substring(0, 4));
        if (t.fecha.length >= 7) months.add(t.fecha.substring(0, 7));
      }
    });
    years.add('2026');
    months.add('2026-09');
    return {
      availableYears: Array.from(years).sort().reverse(),
      availableMonths: Array.from(months).sort().reverse()
    };
  }, [transactions]);

  // Filter transactions by Granularity FIRST (period transactions)
  const { periodTxs, periodLabel } = useMemo(() => {
    let txs = [];
    let label = '';

    if (granularity === 'dia') {
      txs = transactions.filter(t => t.fecha === selectedDay);
      label = `Día: ${formatDate(selectedDay)}`;
    } else if (granularity === 'semana') {
      const start = parseLocalDate(selectedWeekStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startStr = formatLocalDate(start);
      const endStr = formatLocalDate(end);

      txs = transactions.filter(t => t.fecha >= startStr && t.fecha <= endStr);
      label = `Semana: ${formatDate(startStr)} al ${formatDate(endStr)}`;
    } else if (granularity === 'mes') {
      txs = transactions.filter(t => t.fecha && t.fecha.startsWith(selectedMonth));
      const [y, m] = selectedMonth.split('-');
      const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      label = `Mes: ${monthNames[parseInt(m, 10)]} ${y}`;
    } else if (granularity === 'año') {
      txs = transactions.filter(t => t.fecha && t.fecha.startsWith(selectedYear));
      label = `Año: ${selectedYear}`;
    } else if (granularity === 'rango') {
      txs = transactions.filter(t => t.fecha >= rangeStart && t.fecha <= rangeEnd);
      label = `Rango: ${formatDate(rangeStart)} al ${formatDate(rangeEnd)}`;
    } else {
      txs = transactions;
      label = 'Histórico Acumulado';
    }

    return { periodTxs: txs, periodLabel: label };
  }, [transactions, granularity, selectedDay, selectedWeekStart, selectedMonth, selectedYear, rangeStart, rangeEnd]);

  // Channel metrics (Efectivo vs Banco) for the period
  const channelMetrics = useMemo(() => {
    let ingEfectivo = 0;
    let ingBanco = 0;
    let gstEfectivo = 0;
    let gstBanco = 0;

    periodTxs.forEach(t => {
      const amt = Number(t.monto) || 0;
      const isCash = t.metodo === 'Efectivo';
      
      if (t.tipo === 'Ingreso') {
        if (isCash) ingEfectivo += amt;
        else ingBanco += amt;
      } else {
        if (isCash) gstEfectivo += amt;
        else gstBanco += amt;
      }
    });

    const saldoEfectivo = ingEfectivo - gstEfectivo;
    const saldoBanco = ingBanco - gstBanco;

    return {
      ingEfectivo,
      ingBanco,
      gstEfectivo,
      gstBanco,
      saldoEfectivo,
      saldoBanco
    };
  }, [periodTxs]);

  // Display transactions filtered by payment method if selected
  const displayTxs = useMemo(() => {
    if (selectedMethod === 'all') return periodTxs;
    return periodTxs.filter(t => t.metodo === selectedMethod);
  }, [periodTxs, selectedMethod]);

  // General KPIs for displayed transactions
  const metrics = useMemo(() => {
    let ingresos = 0;
    let gastos = 0;
    let ventasLocal = 0;
    let ventasDidi = 0;
    const catMap = {};

    displayTxs.forEach(t => {
      const amt = Number(t.monto) || 0;
      if (t.tipo === 'Ingreso') {
        ingresos += amt;
        if (t.categoria === 'Ventas Local') ventasLocal += amt;
        if (t.categoria === 'Didi') ventasDidi += amt;
      } else {
        gastos += amt;
        catMap[t.categoria] = (catMap[t.categoria] || 0) + amt;
      }
    });

    const resultado = ingresos - gastos;
    const margen = ingresos > 0 ? ((resultado / ingresos) * 100).toFixed(1) : 0;

    const catArray = Object.entries(catMap)
      .map(([name, total]) => ({
        name,
        total,
        percentage: gastos > 0 ? ((total / gastos) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.total - a.total);

    return {
      ingresos,
      gastos,
      resultado,
      margen,
      ventasLocal,
      ventasDidi,
      catArray,
      count: displayTxs.length
    };
  }, [displayTxs]);

  // Evolution data for Bar Chart
  const evolutionData = useMemo(() => {
    const filterByMethod = (t) => selectedMethod === 'all' || t.metodo === selectedMethod;

    if (granularity === 'año') {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return months.map((mName, idx) => {
        const monthNumStr = String(idx + 1).padStart(2, '0');
        const prefix = `${selectedYear}-${monthNumStr}`;
        let ing = 0;
        let gst = 0;
        transactions.forEach(t => {
          if (t.fecha && t.fecha.startsWith(prefix) && filterByMethod(t)) {
            const val = Number(t.monto) || 0;
            if (t.tipo === 'Ingreso') ing += val;
            else gst += val;
          }
        });
        return { label: mName, ing, gst, net: ing - gst };
      });
    }

    if (granularity === 'semana') {
      const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const start = parseLocalDate(selectedWeekStart);
      return dayNames.map((dName, idx) => {
        const curr = new Date(start);
        curr.setDate(start.getDate() + idx);
        const dateStr = formatLocalDate(curr);
        let ing = 0;
        let gst = 0;
        transactions.forEach(t => {
          if (t.fecha === dateStr && filterByMethod(t)) {
            const val = Number(t.monto) || 0;
            if (t.tipo === 'Ingreso') ing += val;
            else gst += val;
          }
        });
        return { label: `${dName} ${curr.getDate()}`, ing, gst, net: ing - gst };
      });
    }

    if (granularity === 'mes') {
      const weeks = [
        { label: 'Sem 1 (1-7)', start: 1, end: 7 },
        { label: 'Sem 2 (8-14)', start: 8, end: 14 },
        { label: 'Sem 3 (15-21)', start: 15, end: 21 },
        { label: 'Sem 4 (22-28)', start: 22, end: 28 },
        { label: 'Sem 5 (29-31)', start: 29, end: 31 }
      ];
      return weeks.map(w => {
        let ing = 0;
        let gst = 0;
        transactions.forEach(t => {
          if (t.fecha && t.fecha.startsWith(selectedMonth) && filterByMethod(t)) {
            const dayNum = parseInt(t.fecha.split('-')[2], 10);
            if (dayNum >= w.start && dayNum <= w.end) {
              const val = Number(t.monto) || 0;
              if (t.tipo === 'Ingreso') ing += val;
              else gst += val;
            }
          }
        });
        return { label: w.label, ing, gst, net: ing - gst };
      });
    }

    return null;
  }, [granularity, transactions, selectedYear, selectedMonth, selectedWeekStart, selectedMethod]);

  const DONUT_COLORS = [
    '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', 
    '#10b981', '#14b8a6', '#f97316', '#64748b', '#06b6d4'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. PERIOD GRANULARITY SWITCHER */}
      <div className="glass-card" style={{ padding: 'clamp(0.85rem, 3vw, 1.25rem)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--amber-light)', fontWeight: 800, fontSize: '0.88rem' }}>
              <CalendarDays size={18} />
              <span>CONSULTA DE ACUMULADOS:</span>
            </div>

            {/* Granularity Pills with full width on mobile */}
            <div className="horizontal-scroller full-width-on-mobile" style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-subtle)', gap: '4px' }}>
              <button
                type="button"
                className={`btn btn-sm ${granularity === 'dia' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', borderRadius: '10px' }}
                onClick={() => setGranularity('dia')}
              >
                📅 Por Día
              </button>

              <button
                type="button"
                className={`btn btn-sm ${granularity === 'semana' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', borderRadius: '10px' }}
                onClick={() => setGranularity('semana')}
              >
                📆 Por Semana
              </button>

              <button
                type="button"
                className={`btn btn-sm ${granularity === 'mes' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', borderRadius: '10px' }}
                onClick={() => setGranularity('mes')}
              >
                🗓️ Por Mes
              </button>

              <button
                type="button"
                className={`btn btn-sm ${granularity === 'año' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', borderRadius: '10px' }}
                onClick={() => setGranularity('año')}
              >
                📈 Por Año
              </button>

              <button
                type="button"
                className={`btn btn-sm ${granularity === 'rango' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', borderRadius: '10px' }}
                onClick={() => setGranularity('rango')}
              >
                ⏳ Rango Libre
              </button>

              <button
                type="button"
                className={`btn btn-sm ${granularity === 'todo' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', borderRadius: '10px' }}
                onClick={() => setGranularity('todo')}
              >
                🌐 Histórico Total
              </button>
            </div>
          </div>

          {/* DYNAMIC SUB-SELECTOR */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            border: '1px solid var(--border-subtle)'
          }}>
            {granularity === 'dia' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Día:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 'auto', minWidth: '150px', padding: '0.35rem 0.65rem', fontSize: '0.88rem' }}
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value)}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedDay(todayStr)}>Hoy</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedDay('2026-09-29')}>29 Sep</button>
              </div>
            )}

            {granularity === 'semana' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Semana (inicia Lunes):</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 'auto', minWidth: '150px', padding: '0.35rem 0.65rem', fontSize: '0.88rem' }}
                  value={selectedWeekStart}
                  onChange={e => {
                    const mon = getMonday(parseLocalDate(e.target.value));
                    setSelectedWeekStart(formatLocalDate(mon));
                  }}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedWeekStart('2026-09-28')}>Semana Cierre Sep</button>
              </div>
            )}

            {granularity === 'mes' && (
              <div className="horizontal-scroller full-width-on-mobile" style={{ alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mes:</span>
                {availableMonths.map(m => {
                  const [y, mon] = m.split('-');
                  const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  const label = `${monthNames[parseInt(mon, 10)]} ${y}`;
                  const isActive = selectedMonth === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                      onClick={() => setSelectedMonth(m)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {granularity === 'año' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Seleccionar Año:</span>
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    type="button"
                    className={`btn btn-sm ${selectedYear === yr ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.35rem 0.9rem' }}
                    onClick={() => setSelectedYear(yr)}
                  >
                    Año {yr}
                  </button>
                ))}
              </div>
            )}

            {granularity === 'rango' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Desde:</span>
                <input type="date" className="form-control" style={{ width: 'auto', padding: '0.4rem' }} value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hasta:</span>
                <input type="date" className="form-control" style={{ width: 'auto', padding: '0.4rem' }} value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} />
              </div>
            )}

            {granularity === 'todo' && (
              <div style={{ fontSize: '0.85rem', color: 'var(--amber-light)', fontWeight: 600 }}>
                Consolidado histórico general de operaciones
              </div>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>
              📍 {periodLabel}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED CASH VS BANK CONCILIATION & LIQUIDITY CARD */}
      <div className="glass-card" style={{ border: '1px solid var(--border-card)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.45rem', wordBreak: 'break-word', lineHeight: 1.3 }}>
              <ArrowRightLeft size={18} style={{ color: 'var(--amber-light)', flexShrink: 0 }} />
              Conciliación: Efectivo vs. Bancos ({periodLabel})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Diferencia qué dinero entró en efectivo físico vs banco, y el origen de cada egreso.
            </p>
          </div>

          {/* Quick Channel Filter Toggle */}
          <div className="horizontal-scroller full-width-on-mobile" style={{ background: 'var(--bg-input)', padding: '3px', borderRadius: '12px', border: '1px solid var(--border-subtle)', gap: '4px' }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedMethod === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', borderRadius: '8px', padding: '0.35rem 0.65rem' }}
              onClick={() => setSelectedMethod('all')}
            >
              Todos los Canales
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedMethod === 'Efectivo' ? 'btn-emerald' : 'btn-outline'}`}
              style={{ border: 'none', borderRadius: '8px', padding: '0.35rem 0.65rem' }}
              onClick={() => setSelectedMethod('Efectivo')}
            >
              <Coins size={13} /> Solo Efectivo
            </button>
            <button
              type="button"
              className={`btn btn-sm ${selectedMethod === 'Banco' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', borderRadius: '8px', padding: '0.35rem 0.65rem' }}
              onClick={() => setSelectedMethod('Banco')}
            >
              <Landmark size={13} /> Solo Bancos
            </button>
          </div>
        </div>

        {/* Two-Column Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          
          {/* COLUMN 1: CAJA FÍSICA (EFECTIVO) */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-light)', flexShrink: 0 }}>
                  <Banknote size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>CAJA FÍSICA (EFECTIVO)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Mostrador y caja menor</div>
                </div>
              </div>
              <span className="badge-cuadre sobra" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>Físico</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>(+) Entradas Efectivo:</span>
                <strong style={{ color: 'var(--emerald-light)' }}>+{formatCurrency(channelMetrics.ingEfectivo)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>(-) Gastos Salidos de Caja:</span>
                <strong style={{ color: 'var(--rose-light)' }}>-{formatCurrency(channelMetrics.gstEfectivo)}</strong>
              </div>

              <div style={{
                marginTop: '0.45rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.35rem'
              }}>
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>
                  Saldo Neto Efectivo:
                </span>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: channelMetrics.saldoEfectivo >= 0 ? 'var(--emerald-light)' : 'var(--rose-light)',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {formatCurrency(channelMetrics.saldoEfectivo)}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: BANCOS / DIGITAL (NEQUI, DAVIPLATA, DATÁFONO, DIDI) */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-primary)', flexShrink: 0 }}>
                  <Landmark size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>BANCOS / DIGITAL / DIDI</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Transferencias, tarjetas y apps</div>
                </div>
              </div>
              <span className="badge-cuadre exacto" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>Bancos</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>(+) Entradas Banco & Didi:</span>
                <strong style={{ color: 'var(--blue-primary)' }}>+{formatCurrency(channelMetrics.ingBanco)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>(-) Gastos Transferidos:</span>
                <strong style={{ color: 'var(--rose-light)' }}>-{formatCurrency(channelMetrics.gstBanco)}</strong>
              </div>

              <div style={{
                marginTop: '0.45rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.35rem'
              }}>
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>
                  Saldo Neto Bancos:
                </span>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: channelMetrics.saldoBanco >= 0 ? 'var(--blue-primary)' : 'var(--rose-light)',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {formatCurrency(channelMetrics.saldoBanco)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI ACCUMULATED CARDS (Filterable by Channel) */}
      <div className="kpi-grid">
        {/* INGRESOS */}
        <div className="glass-card kpi-card" style={{ '--card-accent': 'var(--emerald-primary)' }}>
          <div className="kpi-title">
            <span>INGRESOS {selectedMethod !== 'all' ? `(${selectedMethod.toUpperCase()})` : 'TOTALES'}</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--emerald-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-light)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--emerald-light)' }}>
            {formatCurrency(metrics.ingresos)}
          </div>
          <div className="kpi-subtitle">
            Mostrador: {formatCurrency(metrics.ventasLocal)} • Didi: {formatCurrency(metrics.ventasDidi)}
          </div>
        </div>

        {/* GASTOS */}
        <div className="glass-card kpi-card" style={{ '--card-accent': 'var(--rose-primary)' }}>
          <div className="kpi-title">
            <span>GASTOS {selectedMethod !== 'all' ? `(${selectedMethod.toUpperCase()})` : 'TOTALES'}</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--rose-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose-light)' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--rose-light)' }}>
            {formatCurrency(metrics.gastos)}
          </div>
          <div className="kpi-subtitle">
            {metrics.catArray.length} rubros con egresos
          </div>
        </div>

        {/* RESULTADO (UTILIDAD) */}
        <div className="glass-card kpi-card" style={{ '--card-accent': metrics.resultado >= 0 ? 'var(--amber-primary)' : 'var(--rose-primary)' }}>
          <div className="kpi-title">
            <span>UTILIDAD {selectedMethod !== 'all' ? `(${selectedMethod.toUpperCase()})` : 'NETA'}</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-light)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: metrics.resultado >= 0 ? 'var(--amber-light)' : 'var(--rose-light)' }}>
            {formatCurrency(metrics.resultado)}
          </div>
          <div className="kpi-subtitle">
            Margen neto: <strong style={{ color: '#fff' }}>{metrics.margen}%</strong>
          </div>
        </div>
      </div>

      {/* 4. EVOLUTION BAR CHART (By Month, Week, or Day) */}
      {evolutionData && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-light)' }}>
                <BarChart3 size={18} />
                Evolución de {granularity === 'año' ? `Meses (${selectedYear})` : granularity === 'semana' ? 'Días' : 'Semanas'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ingresos (Verde) vs Gastos (Rojo)
              </p>
              <div className="show-on-mobile" style={{ fontSize: '0.72rem', color: 'var(--amber-light)', marginTop: '0.2rem' }}>
                ↔ Desliza para ver todos los periodos
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--emerald-primary)' }} />
                <span>Ingresos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--rose-primary)' }} />
                <span>Gastos</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.85rem', minWidth: '480px', height: '200px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              {(() => {
                const maxVal = Math.max(
                  ...evolutionData.map(d => Math.max(d.ing, d.gst)),
                  1000000
                );

                return evolutionData.map(d => {
                  const ingHeight = Math.max(4, (d.ing / maxVal) * 150);
                  const gstHeight = Math.max(4, (d.gst / maxVal) * 150);

                  return (
                    <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }}>
                        <div
                          title={`Ingresos ${d.label}: ${formatCurrency(d.ing)}`}
                          style={{
                            width: '42%',
                            maxWidth: '24px',
                            height: `${ingHeight}px`,
                            background: d.ing > 0 ? 'linear-gradient(180deg, #34d399, #059669)' : 'var(--bg-input)',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.4s ease'
                          }}
                        />
                        <div
                          title={`Gastos ${d.label}: ${formatCurrency(d.gst)}`}
                          style={{
                            width: '42%',
                            maxWidth: '24px',
                            height: `${gstHeight}px`,
                            background: d.gst > 0 ? 'linear-gradient(180deg, #fb7185, #e11d48)' : 'var(--bg-input)',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.4s ease'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {d.label}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: d.net >= 0 ? 'var(--emerald-light)' : 'var(--rose-light)' }}>
                        {d.net !== 0 ? formatCurrency(d.net) : ''}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 5. VISUAL DONUT & CATEGORY BREAKDOWN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
        
        {/* Donut: Ingresos vs Gastos */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieIcon size={17} style={{ color: 'var(--amber-light)' }} />
              Ingresos vs Gastos
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{periodLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              {(() => {
                const total = metrics.ingresos + metrics.gastos;
                if (total === 0) return <div style={{ textAlign: 'center', paddingTop: '75px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Sin movimientos en este filtro</div>;
                const ingresoPct = (metrics.ingresos / total) * 100;
                const gastoPct = (metrics.gastos / total) * 100;
                const radius = 68;
                const circumference = 2 * Math.PI * radius;
                const ingresoDash = (ingresoPct / 100) * circumference;
                const gastoDash = (gastoPct / 100) * circumference;

                return (
                  <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--bg-input)" strokeWidth="26" />
                    <circle
                      cx="100" cy="100" r={radius} fill="none" stroke="var(--emerald-primary)" strokeWidth="26"
                      strokeDasharray={`${ingresoDash} ${circumference}`} strokeDashoffset="0"
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                    <circle
                      cx="100" cy="100" r={radius} fill="none" stroke="var(--rose-primary)" strokeWidth="26"
                      strokeDasharray={`${gastoDash} ${circumference}`} strokeDashoffset={`-${ingresoDash}`}
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  </svg>
                );
              })()}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Flujo Total</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{formatCurrency(metrics.ingresos + metrics.gastos)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--emerald-primary)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Ingresos ({metrics.ingresos + metrics.gastos > 0 ? ((metrics.ingresos / (metrics.ingresos + metrics.gastos)) * 100).toFixed(1) : 0}%)
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--emerald-light)' }}>{formatCurrency(metrics.ingresos)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--rose-primary)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Gastos ({metrics.ingresos + metrics.gastos > 0 ? ((metrics.gastos / (metrics.ingresos + metrics.gastos)) * 100).toFixed(1) : 0}%)
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--rose-light)' }}>{formatCurrency(metrics.gastos)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown bars */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={17} style={{ color: 'var(--amber-light)' }} />
              Gastos por Rubro ({periodLabel})
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Participación</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {metrics.catArray.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No hay gastos registrados con este filtro.
              </div>
            ) : (
              metrics.catArray.slice(0, 6).map((cat, idx) => (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(cat.total)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${cat.percentage}%`,
                        background: DONUT_COLORS[idx % DONUT_COLORS.length],
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. DETAILED SUMMARY OF THE SELECTED PERIOD */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          Detalle de Rubros ({periodLabel})
        </h3>

        {/* Mobile Cards for Rubros (Screens <= 768px) */}
        <div className="show-on-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {metrics.ventasLocal > 0 && (
            <div className="mobile-data-card" style={{ borderLeft: '3px solid var(--emerald-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--emerald-light)', fontSize: '0.9rem' }}>Ventas Mostrador (Local)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{metrics.ingresos > 0 ? ((metrics.ventasLocal / metrics.ingresos) * 100).toFixed(1) : 0}% de ingresos</div>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emerald-light)' }}>
                  {formatCurrency(metrics.ventasLocal)}
                </span>
              </div>
            </div>
          )}

          {metrics.ventasDidi > 0 && (
            <div className="mobile-data-card" style={{ borderLeft: '3px solid var(--emerald-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--emerald-light)', fontSize: '0.9rem' }}>Ventas Didi Food</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{metrics.ingresos > 0 ? ((metrics.ventasDidi / metrics.ingresos) * 100).toFixed(1) : 0}% de ingresos</div>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emerald-light)' }}>
                  {formatCurrency(metrics.ventasDidi)}
                </span>
              </div>
            </div>
          )}

          {metrics.catArray.map(cat => (
            <div key={cat.name} className="mobile-data-card" style={{ borderLeft: '3px solid var(--rose-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cat.percentage}% de gastos totales</div>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--rose-light)' }}>
                  {formatCurrency(cat.total)}
                </span>
              </div>
            </div>
          ))}

          {displayTxs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No hay movimientos en este periodo.
            </div>
          )}
        </div>

        {/* Desktop Table (Screens > 768px) */}
        <div className="table-responsive hide-on-mobile">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Categoría / Rubro</th>
                <th>Tipo</th>
                <th>Participación %</th>
                <th style={{ textAlign: 'right' }}>Total Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {metrics.ventasLocal > 0 && (
                <tr style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                  <td style={{ fontWeight: 700, color: 'var(--emerald-light)' }}>Ventas Mostrador (Local)</td>
                  <td><span style={{ color: 'var(--emerald-light)', fontWeight: 600 }}>Ingreso</span></td>
                  <td>{metrics.ingresos > 0 ? ((metrics.ventasLocal / metrics.ingresos) * 100).toFixed(1) : 0}% de ingresos</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--emerald-light)' }}>
                    {formatCurrency(metrics.ventasLocal)}
                  </td>
                </tr>
              )}
              {metrics.ventasDidi > 0 && (
                <tr style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                  <td style={{ fontWeight: 700, color: 'var(--emerald-light)' }}>Ventas Didi Food</td>
                  <td><span style={{ color: 'var(--emerald-light)', fontWeight: 600 }}>Ingreso</span></td>
                  <td>{metrics.ingresos > 0 ? ((metrics.ventasDidi / metrics.ingresos) * 100).toFixed(1) : 0}% de ingresos</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--emerald-light)' }}>
                    {formatCurrency(metrics.ventasDidi)}
                  </td>
                </tr>
              )}

              {metrics.catArray.map(cat => (
                <tr key={cat.name}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td><span style={{ color: 'var(--rose-light)', fontWeight: 600 }}>Gasto</span></td>
                  <td>{cat.percentage}% de gastos</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(cat.total)}</td>
                </tr>
              ))}

              {displayTxs.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    No hay transacciones registradas para este periodo y método.
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
