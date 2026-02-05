import React, { useState, useEffect } from 'react';

// UI
import SidebarUsuario from './components/Usuario/SidebarUsu';
import Header from './components/Header';

// Views
import ListaClinica from './components/listaclinica';
import ProductoDetalle from './components/ProductoDetalle';
import RetiroForm from './components/RetiroForm';
import Historial from './components/Historial';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Types
import { Producto } from './types/Producto';

// Styles
import './styles/index.css';
import './styles/modal.css';

// User Profile Type (Solo trabajador)
interface UserProfile {
  id: number;
  nombre: string;
  usuario: string;
  rol: 'trabajador';
  createdAt?: string;
}

type Section =
  | 'clinica'
  | 'dashboard'
  | 'retirarProducto'
  | 'historial';

const Appi: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [section, setSection] = useState<Section>('dashboard');
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);

  const [mostrarCerrarSesion, setMostrarCerrarSesion] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Cargar perfil de usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Solo permitir acceso si es trabajador
        if ((user as unknown as UserProfile).rol === 'trabajador') {
          setUserProfile(user as unknown as UserProfile);
        } else {
          // Si es supervisor, limpiar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('usuario');
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  if (!userProfile) {
    return <Login onLogin={(user) => {
      // Solo permitir login si es trabajador
      if ((user as unknown as UserProfile).rol === 'trabajador') {
        setUserProfile(user as unknown as UserProfile);
      }
    }} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    setUserProfile(null);
  };

  const renderContent = () => {
    switch (section) {
      case 'dashboard':
        return <Dashboard />;
      case 'clinica':
        return <ListaClinica onVerDetalle={setProductoDetalle} />;
      case 'retirarProducto':
        return <RetiroForm />;
      case 'historial':
        return <Historial />;
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
                  handleLogout();
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
