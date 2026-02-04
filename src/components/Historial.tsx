import React from 'react';
import '../styles/productoslist.css';
import { reportService } from '../services/exportService';

export interface HistorialItem {
  nombre: string;
  medida: string;
  cantidadMedida?: number;
  unidadMedida?: string;
  cantidad?: number;
  lista: string;
  destino?: string;
  fechaRetiro: string;
  categoria?: 'Interno' | 'Paciente';
  persona: {
    nombre: string;
    apellido?: string;
    cargo: string;
  };
}

interface HistorialProps {
  historial: HistorialItem[];
}

const Historial: React.FC<HistorialProps> = ({ historial }) => {
  if (historial.length === 0) {
    return (
      <div className="productos-list">
        <h2 className="productos-title">Historial de Retiros</h2>
        <div className="mensaje-vacio">No hay registros en el historial.</div>
      </div>
    );
  }

  return (
    <div className="productos-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="productos-title" style={{ margin: 0 }}>Historial de Retiros</h2>
        <button
          onClick={() => reportService.exportarHistorial(historial)}
          className="btn btn-secondary"
          style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          📄 Exportar PDF
        </button>
      </div>

      <div className="table-responsive">
        <table className="productos-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad / Presentación</th>
              <th>Lista/Serie</th>
              <th>Categoría</th>
              <th>Destino</th>
              <th>Fecha</th>
              <th>Persona</th>
              <th>Cargo</th>
            </tr>
          </thead>

          <tbody>
            {historial.map((item, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{item.nombre}</td>

                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>
                      {item.cantidad ?? item.cantidadMedida} {item.unidadMedida || ''}
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{item.medida}</span>
                  </div>
                </td>

                <td><span className="lot-badge">{item.lista}</span></td>

                <td>
                  <span className={`cat-badge ${item.categoria?.toLowerCase() || 'interno'}`}>
                    {item.categoria || 'Interno'}
                  </span>
                </td>

                <td>
                  <span className="dest-badge">{item.destino || 'No especificado'}</span>
                </td>

                <td className="date-cell">{item.fechaRetiro}</td>

                <td>
                  {item.persona.nombre}
                  {item.persona.apellido ? ` ${item.persona.apellido}` : ''}
                </td>

                <td>
                  <span className={`role-badge ${item.persona.cargo.toLowerCase()}`}>
                    {item.persona.cargo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .cat-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .cat-badge.interno {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .cat-badge.paciente {
          background: #e0f2fe;
          color: #075985;
          border: 1px solid #bae6fd;
        }
        .dest-badge {
          font-size: 0.85rem;
          color: #1e293b;
          font-weight: 500;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .role-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.85em;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .date-cell {
            font-size: 0.85rem;
            color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default Historial;