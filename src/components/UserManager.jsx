import React, { useState } from 'react';
import { 
  Users, UserPlus, KeyRound, ShieldCheck, UserCheck, 
  Trash2, Mail, Lock, PlusCircle, CheckCircle2, AlertCircle, X, Shield 
} from 'lucide-react';

export default function UserManager({ 
  users, 
  activeCompany, 
  currentUser,
  onAddUser, 
  onUpdateUser, 
  onDeleteUser 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New user form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cajero');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit password form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Filter users belonging to active company
  const companyUsers = users.filter(u => u.companyId === activeCompany?.id);
  const adminCount = companyUsers.filter(u => u.role === 'admin').length;
  const cashierCount = companyUsers.filter(u => u.role === 'cajero').length;

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('cajero');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      setFormError(`El correo ${email} ya está registrado en el sistema.`);
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      role: role,
      companyId: activeCompany.id
    };

    onAddUser(newUser);
    setFormSuccess(`¡Usuario "${newUser.name}" registrado con éxito!`);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 1000);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setEditError('');
    setEditSuccess('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (newPassword.length < 4) {
      setEditError('La contraseña o PIN debe contener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setEditError('Las contraseñas no coinciden.');
      return;
    }

    onUpdateUser(selectedUser.id, { password: newPassword });
    setEditSuccess('¡Contraseña actualizada exitosamente!');
    setTimeout(() => {
      setIsEditModalOpen(false);
    }, 900);
  };

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario con sesión activa.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar el acceso para ${user.name} (${user.email})?`)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Stats */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-light)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Users size={18} />
            GESTIÓN DE PERSONAL & ACCESOS • {activeCompany?.name}
          </div>
          <h2 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0.15rem' }}>Usuarios y Cajeros del Negocio</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Administra qué colaboradores tienen acceso al turno de caja y quiénes tienen privilegios gerenciales.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.25rem' }}
        >
          <UserPlus size={17} />
          <span>+ Registrar Nuevo Usuario</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--emerald-primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Personal Activo
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
            {companyUsers.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>usuarios</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--amber-primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Administradores (Gerencia)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber-light)', marginTop: '0.25rem' }}>
            {adminCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--blue-primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Cajeros (Operativos)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue-light)', marginTop: '0.25rem' }}>
            {cashierCount}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Listado de Usuarios Registrados</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Usuario / Nombre</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Correo Electrónico</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Rol / Nivel de Acceso</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>PIN / Contraseña</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {companyUsers.map(user => {
                const isAdmin = user.role === 'admin';
                const isCurrent = user.id === currentUser?.id;

                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: isAdmin ? 'var(--amber-glow)' : 'var(--blue-glow)',
                          color: isAdmin ? 'var(--amber-light)' : 'var(--blue-light)',
                          border: `1px solid ${isAdmin ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.95rem'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {user.name}
                            {isCurrent && (
                              <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                Tú
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {user.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={14} style={{ color: 'var(--text-dim)' }} />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: isAdmin ? 'var(--amber-light)' : 'var(--blue-light)',
                        border: `1px solid ${isAdmin ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`
                      }}>
                        {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                        {isAdmin ? 'Administrador' : 'Cajero'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', letterSpacing: '0.15em', background: 'rgba(0, 0, 0, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                          ••••
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: 'var(--amber-light)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                          title="Cambiar PIN o Contraseña de este usuario"
                        >
                          <KeyRound size={12} />
                          <span>Cambiar</span>
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={isCurrent}
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '0.35rem 0.65rem',
                          color: isCurrent ? 'var(--text-dim)' : 'var(--rose-light)',
                          borderColor: isCurrent ? 'transparent' : 'rgba(244, 63, 94, 0.25)',
                          cursor: isCurrent ? 'not-allowed' : 'pointer'
                        }}
                        title={isCurrent ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTRAR NUEVO USUARIO */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} style={{ color: 'var(--amber-light)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Registrar Nuevo Usuario</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose-primary)', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-primary)', color: 'var(--emerald-light)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={15} />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Colaborador</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Mateo Gómez"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico (Ingreso)</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="mateo@empresa.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol / Nivel de Acceso</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="cajero">💵 Cajero (Solo Turnos de Caja y Arqueos)</option>
                  <option value="admin">🛡️ Administrador (Acceso Completo y Finanzas)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Contraseña o PIN Inicial</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres (ej. 4567)"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Guardar & Habilitar Acceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CAMBIAR CONTRASEÑA / PIN */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} style={{ color: 'var(--amber-light)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Cambiar PIN / Clave</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Asigna una nueva clave o PIN para <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            {editError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose-primary)', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={15} />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--emerald-primary)', color: 'var(--emerald-light)', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={15} />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Nueva Contraseña o PIN</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Actualizar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
