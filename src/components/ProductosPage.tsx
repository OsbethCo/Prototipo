import React, { useEffect, useState } from 'react';
import { productoService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Producto } from '../types/Producto';

const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const load = async () => {
    setLoading(true);
    try {
      const data = await productoService.getAll();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error cargando productos', err);
      showNotification('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="productos-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>Productos</h2>
        <div>
          <button className="btn btn-secondary" onClick={load} disabled={loading} style={{ marginRight: 8 }}>
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {productos.length === 0 ? (
        <div>No hay productos registrados.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="productos-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Medida</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Cantidad</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p: any, i) => (
                <tr key={p.id ?? i}>
                  <td style={{ padding: 8 }}>{p.nombre}</td>
                  <td style={{ padding: 8 }}>{p.medida}</td>
                  <td style={{ padding: 8 }}>{p.lote}</td>
                  <td style={{ padding: 8 }}>{p.fecha_vencimiento || p.fechaVencimiento || '-'}</td>
                  <td style={{ padding: 8 }}>{p.stock_actual ?? p.cantidad ?? '-'}</td>
                  <td style={{ padding: 8 }}>{p.ubicacion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductosPage;
