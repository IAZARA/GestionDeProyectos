import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir el token de autenticación
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
API.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('[API Response Error]', error.response?.data || error.message);
    
    if (error.response) {
      if (error.response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login?expired=true';
      } else if (error.response.status === 403) {
        // Acceso denegado
        throw new Error('No tienes permisos para realizar esta acción');
      } else if (error.response.status === 500) {
        throw new Error('Error del servidor. Por favor, inténtelo más tarde.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
