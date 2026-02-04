import React, { useState } from 'react';

// UI
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Views
import ListaClinica from './components/listaclinica';
import ProductoForm from './components/ProductoForm';
import ProductoDetalle from './components/ProductoDetalle';
import Historial from './components/Historial';
import Login from './components/Login';
import RetiroForm from './components/RetiroForm';
import Estadisticas from './components/Estadisticas';
import Dashboard from './components/Dashboard';
import GestionPacientes from './components/GestionPacientes';

// Types
import { Producto } from './types/Producto';

import './styles/index.css';
import './styles/modal.css';


type Section =
  | 'clinica'
  | 'pacientes'
  | 'gestionPacientes'
  | 'dashboard'
  | 'estadisticas'
  | 'agregarProducto'
  | 'historial'
  | 'retirarProducto';

type ProductoSinId = Omit<Producto, 'id'>;

// --------------------
// RETIROS
// --------------------
export interface RetiroData {
  nombre: string;
  tipoPresentacion: string;
  lote: string;
  cantidad: number;
  unidadMedida?: string;
  fechaRetiro: string;
  paciente?: string;
  destino?: string;
  persona: {
    nombre: string;
    cargo: string;
  };
}

interface HistorialItem {
  nombre: string;
  medida: string;
  unidadMedida?: string;
  lista: string;
  cantidad: number;
  destino?: string;
  fechaRetiro: string;
  categoria: 'Interno' | 'Paciente';
  persona: {
    nombre: string;
    apellido: string;
    cargo: string;
  };
}

interface RegistroPaciente {
  producto: string;
  paciente: string;
  medida: string;
  unidadMedida?: string;
  lugar: string;
  serie: string;
  lista: string;
  fechaRetiro: string;
  personaRetiro: string;
  cargo: string;
}

const App: React.FC = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('dashboard');

  const [productosClinicos, setProductosClinicos] = useState<Producto[]>([]);
  const [productosComerciales, setProductosComerciales] = useState<Producto[]>([]);

  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [pacientesRegistrados, setPacientesRegistrados] = useState<RegistroPaciente[]>([]);

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  // --------------------
  // AGREGAR PRODUCTOS
  // --------------------
  const agregarClinico = (producto: ProductoSinId) => {
    setProductosClinicos(prev => [
      ...prev,
      { ...producto, id: crypto.randomUUID() },
    ]);
  };

  const agregarComercial = (producto: ProductoSinId) => {
    setProductosComerciales(prev => [
      ...prev,
      { ...producto, id: crypto.randomUUID() },
    ]);
  };

  // --------------------
  // RETIROS
  // --------------------
  const handleRetiro = (data: RetiroData) => {
    setHistorial(prev => [
      ...prev,
      {
        nombre: data.nombre,
        medida: data.tipoPresentacion,
        unidadMedida: data.unidadMedida,
        lista: data.lote,
        cantidad: data.cantidad,
        destino: data.destino,
        fechaRetiro: data.fechaRetiro,
        categoria: (typeof data.paciente === 'string' && data.paciente.trim() !== '') ? 'Paciente' : 'Interno',
        persona: {
          nombre: data.persona.nombre,
          apellido: '',
          cargo: data.persona.cargo,
        },
      },
    ]);

    if (typeof data.paciente === 'string' && data.paciente.trim() !== '') {
      setPacientesRegistrados(prev => [
        ...prev,
        {
          producto: data.nombre,
          paciente: data.paciente as string,
          medida: data.tipoPresentacion,
          unidadMedida: data.unidadMedida,
          lugar: data.destino ?? 'No especificado',
          serie: data.lote,
          lista: data.lote,
          fechaRetiro: data.fechaRetiro,
          personaRetiro: data.persona.nombre,
          cargo: data.persona.cargo,
        },
      ]);
    }

    const actualizar = (lista: Producto[]) =>
      lista.map(p =>
        p.nombre === data.nombre && p.lote === data.lote
          ? { ...p, cantidad: Math.max(0, p.cantidad - data.cantidad) }
          : p
      );

    if (productosClinicos.some(p => p.nombre === data.nombre && p.lote === data.lote)) {
      setProductosClinicos(actualizar);
    } else {
      setProductosComerciales(actualizar);
    }
  };

  // --------------------
  // NAVEGACIÓN
  // --------------------
  const handleSelectSection = (value: string) => {
    setSection(value as Section);
  };

  // --------------------
  // VISTAS
  // --------------------
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
        return <ListaClinica productos={productosClinicos} onVerDetalle={setProductoDetalle} />;
      case 'pacientes':
        return (
          <GestionPacientes
            key="inv-view"
            initialTab="inventario"
            productos={productosComerciales}
            pacientes={pacientesRegistrados}
            onVerDetalle={setProductoDetalle}
            onEliminarProducto={(idx) => {
              setProductosComerciales(prev => prev.filter((_, i) => i !== idx));
            }}
          />
        );
      case 'gestionPacientes':
        return (
          <GestionPacientes
            key="hist-view"
            initialTab="historial"
            productos={productosComerciales}
            pacientes={pacientesRegistrados}
            onVerDetalle={setProductoDetalle}
            onEliminarProducto={(idx) => {
              setProductosComerciales(prev => prev.filter((_, i) => i !== idx));
            }}
          />
        );
      case 'agregarProducto':
        return (
          <ProductoForm
            onAgregarClinico={agregarClinico}
            onAgregarComercial={agregarComercial}
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
      case 'estadisticas':
        return (
          <Estadisticas
            productos={[...productosClinicos, ...productosComerciales]}
            retiros={historial.map(h => ({
              nombre: h.nombre,
              tipoPresentacion: h.medida,
              lote: h.lista,
              cantidad: h.cantidad,
              fechaRetiro: h.fechaRetiro,
              persona: {
                nombre: h.persona.nombre,
                cargo: h.persona.cargo
              },
              categoria: h.categoria
            }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Sidebar onSelect={handleSelectSection} onLogout={() => setUsuario(null)} activeSection={section} />
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
    </div>
  );
};

export default App;

//Pagina supervisor