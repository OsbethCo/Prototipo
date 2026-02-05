/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { createRoot } from 'react-dom/client';
import Appi from './Apps';
import App from './App';
import './styles/index.css';

import { NotificationProvider } from './context/NotificationContext';

const container = document.getElementById('root');
const root = createRoot(container!);

// Helper to get stored user data
const getStoredUser = () => {
  const storedUser = localStorage.getItem('usuario');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
};

// Determine which app to render based on user role
const storedUser = getStoredUser();
const userRole = storedUser?.rol || '';
const isSupervisor = userRole === 'supervisor' || userRole === 'admin';
const isTrabajador = userRole === 'trabajador';

let AppComponent: React.FC;

if (isSupervisor) {
  AppComponent = App;
} else if (isTrabajador) {
  AppComponent = Appi;
} else {
  // Default to App for unknown roles or no user (will show login)
  AppComponent = App;
}

root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AppComponent />
    </NotificationProvider>
  </React.StrictMode>
);
