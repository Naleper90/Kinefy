import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // En producción, Nginx actúa como proxy hacia el backend

    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para añadir el token JWT a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta para gestionar errores de red y de sesión de forma global (DWEC - Robustez)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Error de red (servidor caído o sin internet)
            console.error('Error de conexión con la API de Kinefy.');
        } else if (error.response.status === 401) {
            // Token inválido o expirado -> Limpiar localStorage y redirigir
            console.warn('Sesión no autorizada o expirada. Redirigiendo a Login...');
            localStorage.removeItem('token');
            localStorage.removeItem('kinefy_user');
            // Redirección forzada para forzar re-login
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
