import React, { useState } from 'react';
import '../../styles/sidebar.css';

interface SidebarProps {
  onSelect: (
    section:
      | 'clinica'
      | 'comercial'
      | 'agregarProducto'
      | 'registro'
      | 'dashboard'
      | 'historial'
      | 'pacientes' // Cambiado de 'paciente' a 'pacientes' para consistencia
      | 'inventario'
      | 'retirarProducto'
  ) => void;
  onLogout: () => void;
  activeSection: string;
}

/**
 * Sidebar: Menú lateral de navegación.
 * Permite seleccionar entre registro/control, inventario, historial, agregar y retirar insumos.
 * Llama a la función onSelect con la sección elegida.
 */

const SidebarUsuario: React.FC<SidebarProps> = ({ onSelect, onLogout, activeSection }) => {
  const [showInventarioList, setShowInventarioList] = useState(false);
  const [showRegistroList, setShowRegistroList] = useState(false);

  // Muestra/oculta el submenú de registro
  const handleRegistroClick = () => {
    setShowRegistroList((prev) => !prev);
  };

  // Muestra/oculta el submenú de inventario
  const handleInventarioClick = () => {
    setShowInventarioList((prev) => !prev);
  };

  return (
    <div className="sidebar">
      {/* Botón de Dashboard */}
      <button
        className={`sidebar-button ${activeSection === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelect('dashboard')}
      >
        🏠 Panel Principal
      </button>

      {/* Botón para mostrar el submenú de registro y control */}
      <button className="sidebar-button" onClick={handleRegistroClick}>
        Registro y Control
      </button>
      {showRegistroList && (
        <div style={{ marginLeft: '1rem', marginTop: '0.3rem' }}>
          {/* Botón para retirar insumo (muestra el formulario de retiro) */}
          <button
            className={`sidebar-button ${activeSection === 'retirarProducto' ? 'active' : ''}`}
            onClick={() => onSelect('retirarProducto')}
          >
            Retirar Insumo
          </button>
          {/* Botón para ver el historial de mercancía */}
          <button
            className={`sidebar-button ${activeSection === 'historial' ? 'active' : ''}`}
            onClick={() => onSelect('historial')}
          >
            Historial de Mercancía
          </button>
          {/* Botón para ver el historial de pacientes */}
          <button
            className={`sidebar-button ${activeSection === 'pacientes' ? 'active' : ''}`}
            onClick={() => onSelect('pacientes')}
          >
            Historial de Pacientes
          </button>
        </div>
      )}

      {/* Botón para mostrar el submenú de inventario */}
      <button className="sidebar-button" onClick={handleInventarioClick}>
        Inventario
      </button>
      {showInventarioList && (
        <div style={{ marginLeft: '1rem', marginTop: '0.3rem' }}>
          {/* Botón para ver la lista clínica */}
          <button
            className={`sidebar-button ${activeSection === 'clinica' ? 'active' : ''}`}
            onClick={() => onSelect('clinica')}
          >
            Interno
          </button>
          {/* Botón para ver la lista comercial */}
          <button
            className={`sidebar-button ${activeSection === 'comercial' ? 'active' : ''}`}
            onClick={() => onSelect('comercial')}
          >
            Paciente
          </button>
        </div>
      )}

      {/* Botón para cerrar sesión */}
      <button className="sidebar-button" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default SidebarUsuario;
