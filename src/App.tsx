import React, { useState, useEffect } from 'react';

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

// Styles
import './styles/index.css';
import './styles/modal.css';

// User Profile Type (Solo supervisor)
interface UserProfile {
  id: number;
  nombre: string;
  usuario: string;
  rol: 'supervisor';
  createdAt?: string;
}

type Section =
  | 'clinica'
  | 'pacientes'
  | 'gestionPacientes'
  | 'dashboard'
  | 'estadisticas'
  | 'agregarProducto'
  | 'historial'
  | 'retirarProducto';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [section, setSection] = useState<Section>('dashboard');
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);

  // Cargar perfil de usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserProfile({
          id: user.id,
          nombre: user.nombre,
          usuario: user.usuario,
          rol: user.rol || 'trabajador',
          createdAt: user.createdAt
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  if (!userProfile) {
    return <Login onLogin={setUserProfile} />;
  }

  // Verificar si es admin/supervisor
  const isAdmin = userProfile.rol === 'supervisor' || userProfile.rol === 'admin' || userProfile.rol === 'Administrador';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    setUserProfile(null);
  };
  const handleSelectSection = (value: string) => {
    setSection(value as Section);
  };

  // --------------------
  // VISTAS
  // --------------------
  const renderContent = () => {
    // Si no es admin y intenta acceder a secciones de admin, redirigir a dashboard
    if (!isAdmin && (section === 'agregarProducto' || section === 'estadisticas')) {
      setSection('dashboard');
    }
    
    switch (section) {
      case 'dashboard':
        return (
          <Dashboard
            userProfile={userProfile}
          />
        );
      case 'clinica':
        return <ListaClinica onVerDetalle={setProductoDetalle} />;
      case 'pacientes':
        return (
          <GestionPacientes
            key="inv-view"
            initialTab="inventario"
            onVerDetalle={setProductoDetalle}
          />
        );
      case 'gestionPacientes':
        return (
          <GestionPacientes
            key="hist-view"
            initialTab="historial"
            onVerDetalle={setProductoDetalle}
          />
        );
      case 'agregarProducto':
        // Solo admin puede acceder
        if (!isAdmin) {
          setSection('dashboard');
          return null;
        }
        return <ProductoForm />;
      case 'retirarProducto':
        return <RetiroForm />;
      case 'historial':
        return <Historial />;
      case 'estadisticas':
        // Solo admin puede acceder
        if (!isAdmin) {
          setSection('dashboard');
          return null;
        }
        return <Estadisticas />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Sidebar 
        onSelect={handleSelectSection} 
        onLogout={handleLogout} 
        activeSection={section} 
        userProfile={userProfile}
        isAdmin={isAdmin}
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
    </div>
  );
};

export default App;

//Pagina supervisor