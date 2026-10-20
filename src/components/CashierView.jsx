import React, { useState } from 'react';
import { 
  Calculator, CheckCircle2, AlertTriangle, Send, 
  Coins, Banknote, CreditCard, Receipt, Users, 
  HelpCircle, ChevronDown, ChevronUp, History, Sparkles 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const BILL_DENOMINATIONS = [
  { value: 100000, label: '$100.000' },
  { value: 50000, label: '$50.000' },
  { value: 20000, label: '$20.000' },
  { value: 10000, label: '$10.000' },
  { value: 5000, label: '$5.000' },
  { value: 2000, label: '$2.000' }
];

export default function CashierView({ currentUser, dailyCloses, onAddDailyClose }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(todayStr);
  const [cajero, setCajero] = useState(currentUser?.name || 'Cajero Principal');
  const [turno, setTurno] = useState('Noche');
  
  // Financial inputs matching Image 2
  const [cajaEsperada, setCajaEsperada] = useState(1825700);
  const [efectivo, setEfectivo] = useState(752000);
  const [banco, setBanco] = useState(816000);
  const [gastos, setGastos] = useState(0);
  const [gastosDetalle, setGastosDetalle] = useState('');
  const [nomina, setNomina] = useState(270000);
  const [nominaDetalle, setNominaDetalle] = useState('Pago turno diario');
  const [notas, setNotas] = useState('');

  // Bill counter toggle
  const [showBillCounter, setShowBillCounter] = useState(false);
  const [billCounts, setBillCounts] = useState({
    100000: 3,
    50000: 6,
    20000: 5,
    10000: 4,
    5000: 2,
    2000: 1,
    monedas: 0
  });

  // Calculate bill total
  const computeBillTotal = (counts) => {
    let sum = 0;
    BILL_DENOMINATIONS.forEach(b => {
      sum += (counts[b.value] || 0) * b.value;
    });
    sum += Number(counts.monedas || 0);
    return sum;
  };

  const handleBillCountChange = (val, count) => {
    const updated = { ...billCounts, [val]: Math.max(0, parseInt(count, 10) || 0) };
    setBillCounts(updated);
    const totalBills = computeBillTotal(updated);
    setEfectivo(totalBills);
  };

  // Live totals calculation
  const numCajaEsperada = Number(cajaEsperada) || 0;
  const numEfectivo = Number(efectivo) || 0;
  const numBanco = Number(banco) || 0;
  const numGastos = Number(gastos) || 0;
  const numNomina = Number(nomina) || 0;

  const totalCalculado = numEfectivo + numBanco + numGastos + numNomina;
  const descuadre = totalCalculado - numCajaEsperada;

  let estadoCuadre = 'Exacto';
  if (descuadre > 0) estadoCuadre = 'Sobra';
  if (descuadre < 0) estadoCuadre = 'Falta';

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numCajaEsperada <= 0) {
      alert('Por favor ingresa el monto esperado de CAJA.');
      return;
    }

    const newClose = {
      id: `close-${Date.now()}`,
      fecha,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      cajero,
      turno,
      cajaEsperada: numCajaEsperada,
      efectivo: numEfectivo,
      banco: numBanco,
      gastos: numGastos,
      gastosDetalle,
      nomina: numNomina,
      nominaDetalle,
      totalCalculado,
      descuadre,
      estadoCuadre,
      estadoRevision: 'Pendiente', // Admin will approve
      notas,
      desgloseBilletes: billCounts
    };

    onAddDailyClose(newClose);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      // reset form
      setCajaEsperada('');
      setEfectivo('');
      setBanco('');
      setGastos('');
      setGastosDetalle('');
      setNomina('');
      setNominaDetalle('');
      setNotas('');
    }, 2500);
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(17, 24, 39, 0.8))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-light)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald-light)' }} />
              MODO CAJERO ACTIVO
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Arqueo & Cierre Diario de Caja</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Ingresa los valores de la venta del sistema, el efectivo contado y las transferencias de tu turno.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Turno</div>
              <div style={{ fontWeight: 'bold', color: 'var(--amber-light)' }}>{turno}</div>
            </div>
          </div>
        </div>
      </div>

      {submittedSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid var(--emerald-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--emerald-light)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle2 size={32} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>¡Cierre de Turno Enviado Exitosamente!</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              El arqueo ha sido registrado y enviado para revisión del Administrador.
            </div>
          </div>
        </div>
      )}

      {/* Main Form & Live Cuadre Card */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Column 1: Shift info and Sales */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-light)' }}>
              <Calculator size={18} />
              1. Datos del Turno y Sistema
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Fecha del Cierre</label>
                <input
                  type="date"
                  className="form-control"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Turno</label>
                <select
                  className="form-control"
                  value={turno}
                  onChange={e => setTurno(e.target.value)}
                >
                  <option value="Día / Almuerzo">Día / Almuerzo</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                  <option value="Completo">Día Completo</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Cajero</label>
              <input
                type="text"
                className="form-control"
                value={cajero}
                onChange={e => setCajero(e.target.value)}
                placeholder="Ej. Juan Sebastián"
                required
              />
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ color: 'var(--amber-light)', fontWeight: 800 }}>
                CAJA ESPERADA (Ventas Sistema / Comandas)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontWeight: 'bold' }}>$</span>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}
                  value={cajaEsperada}
                  onChange={e => setCajaEsperada(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                Monto total que debería haber ingresado según el sistema de ventas o comandero.
              </div>
            </div>
          </div>

          {/* Column 2: Dinero Físico y Bancos */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-light)' }}>
              <Coins size={18} />
              2. Dinero Real en Caja & Bancos
            </h3>

            {/* Efectivo */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Efectivo Físico Contado</label>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: 'var(--amber-light)', borderColor: 'var(--border-subtle)' }}
                  onClick={() => setShowBillCounter(!showBillCounter)}
                >
                  <Banknote size={13} />
                  {showBillCounter ? 'Ocultar Desglose Billetes' : 'Contador de Billetes'}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontWeight: 'bold' }}>$</span>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', fontWeight: 'bold' }}
                  value={efectivo}
                  onChange={e => setEfectivo(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Collapsible Bill Counter */}
            {showBillCounter && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--amber-light)', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={13} /> Cantidad de billetes en caja:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {BILL_DENOMINATIONS.map(b => (
                    <div key={b.value}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{b.label}</span>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', textAlign: 'center' }}
                        value={billCounts[b.value] || ''}
                        onChange={e => handleBillCountChange(b.value, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ))}
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Monedas (Total $)</span>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', textAlign: 'center' }}
                      value={billCounts.monedas || ''}
                      onChange={e => handleBillCountChange('monedas', e.target.value)}
                      placeholder="$ 0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Banco / Transferencias */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={14} />
                Banco / Transferencias (Nequi, Daviplata, Datáfono)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontWeight: 'bold' }}>$</span>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', fontWeight: 'bold' }}
                  value={banco}
                  onChange={e => setBanco(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Gastos menores y Nómina de turno */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Gastos del Turno</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={gastos}
                  onChange={e => setGastos(e.target.value)}
                  placeholder="$ 0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nómina Pagada Turno</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={nomina}
                  onChange={e => setNomina(e.target.value)}
                  placeholder="$ 0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Cuadre Card - Direct Representation of Image 2 */}
        <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-card)', background: 'linear-gradient(180deg, #131b2e 0%, #0e1524 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} style={{ color: 'var(--amber-light)' }} />
              <h3 style={{ fontSize: '1.15rem' }}>Resumen del Cuadre en Vivo</h3>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Cálculo idéntico a la tabla de cuadre diario
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CAJA Esperada</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatCurrency(numCajaEsperada)}</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Efectivo</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--emerald-light)' }}>{formatCurrency(numEfectivo)}</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Banco</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--blue-primary)' }}>{formatCurrency(numBanco)}</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gastos Turno</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{numGastos > 0 ? formatCurrency(numGastos) : '$ -'}</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nómina Turno</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--purple-primary)' }}>{formatCurrency(numNomina)}</div>
            </div>
          </div>

          {/* Result Highlight Box */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TOTAL JUSTIFICADO (Efectivo + Banco + Gastos + Nómina)
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                {formatCurrency(totalCalculado)}
              </div>
            </div>

            {/* Descuadre Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Descuadre</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: descuadre === 0 ? 'var(--blue-primary)' : descuadre > 0 ? 'var(--emerald-light)' : 'var(--rose-light)'
                }}>
                  {formatCurrency(Math.abs(descuadre))}
                </div>
              </div>

              <div>
                {descuadre === 0 && (
                  <span className="badge-cuadre exacto">
                    <CheckCircle2 size={16} />
                    CUADRADO
                  </span>
                )}
                {descuadre > 0 && (
                  <span className="badge-cuadre sobra">
                    ▲ SOBRA {formatCurrency(descuadre)}
                  </span>
                )}
                {descuadre < 0 && (
                  <span className="badge-cuadre falta">
                    ▼ FALTA {formatCurrency(Math.abs(descuadre))}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Notas u Observaciones del Cierre</label>
            <input
              type="text"
              className="form-control"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej. Sobrante por propinas voluntarias o cambio no reclamado."
            />
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              type="submit"
              className="btn btn-emerald"
              style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', width: '100%', maxWidth: '350px' }}
            >
              <Send size={18} />
              Cerrar Turno & Enviar Arqueo
            </button>
          </div>
        </div>
      </form>

      {/* History of recent closes */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} style={{ color: 'var(--amber-light)' }} />
          Historial de Cierres Recientes
        </h3>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Fecha & Hora</th>
                <th>Turno</th>
                <th>Cajero</th>
                <th>CAJA Esperada</th>
                <th>Total Justificado</th>
                <th>Descuadre</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {dailyCloses.slice(0, 5).map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatDate(c.fecha)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.hora}</div>
                  </td>
                  <td>{c.turno}</td>
                  <td>{c.cajero}</td>
                  <td>{formatCurrency(c.cajaEsperada)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.totalCalculado)}</td>
                  <td>
                    <span className={`badge-cuadre ${c.descuadre > 0 ? 'sobra' : c.descuadre < 0 ? 'falta' : 'exacto'}`}>
                      {c.estadoCuadre} ({formatCurrency(Math.abs(c.descuadre))})
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: c.estadoRevision === 'Aprobado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: c.estadoRevision === 'Aprobado' ? 'var(--emerald-light)' : 'var(--amber-light)'
                    }}>
                      {c.estadoRevision || 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
