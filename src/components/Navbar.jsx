import React from 'react';
import { UserCheck, ShieldCheck, Download, Clock, LogOut, User, Store, Database } from 'lucide-react';

export default function Navbar({ 
  activeCompany, 
  currentUser, 
  currentRole, 
  onSelectRole, 
  onOpenExport, 
  onLogout,
  closesPendingCount,
  dbStatus,
  onOpenSupabase
}) {
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header-nav">
      {/* SaaS Platform Branding & Active Client Tenant */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Quadra SaaS Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: '1.2rem',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            letterSpacing: '-0.03em'
          }}>
            Q
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              QUADRA <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', verticalAlign: 'middle' }}>CLOUD</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Plataforma Financiera
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)', margin: '0 0.15rem' }} />

        {/* Client Workspace Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          padding: '0.3rem 0.75rem',
          borderRadius: '12px'
        }}>
          <span style={{ fontSize: '1.35rem' }}>
            {activeCompany?.emoji || '🍟'}
          </span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
              {activeCompany?.name || 'La Papería'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--amber-light)', fontWeight: 600 }}>
              Cliente Activo • {activeCompany?.industry || 'Comidas Rápidas'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        
        {/* Supabase Cloud Status Indicator */}
        <button
          type="button"
          onClick={onOpenSupabase}
          className="btn btn-outline btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: '10px',
            borderColor: dbStatus?.initialized ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            background: dbStatus?.initialized ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            padding: '0.35rem 0.65rem',
            cursor: 'pointer'
          }}
          title="Estado de base de datos Supabase"
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dbStatus?.initialized ? '#10b981' : '#f59e0b',
            boxShadow: `0 0 8px ${dbStatus?.initialized ? '#10b981' : '#f59e0b'}`
          }} />
          <Database size={14} style={{ color: dbStatus?.initialized ? '#34d399' : '#fbbf24' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: dbStatus?.initialized ? '#34d399' : '#fbbf24' }}>
            {dbStatus?.initialized ? 'Supabase En Vivo' : 'Supabase Config'}
          </span>
        </button>

        {/* Live Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Clock size={15} style={{ color: 'var(--amber-primary)' }} />
          <span>{timeStr}</span>
        </div>

        {/* Role Switcher (If user is Admin or in Demo mode) */}
        <div className="role-switcher">
          <button
            type="button"
            className={`role-btn ${currentRole === 'cajero' ? 'active cashier' : ''}`}
            onClick={() => onSelectRole('cajero')}
          >
            <UserCheck size={16} />
            <span>Cajero</span>
          </button>
          
          <button
            type="button"
            className={`role-btn ${currentRole === 'admin' ? 'active admin' : ''}`}
            onClick={() => onSelectRole('admin')}
            style={{ position: 'relative' }}
          >
            <ShieldCheck size={16} />
            <span>Administrador</span>
            {closesPendingCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--rose-primary)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 6px rgba(244,63,94,0.5)'
                }}
              >
                {closesPendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Export Button (Admin only) */}
        {currentRole === 'admin' && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onOpenExport}
            title="Exportar información a Excel o respaldos"
          >
            <Download size={15} />
            <span style={{ display: 'none', md: 'inline' }}>Exportar</span>
          </button>
        )}

        {/* User Profile & Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'var(--bg-secondary)',
          padding: '0.35rem 0.75rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: currentUser?.role === 'admin' ? 'var(--amber-glow)' : 'var(--emerald-glow)',
            color: currentUser?.role === 'admin' ? 'var(--amber-light)' : 'var(--emerald-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
              {currentUser?.name || 'Usuario'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {currentUser?.email || ''}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.25rem 0.5rem', color: 'var(--rose-light)', borderColor: 'rgba(244, 63, 94, 0.25)', marginLeft: '0.35rem' }}
            title="Cerrar Sesión / Salir"
          >
            <LogOut size={13} />
          </button>
        </div>

      </div>
    </header>
  );
}
