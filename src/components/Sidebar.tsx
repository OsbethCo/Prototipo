import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  MinusCircle,
  History,
  Users,
  BarChart3,
  Package,
  Stethoscope,
  LogOut
} from 'lucide-react';
import '../styles/sidebar.css';

interface SidebarProps {
  onSelect: (
    section:
      | 'clinica'
      | 'pacientes'
      | 'dashboard'
      | 'estadisticas'
      | 'agregarProducto'
      | 'registro'
      | 'historial'
      | 'gestionPacientes'
      | 'retirarProducto'
  ) => void;
  onLogout: () => void;
  activeSection: string;
  userProfile?: {
    id: number;
    nombre: string;
    usuario: string;
    rol: 'supervisor';
  };
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect, onLogout, activeSection, userProfile, isAdmin }) => {
  const [showInventarioList, setShowInventarioList] = useState(false);
  const [showRegistroList, setShowRegistroList] = useState(false);

  // Estado para confirmación de cierre de sesión
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [confirmUser, setConfirmUser] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [logoutError, setLogoutError] = useState('');

  const handleRegistroClick = () => {
    setShowRegistroList((prev) => !prev);
  };

  const handleInventarioClick = () => {
    setShowInventarioList((prev) => !prev);
  };

  const handleLogoutAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmUser === 'admin' && confirmPass === '1234') {
      onLogout();
    } else {
      setLogoutError('Credenciales incorrectas');
    }
  };

  return (
    <div className="sidebar">
      <button
        className={`sidebar-button ${activeSection === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelect('dashboard')}
      >
        <LayoutDashboard size={20} />
        Panel Principal
      </button>

      <button className="sidebar-button" onClick={handleRegistroClick}>
        <ClipboardList size={20} />
        Registro y Control
      </button>
      {showRegistroList && (
        <div style={{ marginLeft: '1rem', marginTop: '0.3rem' }}>
          <button
            className={`sidebar-button ${activeSection === 'agregarProducto' ? 'active' : ''}`}
            onClick={() => onSelect('agregarProducto')}
            style={{ display: isAdmin ? 'flex' : 'none' }}
          >
            <PlusCircle size={18} />
            Agregar Insumo
          </button>
          <button
            className={`sidebar-button ${activeSection === 'retirarProducto' ? 'active' : ''}`}
            onClick={() => onSelect('retirarProducto')}
          >
            <MinusCircle size={18} />
            Retirar Insumo
          </button>
          <button
            className={`sidebar-button ${activeSection === 'historial' ? 'active' : ''}`}
            onClick={() => onSelect('historial')}
          >
            <History size={18} />
            Historial de Retiros
          </button>
          <button
            className={`sidebar-button ${activeSection === 'estadisticas' ? 'active' : ''}`}
            onClick={() => onSelect('estadisticas')}
            style={{ display: isAdmin ? 'flex' : 'none' }}
          >
            <BarChart3 size={18} />
            Estadisticas
          </button>
        </div>
      )}

      <button className="sidebar-button" onClick={handleInventarioClick}>
        <Package size={20} />
        Inventario
      </button>
      {showInventarioList && (
        <div style={{ marginLeft: '1rem', marginTop: '0.3rem' }}>
          <button
            className={`sidebar-button ${activeSection === 'clinica' ? 'active' : ''}`}
            onClick={() => onSelect('clinica')}
          >
            <Stethoscope size={18} />
            Interno
          </button>

          <button
            className={`sidebar-button ${activeSection === 'gestionPacientes' ? 'active' : ''}`}
            onClick={() => onSelect('gestionPacientes')}
          >
            <ClipboardList size={18} />
            Gestión de Pacientes
          </button>
        </div>
      )}

      {/* Botón de Cerrar Sesión en la parte inferior */}
      {!isConfirmingLogout ? (
        <button className="sidebar-button logout-btn" style={{ marginTop: 'auto' }} onClick={() => setIsConfirmingLogout(true)}>
          <LogOut size={20} />
          Cerrar sesión
        </button>
      ) : (
        <div className="logout-confirm-box" style={{ marginTop: 'auto' }}>
          <p className="logout-confirm-title">Confirmar Salida</p>
          <form onSubmit={handleLogoutAttempt}>
            <input
              type="text"
              placeholder="Usuario"
              value={confirmUser}
              onChange={e => setConfirmUser(e.target.value)}
              className="confirm-input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              className="confirm-input"
            />
            {logoutError && <p className="confirm-error">{logoutError}</p>}
            <div className="confirm-buttons">
              <button type="submit" className="confirm-btn-ok">Salir</button>
              <button type="button" className="confirm-btn-cancel" onClick={() => setIsConfirmingLogout(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
