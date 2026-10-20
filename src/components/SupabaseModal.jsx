import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, RefreshCw, X, Shield, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SupabaseModal({ 
  isOpen, 
  onClose, 
  dbStatus, 
  onRefreshStatus,
  sqlCode
}) {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = async () => {
    setIsChecking(true);
    await onRefreshStatus();
    setTimeout(() => setIsChecking(false), 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '820px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3ecf8e 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              boxShadow: '0 4px 15px rgba(62, 207, 142, 0.35)'
            }}>
              <Database size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Conexión Cloud Supabase
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '999px',
                  background: dbStatus?.initialized ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: dbStatus?.initialized ? '#34d399' : '#fbbf24',
                  border: `1px solid ${dbStatus?.initialized ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                }}>
                  {dbStatus?.initialized ? 'Tablas Creadas & En Línea' : 'Pendiente Ejecutar SQL'}
                </span>
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Base de datos PostgreSQL en tiempo real para múltiples empresas y roles
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Project Credentials Status */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          padding: '1.1rem',
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              URL del Proyecto
            </div>
            <code style={{ fontSize: '0.85rem', color: '#3ecf8e', background: 'rgba(62, 207, 142, 0.08)', padding: '0.25rem 0.5rem', borderRadius: '6px', display: 'inline-block' }}>
              https://tkulhvmfnstulbbmwdmx.supabase.co
            </code>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Estado del Servidor
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {dbStatus?.initialized ? (
                <>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>
                    100% Sincronizado en Vivo
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>
                    Conectado a la API. Falta inicializar tablas.
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Instructions banner if not initialized */}
        {!dbStatus?.initialized && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '14px',
            padding: '1.2rem',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} />
              ¿Cómo activar la base de datos en 3 sencillos pasos?
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <li>
                Haz click en el botón verde abajo para <strong>Copiar el Script SQL</strong>.
              </li>
              <li>
                Abre el <strong>SQL Editor de Supabase</strong> en tu navegador:{' '}
                <a 
                  href="https://supabase.com/dashboard/project/tkulhvmfnstulbbmwdmx/sql" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#3ecf8e', textDecoration: 'underline', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  Abrir Supabase SQL Editor <ExternalLink size={13} />
                </a>
              </li>
              <li>
                Pega el código, haz click en <strong>"Run"</strong> y luego vuelve aquí y pulsa <strong>"Verificar Tablas"</strong>.
              </li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Script de Creación y Semilla de Datos (PostgreSQL)
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleRefresh}
              disabled={isChecking}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={isChecking ? 'spin' : ''} />
              <span>{isChecking ? 'Verificando...' : 'Verificar Tablas'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCopy}
              style={{
                background: copied ? 'var(--emerald-primary)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '¡SQL Copiado al Portapapeles!' : 'Copiar Script SQL'}</span>
            </button>
          </div>
        </div>

        {/* Code Preview Block */}
        <div style={{
          position: 'relative',
          background: '#090d16',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.85rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.75rem',
            color: 'var(--text-dim)'
          }}>
            <span>supabase_schema.sql (Tablas, RLS, Realtime & Datos La Papería)</span>
            <span>PostgreSQL</span>
          </div>
          <pre style={{
            margin: 0,
            padding: '1rem',
            maxHeight: '260px',
            overflowY: 'auto',
            fontSize: '0.78rem',
            color: '#cbd5e1',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            lineHeight: 1.5
          }}>
            {sqlCode}
          </pre>
        </div>

        {/* Features Checklist */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            ¿Qué incluye esta arquitectura en Supabase?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Shield size={14} style={{ color: '#3ecf8e' }} />
              <span>Multi-empresa aislada por ID</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Check size={14} style={{ color: '#3ecf8e' }} />
              <span>Cierre de caja con conteo de billetes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Check size={14} style={{ color: '#3ecf8e' }} />
              <span>Segregación Efectivo vs. Bancos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Check size={14} style={{ color: '#3ecf8e' }} />
              <span>Históricos y acumulados Día/Sem/Mes/Año</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
