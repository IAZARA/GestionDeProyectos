import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para configurar el token en los headers de API
  const setAuthToken = (token) => {
    if (token) {
      console.log('Configurando token en los headers de API');
      // Configurar para todas las peticiones futuras
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // También configurar x-auth-token para compatibilidad con el backend
      API.defaults.headers.common['x-auth-token'] = token;
      
      // Verificar que se hayan configurado correctamente
      console.log('Headers configurados:', 
        'Authorization' in API.defaults.headers.common, 
        'x-auth-token' in API.defaults.headers.common);
    } else {
      console.log('Eliminando token de los headers de API');
      // Eliminar headers si no hay token
      delete API.defaults.headers.common['Authorization'];
      delete API.defaults.headers.common['x-auth-token'];
    }
  };

  // Configurar interceptor para manejar errores de autenticación
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Solo cerrar sesión si no es una petición de login
          if (!error.config.url.includes('/auth/login')) {
            console.log('Token expirado o inválido. Cerrando sesión...');
            // Token expirado o inválido
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setAuthToken(null);
            setCurrentUser(null);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Limpiar interceptor cuando el componente se desmonte
      API.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    // Verificar si hay un token almacenado
    const checkAuthStatus = async () => {
      try {
        // Intentar obtener token del localStorage (recordarme) o sessionStorage (sesión normal)
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');
        const token = localToken || sessionToken;
        
        console.log('Verificando token en localStorage:', localToken ? 'Encontrado' : 'No encontrado');
        console.log('Verificando token en sessionStorage:', sessionToken ? 'Encontrado' : 'No encontrado');
        
        // Verificar información de depuración
        const lastLoginAttempt = localStorage.getItem('lastLoginAttempt');
        const lastUser = localStorage.getItem('lastUser');
        if (lastLoginAttempt) {
          console.log('Último intento de login:', lastLoginAttempt);
        }
        if (lastUser) {
          console.log('Último usuario:', lastUser);
        }
        
        if (token) {
          try {
            console.log('Token encontrado, verificando validez...');
            
            // Configurar token en headers
            setAuthToken(token);
            
            // Verificar si el token es válido
            console.log('Haciendo llamada a /auth/profile para verificar token...');
            const response = await API.get('/auth/profile');
            console.log('Respuesta completa de profile:', response);
            
            if (response.data && response.data.user) {
              console.log('Datos de usuario recibidos:', response.data.user);
              // Asegurar que profilePicture se mapee a profileImage
              const userData = {
                ...response.data.user,
                profileImage: response.data.user.profilePicture
              };
              setCurrentUser(userData);
              console.log('Sesión restaurada correctamente. Rol:', response.data.user.role);
              
              // Asegurar que el token siga guardado
              if (localToken) {
                localStorage.setItem('token', token);
              } else if (sessionToken) {
                sessionStorage.setItem('token', token);
              }
            } else {
              console.error('Respuesta del servidor inválida:', response.data);
              throw new Error('Respuesta del servidor inválida');
            }
          } catch (err) {
            console.error('Error al verificar token:', err);
            console.error('Detalle del error:', err.response?.data);
            
            // Si es un error 401 o 403, eliminar el token
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              console.log('Error de autenticación, eliminando token');
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              setAuthToken(null);
            } else {
              console.log('Error de red o servidor, intentando mantener token');
              // Para otros errores (como de red), mantener el token para intentar más tarde
            }
            
            setError(err.response?.data?.message || 'Error al autenticar');
          }
        } else {
          console.log('No se encontró token de autenticación');
        }
      } catch (generalError) {
        console.error('Error general en checkAuthStatus:', generalError);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password, rememberMe = false) => {
    try {
      setError(null);
      console.log(`Intentando login para: ${email}, rememberMe: ${rememberMe}`);
      
      const response = await API.post('/auth/login', { email, password });
      console.log('Respuesta de login completa:', response);
      
      const { token, user } = response.data;
      console.log('Token recibido:', token ? token.substring(0, 10) + '...' : 'No');
      console.log('Datos de usuario recibidos:', user);
      
      if (!token) {
        console.error('No se recibió token del servidor');
        throw new Error('No se recibió token del servidor');
      }
      
      // Limpiar tokens existentes antes de guardar uno nuevo
      console.log('Limpiando tokens existentes');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Guardar token en localStorage o sessionStorage según la opción "Recordarme"
      try {
        if (rememberMe) {
          console.log('Guardando token en localStorage (recordarme activado)');
          localStorage.setItem('token', token);
          // Verificar si se guardó correctamente
          const storedToken = localStorage.getItem('token');
          console.log('Token guardado en localStorage:', storedToken ? 'Sí' : 'No');
        } else {
          console.log('Guardando token en sessionStorage (sesión normal)');
          sessionStorage.setItem('token', token);
          // Verificar si se guardó correctamente
          const storedToken = sessionStorage.getItem('token');
          console.log('Token guardado en sessionStorage:', storedToken ? 'Sí' : 'No');
        }
        
        // Guardar información adicional para depuración
        localStorage.setItem('lastLoginAttempt', new Date().toISOString());
        localStorage.setItem('lastUser', JSON.stringify({
          email: user.email,
          role: user.role,
          loginTime: new Date().toISOString()
        }));
      } catch (storageError) {
        console.error('Error al guardar token en storage:', storageError);
      }
      
      // Configurar API para incluir el token en todas las solicitudes
      setAuthToken(token);
      
      // Asegurar que profilePicture se mapee a profileImage
      const userData = {
        ...user,
        profileImage: user.profilePicture
      };
      
      console.log('Login exitoso. Usuario:', userData.firstName, userData.lastName, 'Rol:', userData.role);
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      console.error('Error en login:', err);
      console.error('Detalles del error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    }
  };

  // Función para registrarse
  const register = async (userData) => {
    try {
      setError(null);
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
      throw err;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor', err);
    } finally {
      // Siempre eliminar el token local
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setAuthToken(null);
      setCurrentUser(null);
    }
  };

  // Función para actualizar perfil de usuario
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await API.put('/auth/profile', userData);
      setCurrentUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
      throw err;
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await API.put('/auth/change-password', passwordData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
      throw err;
    }
  };

  // Función para actualizar la imagen de perfil del usuario
  const updateProfileImage = async (imageUrl) => {
    try {
      setError(null);
      
      // Actualizar en el backend usando el nombre del campo correcto
      const response = await API.put('/auth/profile', { profilePicture: imageUrl });
      
      if (response.data && response.data.user) {
        // Actualizar el estado manteniendo consistencia con los nombres de campos
        setCurrentUser({ 
          ...currentUser, 
          profilePicture: imageUrl,
          profileImage: imageUrl  // Mantener ambos para compatibilidad
        });
        
        // Guardar en localStorage como respaldo
        localStorage.setItem('userProfileImage', imageUrl);
        
        return { success: true };
      } else {
        throw new Error('No se pudo actualizar la imagen de perfil');
      }
    } catch (err) {
      setError('Error al actualizar imagen de perfil');
      console.error(err);
      return { success: false };
    }
  };

  // Verificar si el usuario tiene cierto rol
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  // Verificar si el usuario tiene cierta área de expertise
  const hasExpertise = (expertise) => {
    return currentUser?.expertiseArea === expertise;
  };
  
  // Verificar si el usuario puede administrar proyectos (crear/editar/eliminar)
  const canManageProjects = () => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'gestor';
  };

  // Función para forzar la verificación/renovación del token
  const refreshToken = async () => {
    try {
      console.log('Intentando refrescar token...');
      
      // Obtener el token actual
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.log('No hay token para refrescar');
        return false;
      }
      
      // Configurar token en headers
      setAuthToken(token);
      
      // Verificar si el token es válido
      const response = await API.get('/auth/profile');
      
      if (response.data && response.data.user) {
        console.log('Token válido, actualizando datos de usuario');
        const userData = {
          ...response.data.user,
          profileImage: response.data.user.profilePicture
        };
        setCurrentUser(userData);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error al refrescar token:', err);
      return false;
    }
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    updateProfileImage,
    hasRole,
    hasExpertise,
    canManageProjects,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;