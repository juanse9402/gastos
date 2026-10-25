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
      {/* TIER 1: Branding, Workspace, Status & User Profile */}
      <div className="nav-header-row-1">
        {/* SaaS Platform Branding & Active Client Tenant */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          {/* Quadra SaaS Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.05rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              letterSpacing: '-0.03em',
              flexShrink: 0
            }}>
              Q
            </div>
            <div className="hide-on-mobile">
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                QUADRA <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.3rem', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', verticalAlign: 'middle' }}>CLOUD</span>
              </div>
              <div className="logo-title-sub" style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Finanzas
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hide-on-mobile" style={{ width: '1px', height: '22px', background: 'var(--border-subtle)', margin: '0 0.1rem' }} />

          {/* Client Workspace Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            padding: '0.25rem 0.55rem',
            borderRadius: '9px',
            minWidth: 0
          }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>
              {activeCompany?.emoji || '🍟'}
            </span>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeCompany?.name || 'La Papería'}
              </div>
              <div className="nav-company-name-sub" style={{ fontSize: '0.62rem', color: 'var(--amber-light)', fontWeight: 600 }}>
                {activeCompany?.industry || 'Comidas'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Group: DB Status, Export, User & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {/* Supabase Cloud Status Indicator */}
          <button
            type="button"
            onClick={onOpenSupabase}
            className="btn btn-outline btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderRadius: '8px',
              borderColor: dbStatus?.initialized ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
              background: dbStatus?.initialized ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer'
            }}
            title="Estado de base de datos Supabase"
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: dbStatus?.initialized ? '#10b981' : '#f59e0b',
              boxShadow: `0 0 6px ${dbStatus?.initialized ? '#10b981' : '#f59e0b'}`
            }} />
            <Database size={13} style={{ color: dbStatus?.initialized ? '#34d399' : '#fbbf24' }} />
            <span className="hide-on-mobile" style={{ fontSize: '0.74rem', fontWeight: 600, color: dbStatus?.initialized ? '#34d399' : '#fbbf24' }}>
              {dbStatus?.initialized ? 'Supabase' : 'DB'}
            </span>
          </button>

          {/* Export Button (Admin only) */}
          {currentRole === 'admin' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onOpenExport}
              title="Exportar información a Excel o respaldos"
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <Download size={13} />
              <span className="hide-on-mobile">Exportar</span>
            </button>
          )}

          {/* Live Clock (Desktop only) */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', paddingLeft: '0.25rem' }}>
            <Clock size={13} style={{ color: 'var(--amber-primary)' }} />
            <span>{timeStr}</span>
          </div>

          {/* User Profile & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--bg-secondary)',
            padding: '0.2rem 0.45rem',
            borderRadius: '9px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: currentUser?.role === 'admin' ? 'var(--amber-glow)' : 'var(--emerald-glow)',
              color: currentUser?.role === 'admin' ? 'var(--amber-light)' : 'var(--emerald-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                {currentUser?.name || 'Usuario'}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.15rem 0.35rem', minHeight: '26px', color: 'var(--rose-light)', borderColor: 'rgba(244, 63, 94, 0.25)' }}
              title="Cerrar Sesión / Salir"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* TIER 2: Role Switcher (100% width on mobile) */}
      <div className="nav-header-row-2">
        <div className="role-switcher">
          <button
            type="button"
            className={`role-btn ${currentRole === 'cajero' ? 'active cashier' : ''}`}
            onClick={() => onSelectRole('cajero')}
          >
            <UserCheck size={15} />
            <span>Cajero</span>
          </button>
          
          <button
            type="button"
            className={`role-btn ${currentRole === 'admin' ? 'active admin' : ''}`}
            onClick={() => onSelectRole('admin')}
            style={{ position: 'relative' }}
          >
            <ShieldCheck size={15} />
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
      </div>
    </header>
  );
}
