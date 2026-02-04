import React, { useMemo } from 'react';
import { Producto } from '../types/Producto';
import '../styles/estadisticas.css'; // Reusing styles for now

interface DashboardProps {
    productos: Producto[];
    historial: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ productos, historial }) => {
    const stats = useMemo(() => {
        const totalProductos = productos.length;
        const totalStock = productos.reduce((sum, p) => sum + p.cantidad, 0);
        const bajoStock = productos.filter(p => p.cantidad < 10).length;
        const retirosHoy = historial.filter(h => {
            const hoy = new Date().toISOString().split('T')[0];
            return h.fechaRetiro.startsWith(hoy);
        }).length;

        return { totalProductos, totalStock, bajoStock, retirosHoy };
    }, [productos, historial]);

    const recentActivity = useMemo(() => {
        return [...historial].sort((a, b) => new Date(b.fechaRetiro).getTime() - new Date(a.fechaRetiro).getTime()).slice(0, 5);
    }, [historial]);

    return (
        <div className="estadisticas-retiros">
            <div className="estadisticas-header">
                <h2>🚀 Panel de Control</h2>
                <p className="subtitulo">Resumen general del inventario y actividades</p>
            </div>

            <div className="estadisticas-generales">
                <div className="estadistica-card">
                    <div className="estadistica-icono">📦</div>
                    <div className="estadistica-contenido">
                        <h3>Productos</h3>
                        <div className="estadistica-valor">{stats.totalProductos}</div>
                        <p>En inventario</p>
                    </div>
                </div>

                <div className="estadistica-card">
                    <div className="estadistica-icono">📊</div>
                    <div className="estadistica-contenido">
                        <h3>Stock Total</h3>
                        <div className="estadistica-valor">{stats.totalStock}</div>
                        <p>Unidades disponibles</p>
                    </div>
                </div>

                <div className="estadistica-card">
                    <div className="estadistica-icono">⚠️</div>
                    <div className="estadistica-contenido">
                        <h3>Bajo Stock</h3>
                        <div className="estadistica-valor" style={{ color: stats.bajoStock > 0 ? '#ef4444' : 'inherit' }}>
                            {stats.bajoStock}
                        </div>
                        <p>Productos por agotar</p>
                    </div>
                </div>

                <div className="estadistica-card">
                    <div className="estadistica-icono">🕒</div>
                    <div className="estadistica-contenido">
                        <h3>Retiros Hoy</h3>
                        <div className="estadistica-valor">{stats.retirosHoy}</div>
                        <p>Actividad del día</p>
                    </div>
                </div>
            </div>

            <div className="grid-2-cols">
                <div className="grafico-container">
                    <h3>📋 Actividad Reciente</h3>
                    <div className="table-responsive">
                        {recentActivity.length > 0 ? (
                            <table className="tabla-estadisticas">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cant.</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.map((act, i) => (
                                        <tr key={i}>
                                            <td>{act.nombre}</td>
                                            <td>{act.cantidad}</td>
                                            <td>{new Date(act.fechaRetiro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No hay actividad reciente</p>
                        )}
                    </div>
                </div>

                <div className="grafico-container">
                    <h3>💡 Accesos Rápidos</h3>
                    <div className="acceso-rapido-container">
                        <p style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: 'span 2' }}>
                            Utiliza el menú lateral para gestionar el inventario, realizar retiros o consultar el historial completo.
                        </p>
                        {/* Puedes añadir botones reales aquí si lo deseas */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
