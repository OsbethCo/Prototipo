import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import logo from '../imagens/login_logo_premium.png';
import '../styles/login.css';

interface LoginProps {
  onLogin: (usuario: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Vovemos a la validación local solicitada
    setTimeout(() => {
      if (usuario === 'admin' && password === '1234') {
        showNotification(`¡Bienvenido de nuevo, ${usuario}!`, 'success');
        setIsExiting(true);
        setTimeout(() => {
          onLogin(usuario);
        }, 500); // Duración de la animación de salida
      } else {
        const msg = 'Usuario o contraseña incorrectos (Modo Prototipo)';
        setError(msg);
        showNotification(msg, 'error');
        setIsLoading(false);
      }
    }, 600); // Simulamos una pequeña carga para mantener la sensación de fluidez
  };

  return (
    <div className={`login-container ${isExiting ? 'fade-out' : ''}`}>
      <form onSubmit={handleSubmit} className={`login-form ${isExiting ? 'scale-down' : ''}`}>
        <div className="login-header">
          <img src={logo} alt="Farmacia Gest Logo" className="login-logo-img" />
          <h2 className="login-title">Farmacia Gest</h2>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="input-group">
          <label>Usuario</label>
          <input
            type="text"
            placeholder="Introduce tu usuario"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            required
            className="login-input"
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <button type="submit" className="login-button">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;