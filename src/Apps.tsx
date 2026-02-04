import React, { useState } from 'react';

// UI
import SidebarUsuario from './components/Usuario/SidebarUsu';
import Header from './components/Header';

// Views
import ListaClinica from './components/listaclinica';
import ListaComercial from './components/listacomercial';
import ProductoDetalle from './components/ProductoDetalle';
import RetiroForm from './components/RetiroForm';
import Historial from './components/Historial';
import Pacientes from './components/Hpaciente';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Types
import { Producto } from './types/Producto';

// Styles
import './styles/index.css';
import './styles/modal.css';

type Section =
  | 'clinica'
  | 'comercial'
  | 'dashboard'
  | 'retirarProducto'
  | 'historial'
  | 'pacientes';

// Estructura de historial compatible con Historial.tsx
interface HistorialItem {
  nombre: string;
  cantidadMedida?: number;
  unidadMedida?: string;
  lista: string;
  fechaRetiro: string;
  persona: {
    nombre: string;
    apellido?: string;
    cargo: string;
  };
}

// Estructura de paciente compatible con Hpacientes.tsx
interface RegistroPaciente {
  producto: string;
  paciente: string;
  medida?: string;
  lugar?: string;
  serie?: string;
  lista: string;
  fechaRetiro: string;
  personaRetiro: string;
  cargo: string;
}

const Appi: React.FC = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('dashboard');

  const [productosClinicos, setProductosClinicos] = useState<Producto[]>([]);
  const [productosComerciales, setProductosComerciales] = useState<Producto[]>([]);

  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [pacientes, setPacientes] = useState<RegistroPaciente[]>([]);

  const [mostrarCerrarSesion, setMostrarCerrarSesion] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!usuario) return <Login onLogin={setUsuario} />;

  const handleRetiro = (data: any) => {
    // Agrega al historial
    setHistorial(prev => [
      ...prev,
      {
        nombre: data.nombre,
        cantidadMedida: data.cantidad,
        unidadMedida: data.tipoPresentacion,
        lista: data.lista || 'Clínica',
        fechaRetiro: data.fechaRetiro,
        persona: {
          nombre: data.persona,
          apellido: data.apellido || '', // opcional
          cargo: data.cargo,
        },
      },
    ]);

    // Si es para un paciente, agrega al registro de pacientes
    if (data.paciente) {
      setPacientes(prev => [
        ...prev,
        {
          producto: data.nombre,
          paciente: data.paciente,
          medida: data.tipoPresentacion,
          lugar: data.lugar || '',
          serie: data.lote,
          lista: data.lista || 'Clínica',
          fechaRetiro: data.fechaRetiro,
          personaRetiro: data.persona,
          cargo: data.cargo,
        },
      ]);
    }

    // Actualiza inventario clínico
    setProductosClinicos(prev =>
      prev.map(p =>
        p.nombre === data.nombre && p.lote === data.lote
          ? { ...p, cantidad: Math.max(0, p.cantidad - data.cantidad) }
          : p
      )
    );

    // También podrías actualizar productos comerciales si fuese necesario
    setProductosComerciales(prev =>
      prev.map(p =>
        p.nombre === data.nombre && p.lote === data.lote
          ? { ...p, cantidad: Math.max(0, p.cantidad - data.cantidad) }
          : p
      )
    );
  };

  const renderContent = () => {
    switch (section) {
      case 'dashboard':
        return (
          <Dashboard
            productos={[...productosClinicos, ...productosComerciales]}
            historial={historial}
          />
        );
      case 'clinica':
        return (
          <ListaClinica
            productos={productosClinicos}
            onVerDetalle={setProductoDetalle}
          />
        );

      case 'comercial':
        return (
          <ListaComercial
            productos={productosComerciales}
            onVerDetalle={setProductoDetalle}
          />
        );

      case 'retirarProducto':
        return (
          <RetiroForm
            productos={[...productosClinicos, ...productosComerciales]}
            onRetiro={handleRetiro}
          />
        );

      case 'historial':
        return <Historial historial={historial} />;

      case 'pacientes':
        return <Pacientes pacientes={pacientes} />;

      default:
        return null;
    }
  };

  return (
    <div className="App">
      <SidebarUsuario
        onSelect={section => setSection(section as Section)}
        onLogout={() => setMostrarCerrarSesion(true)}
        activeSection={section}
      />

      <main>
        <Header />
        <div key={section} className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      {productoDetalle && (
        <ProductoDetalle
          producto={productoDetalle}
          onClose={() => setProductoDetalle(null)}
        />
      )}

      {mostrarCerrarSesion && (
        <div className="modal-cerrar-sesion">
          <div className="modal-content">
            <h3>Cerrar sesión</h3>

            <input
              placeholder="Usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              onClick={() => {
                if (username === 'admin' && password === '1234') {
                  setUsuario(null);
                  setMostrarCerrarSesion(false);
                } else {
                  alert('Credenciales incorrectas');
                }
              }}
            >
              Confirmar
            </button>

            <button onClick={() => setMostrarCerrarSesion(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appi;

//pagina de trabajador