import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (usuario: string, password_hash: string) => {
        const response = await api.post('/auth/login', { usuario, password: password_hash });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.usuario));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const productoService = {
    getAll: async () => {
        const response = await api.get('/productos');
        return response.data;
    },
    create: async (producto: any) => {
        const response = await api.post('/productos', producto);
        return response.data;
    },
    updateStock: async (id: number, cantidad: number) => {
        const response = await api.put(`/productos/stock/${id}`, { cantidad });
        return response.data;
    }
};

export const retiroService = {
    registrar: async (retiro: any) => {
        const response = await api.post('/retiros', retiro);
        return response.data;
    }
};

export const historialService = {
    getMercancias: async () => {
        const response = await api.get('/historial/mercancias');
        return response.data;
    },
    getPacienteHistorial: async (id: number) => {
        const response = await api.get(`/historial/paciente/${id}`);
        return response.data;
    }
};

export default api;
