import API from './api';

// Función para iniciar sesión de usuario
export const login = async (email, password, rememberMe = false) => {
  try {
    console.log(`AuthService: Iniciando sesión para ${email}, rememberMe: ${rememberMe}`);
    const response = await API.post('/auth/login', { email, password });
    
    const { token, user } = response.data;
    console.log('AuthService: Token recibido:', token ? 'Sí' : 'No');
    
    if (!token) {
      throw new Error('No se recibió un token de autenticación');
    }
    
    // Limpiar tokens existentes antes de guardar uno nuevo
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Guardar token en localStorage o sessionStorage según la opción "Recordarme"
    if (rememberMe) {
      localStorage.setItem('token', token);
      console.log('AuthService: Token guardado en localStorage');
    } else {
      sessionStorage.setItem('token', token);
      console.log('AuthService: Token guardado en sessionStorage');
    }
    
    // Verificar que se haya guardado correctamente
    const storedToken = rememberMe ? localStorage.getItem('token') : sessionStorage.getItem('token');
    if (!storedToken) {
      console.error('AuthService: Error al guardar el token');
      throw new Error('Error al guardar el token de autenticación');
    }
    
    // Guardar información de último usuario para recuperación
    localStorage.setItem('lastUser', JSON.stringify({
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    }));
    
    return response.data;
  } catch (error) {
    console.error('AuthService: Error durante login:', error);
    throw error;
  }
};

// Función para registrar un nuevo usuario
export const register = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('AuthService: Error durante registro:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    // Llamar al endpoint de logout si existe
    await API.post('/auth/logout');
  } catch (error) {
    console.error('AuthService: Error al cerrar sesión en servidor:', error);
  } finally {
    // Siempre eliminar tokens locales
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return { success: true };
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

// Función para obtener el perfil del usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await API.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('AuthService: Error al obtener perfil:', error);
    throw error;
  }
}; 