import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onSuccess, currentPin }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pinInput === currentPin) {
      setPinInput('');
      setErrorMsg('');
      onSuccess();
    } else {
      setErrorMsg('PIN incorrecto. Intenta nuevamente.');
      setPinInput('');
    }
  };

  const handleKeyPress = (digit) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === currentPin) {
          setTimeout(() => {
            setPinInput('');
            setErrorMsg('');
            onSuccess();
          }, 150);
        } else {
          setErrorMsg('PIN incorrecto.');
          setTimeout(() => setPinInput(''), 400);
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'var(--amber-glow)',
          border: '1px solid var(--amber-primary)',
          color: 'var(--amber-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <Lock size={26} />
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>Acceso Administrativo</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Ingresa el PIN de seguridad para acceder a los reportes y configuración.
        </p>

        {/* PIN Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid var(--amber-primary)',
                background: pinInput.length > i ? 'var(--amber-primary)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            color: 'var(--rose-light)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.65rem',
          maxWidth: '260px',
          margin: '0 auto 1.25rem'
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '1.25rem', fontWeight: 'bold', height: '52px', borderRadius: '12px' }}
              onClick={() => handleKeyPress(d)}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
            onClick={() => setPinInput('')}
          >
            Limpiar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '1.25rem', fontWeight: 'bold', height: '52px', borderRadius: '12px' }}
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.9rem' }}
            onClick={handleDelete}
          >
            ⌫
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          PIN por defecto: <strong style={{ color: 'var(--amber-light)' }}>1234</strong>
        </div>
      </div>
    </div>
  );
}
