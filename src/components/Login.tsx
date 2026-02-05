import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import logo from '../imagens/login_logo_premium.png';
import '../styles/login.css';
import { login } from '../services/authService';

interface LoginProps {
  onLogin: (user: { id: number; nombre: string; usuario: string; rol: 'supervisor'; createdAt?: string }) => void;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: {
    id: number;
    nombre: string;
    usuario: string;
    rol: 'supervisor';
    createdAt?: string;
  };
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response: LoginResponse = await login(usuario, password);
      
      // Store tokens
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      
      showNotification(`¡Bienvenido de nuevo, ${response.usuario.nombre}!`, 'success');
      setIsExiting(true);
      setTimeout(() => {
        onLogin({
          id: response.usuario.id,
          nombre: response.usuario.nombre,
          usuario: response.usuario.usuario,
          rol: response.usuario.rol as 'supervisor',
          createdAt: response.usuario.createdAt
        });
      }, 500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión';
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setIsLoading(false);
    }
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