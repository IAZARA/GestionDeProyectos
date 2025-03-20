import API from './api';

// Función auxiliar para esperar un tiempo determinado
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para obtener usuarios con reintentos y retraso exponencial
export const getUsers = async (filters = {}, maxRetries = 3) => {
  let lastError;
  
  // Intentar la solicitud con reintentos
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Añadir un parámetro de consulta con marca de tiempo para evitar la caché
      const timestamp = new Date().getTime();
      const config = {
        params: { ...filters, t: timestamp },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      // Usar la ruta de usuario en lugar de admin
      const response = await API.get('/users', config);
      
      // Verificar formato de respuesta
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        return response.data.users;
      } else {
        console.warn('Formato de respuesta inesperado en getUsers:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error en getUsers:', error.response || error.message || error);
      lastError = error;
      
      // Si es un error 429 (Too Many Requests), esperar antes de reintentar
      if (error.response && error.response.status === 429) {
        // Retraso exponencial: 1s, 2s, 4s, etc.
        const delayMs = 1000 * Math.pow(2, attempt);
        console.log(`Demasiadas solicitudes. Reintentando en ${delayMs/1000} segundos...`);
        await wait(delayMs);
      } else if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        console.warn('No autorizado para obtener usuarios. Devolviendo lista vacía.');
        return [];
      } else {
        // Para otros errores, si es el último intento, devolver array vacío
        if (attempt === maxRetries - 1) {
          console.warn('Se agotaron los reintentos. Devolviendo lista vacía.');
          return [];
        }
      }
    }
  }
  
  // Si llegamos aquí, se agotaron los reintentos
  console.error('No se pudieron obtener usuarios después de varios intentos');
  return [];
};

export const getUserById = async (userId) => {
  const response = await API.get(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await API.post('/users', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await API.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/users/${userId}`);
  return response.data;
};

export const getUserProjects = async (userId) => {
  const response = await API.get(`/users/${userId}/projects`);
  return response.data;
};

export const getUserTasks = async (userId) => {
  const response = await API.get(`/users/${userId}/tasks`);
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await API.patch(`/users/${userId}/status`, { status });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await API.patch(`/users/${userId}/role`, { role });
  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await API.get(`/users/${userId}/stats`);
  return response.data;
};
