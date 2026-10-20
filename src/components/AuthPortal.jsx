import React, { useState } from 'react';
import { 
  Building2, Mail, Lock, User, ArrowRight, Sparkles, 
  Store, CheckCircle2, AlertCircle, ShieldCheck, UserCheck, 
  Briefcase, PlusCircle, Database, KeyRound, ArrowLeft, Eye, EyeOff, ShieldAlert
} from 'lucide-react';

export default function AuthPortal({ 
  companies, 
  users, 
  onLogin, 
  onRegisterCompany,
  onUpdateUserPassword,
  dbStatus,
  onOpenSupabase
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register company fields
  const [compName, setCompName] = useState('');
  const [compEmoji, setCompEmoji] = useState('🍟');
  const [compIndustry, setCompIndustry] = useState('Comidas Rápidas');
  
  // Admin credentials
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Cashier credentials
  const [cashierName, setCashierName] = useState('Cajero Turno');
  const [cashierEmail, setCashierEmail] = useState('');
  const [cashierPassword, setCashierPassword] = useState('');

  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Forgot password fields
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp + new pass, 3: success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [targetCompany, setTargetCompany] = useState(null);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    
    const user = users.find(u => 
      u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim() &&
      u.password === loginPassword.trim()
    );

    if (!user) {
      setLoginError('Correo o contraseña incorrectos. Por favor verifica tus credenciales.');
      return;
    }

    const company = companies.find(c => c.id === user.companyId);
    if (!company) {
      setLoginError('Empresa no encontrada para este usuario.');
      return;
    }

    onLogin(user, company);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    setRegisterError('');

    if (!compName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setRegisterError('Por favor completa todos los campos requeridos marcados con (*).');
      return;
    }

    // Check if email already taken
    if (users.some(u => u.email.toLowerCase() === adminEmail.toLowerCase().trim())) {
      setRegisterError('Este correo electrónico ya está registrado en Quadra Cloud.');
      return;
    }

    const newCompanyId = `comp-${Date.now()}`;
    const newCompany = {
      id: newCompanyId,
      name: compName.trim(),
      emoji: compEmoji || '🏢',
      industry: compIndustry,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const newAdminUser = {
      id: `usr-adm-${Date.now()}`,
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword.trim(),
      name: adminName.trim() || 'Administrador',
      role: 'admin',
      companyId: newCompanyId
    };

    // Cashier user
    const finalCashierEmail = cashierEmail.trim() || `cajero@${adminEmail.split('@')[1] || 'empresa.com'}`;
    const finalCashierPass = cashierPassword.trim() || adminPassword.trim();
    const newCashierUser = {
      id: `usr-cash-${Date.now()}`,
      email: finalCashierEmail.toLowerCase(),
      password: finalCashierPass,
      name: cashierName.trim() || 'Cajero Principal',
      role: 'cajero',
      companyId: newCompanyId
    };

    onRegisterCompany(newCompany, [newAdminUser, newCashierUser]);
    setRegisterSuccess(`¡Empresa "${newCompany.name}" registrada con éxito! Ingresando...`);

    setTimeout(() => {
      onLogin(newAdminUser, newCompany);
    }, 1000);
  };

  // PASSWORD RECOVERY HANDLERS
  const handleForgotStep1Submit = (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessMsg('');

    const trimmedEmail = forgotEmail.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase().trim() === trimmedEmail);

    if (!user) {
      setForgotError(`No existe ninguna cuenta registrada con el correo "${forgotEmail}". Verifica tu dirección o regístrate.`);
      return;
    }

    const comp = companies.find(c => c.id === user.companyId);
    setTargetUser(user);
    setTargetCompany(comp);

    // Generate 6-digit verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotOtp(generatedCode);
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotStep(2);
    setForgotSuccessMsg(`Código de verificación generado: [ ${generatedCode} ]. En producción este código se envía a tu correo.`);
  };

  const handleForgotStep2Submit = (e) => {
    e.preventDefault();
    setForgotError('');

    if (enteredOtp.trim() !== forgotOtp) {
      setForgotError('El código de verificación ingresado no es válido. Verifica los 6 dígitos.');
      return;
    }

    if (newPassword.length < 4) {
      setForgotError('La nueva contraseña o PIN debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Las contraseñas no coinciden. Por favor asegúrate de que sean idénticas.');
      return;
    }

    if (onUpdateUserPassword) {
      onUpdateUserPassword(targetUser.id, newPassword);
    }

    setForgotStep(3);
  };

  const handleFinishRecovery = () => {
    setMode('login');
    setLoginEmail(targetUser?.email || forgotEmail);
    setLoginPassword('');
    setLoginError('');
    setForgotStep(1);
    setForgotError('');
    setForgotSuccessMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 60%), #0a0e17'
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        
        {/* Header Logo: Quadra SaaS */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#fff',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
            marginBottom: '0.85rem',
            letterSpacing: '-0.04em'
          }}>
            Q
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
            QUADRA <span style={{ color: 'var(--emerald-light)', fontSize: '1.1rem', verticalAlign: 'middle', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>CLOUD</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Plataforma SaaS de Control de Caja & Finanzas para Negocios y Comercios
          </p>

          {/* Supabase Status Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.85rem' }}>
            <button
              type="button"
              onClick={onOpenSupabase}
              style={{
                background: dbStatus?.initialized ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${dbStatus?.initialized ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                borderRadius: '999px',
                padding: '0.35rem 0.9rem',
                fontSize: '0.78rem',
                color: dbStatus?.initialized ? '#34d399' : '#fbbf24',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Click para ver estado y script SQL de Supabase"
            >
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: dbStatus?.initialized ? '#10b981' : '#f59e0b',
                boxShadow: `0 0 6px ${dbStatus?.initialized ? '#10b981' : '#f59e0b'}`
              }} />
              <Database size={13} />
              <span>
                {dbStatus?.initialized ? 'Supabase Cloud: Conectado & En Línea' : 'Supabase Cloud: Conectado (Ver Script SQL)'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Iniciar Sesión / Registrar Empresa / Recuperar */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '4px',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          gap: '4px'
        }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, border: 'none', borderRadius: '12px', padding: '0.65rem' }}
            onClick={() => { setMode('login'); setLoginError(''); setRegisterError(''); setForgotError(''); }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, border: 'none', borderRadius: '12px', padding: '0.65rem' }}
            onClick={() => { setMode('register'); setLoginError(''); setRegisterError(''); setForgotError(''); }}
          >
            + Registrar Empresa
          </button>
          {mode === 'forgot' && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              style={{ flex: 1, border: 'none', borderRadius: '12px', padding: '0.65rem', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
            >
              Recuperar Acceso
            </button>
          )}
        </div>

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
          <div className="glass-card" style={{ border: '1px solid var(--border-card)' }}>
            
            {loginError && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid var(--rose-primary)',
                color: 'var(--rose-light)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="ej. admin@lapaperia.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Contraseña / PIN</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotEmail(loginEmail);
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccessMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--amber-light)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0
                    }}
                  >
                    <KeyRound size={13} />
                    <span>¿Olvidaste tu contraseña o PIN?</span>
                  </button>
                </div>

                <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                <span>Ingresar a Mi Empresa</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* MODE 2: REGISTER NEW COMPANY */}
        {mode === 'register' && (
          <div className="glass-card" style={{ border: '1px solid var(--border-card)' }}>
            
            {registerSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--emerald-primary)',
                color: 'var(--emerald-light)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{registerSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                {registerError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--rose-primary)',
                    color: '#fca5a5',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={17} style={{ flexShrink: 0 }} />
                    <span>{registerError}</span>
                  </div>
                )}

                <div style={{ fontSize: '0.85rem', color: 'var(--amber-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Store size={15} /> 1. Datos de Tu Empresa
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Emoji</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ textAlign: 'center', fontSize: '1.3rem', padding: '0.65rem' }}
                      value={compEmoji}
                      onChange={e => setCompEmoji(e.target.value)}
                      maxLength={2}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nombre del Negocio</label>
                    <input
                      type="text"
                      className="form-control"
                      value={compName}
                      onChange={e => setCompName(e.target.value)}
                      placeholder="Ej. Burger Station, Café Roma"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Negocio / Insumos</label>
                  <select
                    className="form-control"
                    value={compIndustry}
                    onChange={e => setCompIndustry(e.target.value)}
                  >
                    <option value="Comidas Rápidas">🍔 Comidas Rápidas / Restaurante</option>
                    <option value="Cafetería / Bar">☕ Cafetería / Bar</option>
                    <option value="Comercio / Tienda">🛍️ Comercio / Tienda de Ropa o Abarrotes</option>
                    <option value="Servicios">💼 Servicios Generales</option>
                  </select>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--amber-light)', fontWeight: 700, textTransform: 'uppercase', margin: '1.25rem 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={15} /> 2. Usuario Administrador (Gerente)
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre del Gerente</label>
                  <input
                    type="text"
                    className="form-control"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Correo de Ingreso</label>
                    <input
                      type="email"
                      className="form-control"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="carlos@mitienda.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contraseña / PIN</label>
                    <input
                      type="password"
                      className="form-control"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••"
                      required
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--emerald-light)', fontWeight: 700, textTransform: 'uppercase', margin: '1.25rem 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={15} /> 3. Usuario Cajero (Para Turnos de Caja)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Correo Cajero</label>
                    <input
                      type="email"
                      className="form-control"
                      value={cashierEmail}
                      onChange={e => setCashierEmail(e.target.value)}
                      placeholder="caja@mitienda.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PIN del Cajero</label>
                    <input
                      type="password"
                      className="form-control"
                      value={cashierPassword}
                      onChange={e => setCashierPassword(e.target.value)}
                      placeholder="1234"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-emerald"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                >
                  <PlusCircle size={18} />
                  <span>Crear Mi Empresa & Comenzar</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 3: FORGOT / RESET PASSWORD */}
        {mode === 'forgot' && (
          <div className="glass-card" style={{ border: '1px solid var(--border-card)' }}>
            
            {/* Header: Back to login */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ArrowLeft size={16} />
                <span>Volver a Iniciar Sesión</span>
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--amber-light)', fontWeight: 700, background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                Recuperación Segura
              </span>
            </div>

            {/* Error banner */}
            {forgotError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--rose-primary)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Verify Email */}
            {forgotStep === 1 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    background: 'var(--amber-glow)',
                    color: 'var(--amber-light)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <KeyRound size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.35rem' }}>¿Olvidaste tu contraseña?</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Ingresa el correo electrónico asociado a tu cuenta de Quadra Cloud para enviarte un código de seguridad.
                  </p>
                </div>

                <form onSubmit={handleForgotStep1Submit}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Correo Electrónico Registrado</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                      <input
                        type="email"
                        className="form-control"
                        style={{ paddingLeft: '2.5rem' }}
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="ej. admin@lapaperia.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    <span>Verificar Cuenta & Enviar Código</span>
                    <ArrowRight size={17} />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Enter OTP & Set New Password */}
            {forgotStep === 2 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    background: 'var(--emerald-glow)',
                    color: 'var(--emerald-light)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <ShieldCheck size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem' }}>Establecer Nueva Contraseña</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Identificado: <strong>{targetCompany?.emoji} {targetCompany?.name}</strong> • {targetUser?.name} ({targetUser?.role})
                  </p>
                </div>

                {/* OTP Simulation Notification */}
                {forgotSuccessMsg && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: 'var(--emerald-light)',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Sparkles size={16} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Código de seguridad:</strong> <code style={{ fontSize: '1rem', fontWeight: 800, background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', letterSpacing: '0.1em' }}>{forgotOtp}</code>
                    </div>
                  </div>
                )}

                <form onSubmit={handleForgotStep2Submit}>
                  <div className="form-group">
                    <label className="form-label">Código de Verificación (6 dígitos)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value)}
                      placeholder="Ingresa los 6 dígitos"
                      maxLength={6}
                      style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em', fontWeight: 700 }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nueva Contraseña o PIN</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres (ej. 1234)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Confirmar Nueva Contraseña</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    <span>Confirmar & Restablecer Clave</span>
                    <CheckCircle2 size={17} />
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: Success Screen */}
            {forgotStep === 3 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--emerald-light)',
                  border: '2px solid var(--emerald-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#fff' }}>
                  ¡Contraseña Actualizada con Éxito!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                  Las credenciales de acceso para <strong>{targetUser?.email}</strong> en <strong>{targetCompany?.name}</strong> han sido renovadas. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>

                <button
                  type="button"
                  className="btn btn-emerald"
                  onClick={handleFinishRecovery}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                >
                  <span>Iniciar Sesión Ahora</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
