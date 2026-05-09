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

export default api;
