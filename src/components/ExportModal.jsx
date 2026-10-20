import React, { useRef } from 'react';
import { Download, Upload, FileSpreadsheet, Database, X, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ExportModal({ 
  isOpen, onClose, 
  transactions, dailyCloses, categories, 
  onRestoreData, onResetDemo,
  activeCompany
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const companySlug = (activeCompany?.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_');

  // Export Transactions to CSV (Excel compatible with UTF-8 BOM)
  const exportTransactionsCSV = () => {
    const headers = ['ID', 'Fecha', 'Descripción', 'Tipo', 'Categoría', 'Monto', 'Método'];
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.fecha}"`,
      `"${(t.descripcion || '').replace(/"/g, '""')}"`,
      `"${t.tipo}"`,
      `"${t.categoria}"`,
      t.monto,
      `"${t.metodo || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${companySlug}_Movimientos_Quadra_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Daily Closes to CSV
  const exportClosesCSV = () => {
    const headers = ['ID', 'Fecha', 'Hora', 'Cajero', 'Turno', 'Caja_Esperada', 'Efectivo', 'Banco', 'Gastos', 'Nomina', 'Total_Calculado', 'Descuadre', 'Estado_Cuadre', 'Estado_Revision', 'Notas'];
    const rows = dailyCloses.map(c => [
      `"${c.id}"`,
      `"${c.fecha}"`,
      `"${c.hora}"`,
      `"${c.cajero}"`,
      `"${c.turno}"`,
      c.cajaEsperada,
      c.efectivo,
      c.banco,
      c.gastos,
      c.nomina,
      c.totalCalculado,
      c.descuadre,
      `"${c.estadoCuadre}"`,
      `"${c.estadoRevision || 'Pendiente'}"`,
      `"${(c.notas || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${companySlug}_Cierres_Caja_Quadra_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Full JSON Backup
  const exportFullJSON = () => {
    const backupData = {
      platform: 'Quadra Cloud SaaS',
      companyId: activeCompany?.id,
      companyName: activeCompany?.name || 'Empresa',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      dailyCloses,
      categories
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${companySlug}_Respaldo_Quadra_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restore JSON
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.transactions && json.dailyCloses) {
          onRestoreData(json);
          alert('¡Copia de seguridad restaurada con éxito!');
          onClose();
        } else {
          alert('El archivo no tiene el formato de respaldo válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--amber-light)' }}>
            <Download size={20} />
            Exportar Datos & Respaldos
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Tus datos se guardan automáticamente en tu navegador. Desde aquí puedes descargar reportes para Excel o guardar una copia de seguridad externa.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1.15rem' }}
            onClick={exportTransactionsCSV}
          >
            <FileSpreadsheet size={18} style={{ color: 'var(--emerald-light)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Descargar Movimientos para Excel (.CSV)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Compatible con Microsoft Excel, Google Sheets o LibreOffice</div>
            </div>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1.15rem' }}
            onClick={exportClosesCSV}
          >
            <FileSpreadsheet size={18} style={{ color: 'var(--blue-primary)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Descargar Arqueos de Caja (.CSV)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Historial completo de cierres de caja y cuadres</div>
            </div>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1.15rem' }}
            onClick={exportFullJSON}
          >
            <Database size={18} style={{ color: 'var(--amber-light)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Copia de Seguridad Completa (.JSON)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Descarga todo el sistema para guardarlo o migrar de equipo</div>
            </div>
          </button>
        </div>

        {/* Restore section */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <Upload size={14} />
              Restaurar Respaldo
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--rose-light)', borderColor: 'rgba(244,63,94,0.3)' }}
              onClick={() => {
                if (confirm('¿Restablecer los datos de demostración de Septiembre 2026? Se reemplazarán los datos actuales.')) {
                  onResetDemo();
                  onClose();
                }
              }}
            >
              <RefreshCw size={14} />
              Cargar Datos Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
