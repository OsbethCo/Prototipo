import React, { useState } from 'react';
import { Producto } from '../types/Producto';
import '../styles/productoslist.css';
import { reportService } from '../services/exportService';

interface ListaClinicaProps {
  productos: Producto[];
  onVerDetalle: (producto: Producto) => void;
  onEliminar?: (id: string) => void; // ✅ ahora opcional
}

const ListaClinica: React.FC<ListaClinicaProps> = ({
  productos,
  onVerDetalle,
  onEliminar,
}) => {
  const [busqueda, setBusqueda] = useState('');

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="productos-list">
      <h2 className="productos-title">Productos Clínicos</h2>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="productos-search"
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button
          onClick={() => reportService.exportarInventario(productosFiltrados, 'Inventario Clínico')}
          className="btn btn-secondary"
          style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          📄 Exportar PDF
        </button>
      </div>

      {productosFiltrados.length === 0 && (
        <div className="mensaje-vacio">No hay productos registrados.</div>
      )}

      {productosFiltrados.length > 0 && (
        <div className="table-responsive">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Presentación</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Fecha vencimiento</th>
                <th>Lote</th>
                <th>Ubicación</th>
                <th>Condiciones</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productosFiltrados.map(producto => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.tipoPresentacion || producto.medida}</td>
                  <td>{producto.cantidad}</td>
                  <td>{producto.unidadMedida || '—'}</td>

                  {/* ✅ CORREGIDO */}
                  <td>{producto.fechaVencimiento}</td>

                  <td>{producto.lote}</td>
                  <td>{producto.ubicacion || 'No asignada'}</td>
                  <td>{producto.condicionesAlmacenamiento || '—'}</td>

                  <td>
                    <button
                      onClick={() => onVerDetalle(producto)}
                      className="productos-details"
                    >
                      Información
                    </button>

                    {onEliminar && (
                      <button
                        onClick={() => onEliminar(producto.id)}
                        className="productos-delete"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaClinica;