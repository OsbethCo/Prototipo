import React, { useState, useMemo } from 'react';
import { Producto } from '../types/Producto';
import { reportService } from '../services/exportService';
import '../styles/productoslist.css';

export interface RegistroPaciente {
    producto: string;
    paciente: string;
    medida?: string;
    unidadMedida?: string;
    lugar?: string;
    serie?: string;
    lista: string;
    fechaRetiro: string;
    personaRetiro: string;
    cargo: string;
}

interface GestionPacientesProps {
    productos: Producto[];
    pacientes: RegistroPaciente[];
    onVerDetalle: (producto: Producto) => void;
    onEliminarProducto?: (index: number) => void;
    initialTab?: Tab;
}

type Tab = 'inventario' | 'historial';
type ColumnaPaciente = keyof RegistroPaciente;

const GestionPacientes: React.FC<GestionPacientesProps> = ({
    productos,
    pacientes,
    onVerDetalle,
    onEliminarProducto,
    initialTab = 'inventario',
}) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [busqueda, setBusqueda] = useState('');

    // Estados para el historial
    const [columnaOrden, setColumnaOrden] = useState<ColumnaPaciente | null>(null);
    const [ordenAscendente, setOrdenAscendente] = useState(true);

    // Filtrado de Inventario
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.lote && p.lote.toLowerCase().includes(busqueda.toLowerCase()))
    );

    // Filtrado y Ordenación de Historial
    const pacientesFiltrados = useMemo(() => {
        let resultado = [...pacientes];

        if (busqueda.trim()) {
            const b = busqueda.toLowerCase();
            resultado = resultado.filter(p =>
                Object.values(p).some(valor =>
                    valor?.toString().toLowerCase().includes(b)
                )
            );
        }

        if (columnaOrden) {
            resultado.sort((a, b) => {
                const valorA = a[columnaOrden] ?? '';
                const valorB = b[columnaOrden] ?? '';
                if (valorA < valorB) return ordenAscendente ? -1 : 1;
                if (valorA > valorB) return ordenAscendente ? 1 : -1;
                return 0;
            });
        }

        return resultado;
    }, [pacientes, busqueda, columnaOrden, ordenAscendente]);

    const manejarOrdenar = (columna: ColumnaPaciente) => {
        if (columnaOrden === columna) {
            setOrdenAscendente(prev => !prev);
        } else {
            setColumnaOrden(columna);
            setOrdenAscendente(true);
        }
    };

    const obtenerIconoOrden = (columna: ColumnaPaciente) =>
        columnaOrden !== columna ? '↕️' : ordenAscendente ? '↑' : '↓';

    const formatearFecha = (fecha: string) => {
        const f = new Date(fecha);
        return isNaN(f.getTime()) ? fecha : f.toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="productos-list">
            <div className="gestion-header">
                <h2 className="productos-title">Gestión de Pacientes</h2>
                <div className="tab-container">
                    <button
                        className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventario')}
                    >
                        📦 Inventario de Paciente
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        📋 Historial de Registros
                    </button>
                </div>
            </div>

            <div className="actions-bar">
                <input
                    type="text"
                    placeholder={activeTab === 'inventario' ? "Buscar producto o lote..." : "Buscar paciente, producto o serie..."}
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="productos-search"
                />
                <button
                    onClick={() => {
                        const titulo = activeTab === 'inventario' ? 'Inventario de Paciente' : 'Historial de Pacientes';
                        reportService.exportarInventario(activeTab === 'inventario' ? productosFiltrados : pacientesFiltrados, titulo);
                    }}
                    className="btn btn-secondary"
                >
                    📄 Exportar PDF
                </button>
            </div>

            {activeTab === 'inventario' ? (
                <div className="table-responsive">
                    {productosFiltrados.length === 0 ? (
                        <div className="mensaje-vacio">No hay productos en el inventario de pacientes.</div>
                    ) : (
                        <table className="productos-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Presentación</th>
                                    <th>Cantidad</th>
                                    <th>Vencimiento</th>
                                    <th>Lote</th>
                                    <th>Ubicación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados.map((p, i) => (
                                    <tr key={p.id ?? i}>
                                        <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                                        <td>{p.medida}</td>
                                        <td><span className="stock-badge">{p.cantidad}</span></td>
                                        <td>{p.fechaVencimiento}</td>
                                        <td><span className="lot-badge">{p.lote}</span></td>
                                        <td>{p.ubicacion || '—'}</td>
                                        <td className="acciones">
                                            <button onClick={() => onVerDetalle(p)} className="productos-details">Ver Info</button>
                                            {onEliminarProducto && (
                                                <button onClick={() => onEliminarProducto(i)} className="productos-delete">Borrar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="table-responsive">
                    {pacientesFiltrados.length === 0 ? (
                        <div className="mensaje-vacio">No hay registros de retiro para pacientes.</div>
                    ) : (
                        <table className="productos-table">
                            <thead>
                                <tr>
                                    <th onClick={() => manejarOrdenar('paciente')} className="sortable">Paciente {obtenerIconoOrden('paciente')}</th>
                                    <td onClick={() => manejarOrdenar('producto')} className="sortable">Producto {obtenerIconoOrden('producto')}</td>
                                    <th>Cantidad / Medida</th>
                                    <th>Lugar</th>
                                    <th>Serie/Lista</th>
                                    <th onClick={() => manejarOrdenar('fechaRetiro')} className="sortable">Fecha {obtenerIconoOrden('fechaRetiro')}</th>
                                    <th>Retiró</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientesFiltrados.map((p, i) => (
                                    <tr key={i}>
                                        <td className="patient-name">{p.paciente || 'N/A'}</td>
                                        <td>{p.producto}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, color: '#2563eb' }}>
                                                    {p.unidadMedida ? `${p.unidadMedida}` : p.medida || '-'}
                                                </span>
                                                <small style={{ color: '#64748b' }}>{p.medida !== p.unidadMedida ? p.medida : ''}</small>
                                            </div>
                                        </td>
                                        <td>{p.lugar || '-'}</td>
                                        <td>
                                            <span className="lot-badge" title="Serie">{p.serie || '-'}</span>
                                            <span style={{ margin: '0 4px', color: '#ccc' }}>/</span>
                                            <span className="lot-badge" title="Lista" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>{p.lista || '-'}</span>
                                        </td>
                                        <td className="date-cell">{formatearFecha(p.fechaRetiro)}</td>
                                        <td>
                                            <div className="user-info">
                                                <strong>{p.personaRetiro}</strong>
                                                <span className={`role-badge ${p.cargo.toLowerCase()}`}>{p.cargo}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <style>{`
        .gestion-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid #eef2f7; padding-bottom: 1rem; }
        .tab-container { display: flex; gap: 0.5rem; }
        .tab-btn { padding: 0.75rem 1.5rem; border: none; background: #f1f5f9; color: #64748b; border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .tab-btn.active { background: #1e293b; color: #fff; }
        .tab-btn:hover:not(.active) { background: #e2e8f0; }
        .actions-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; }
        .productos-search { flex: 1; margin-bottom: 0 !important; }
        .sortable { cursor: pointer; user-select: none; }
        .sortable:hover { background: #f8fafc; }
        .patient-name { font-weight: 700; color: #0f172a; }
        .lot-badge { background: #f0fdf4; color: #166534; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; font-family: monospace; border: 1px solid #dcfce7; }
        .stock-badge { background: #eff6ff; color: #1e40af; padding: 0.2rem 0.6rem; border-radius: 0.4rem; font-weight: 700; }
        .user-info { display: flex; flex-direction: column; font-size: 0.85rem; }
        .role-badge { font-size: 0.75rem; padding: 0.1rem 0.4rem; border-radius: 0.25rem; width: fit-content; margin-top: 0.2rem; background: #f1f5f9; color: #475569; }
        .role-badge.médico { background: #fef2f2; color: #991b1b; }
        .role-badge.enfermera { background: #f0f9ff; color: #075985; }
        .date-cell { color: #64748b; font-size: 0.85rem; }
      `}</style>
        </div>
    );
};

export default GestionPacientes;
