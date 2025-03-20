import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAuthenticated } from '../../services/authService';

const ProtectedRoute = ({ children, adminOnly, managerOnly, projectManagerOnly }) => {
  const { currentUser, isLoading, refreshToken } = useAuth();
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);
  
  // Intentar refrescar la sesión si no hay usuario actual pero hay token
  useEffect(() => {
    const tryRestoreSession = async () => {
      if (!currentUser && !isLoading && !checkedSession) {
        setIsCheckingToken(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token) {
          console.log('Hay token pero no hay usuario, intentando restaurar sesión...');
          try {
            await refreshToken();
          } catch (err) {
            console.error('Error al restaurar sesión:', err);
          }
        }
        
        setIsCheckingToken(false);
        setCheckedSession(true);
      }
    };
    
    tryRestoreSession();
  }, [currentUser, isLoading, checkedSession, refreshToken]);
  
  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!currentUser) {
      console.log('No hay usuario actual para verificar rol');
      return false;
    }
    
    console.log('Verificando rol:', currentUser.role, 'Rol requerido:', role);
    console.log('Datos completos del usuario:', JSON.stringify(currentUser));
    
    // Comprobar si el rol es 'manager' tanto si viene como 'manager' o 'gestor'
    if (role === 'manager' && (currentUser.role === 'manager' || currentUser.role === 'gestor')) {
      console.log('Usuario tiene rol de manager/gestor');
      return true;
    }
    
    return currentUser.role === role;
  };
  
  // Verificar si el usuario tiene área de expertise administrativa
  const hasAdministrativeExpertise = () => {
    if (!currentUser) return false;
    console.log('Verificando área de expertise:', currentUser.expertiseArea);
    return currentUser.expertiseArea === 'administrative';
  };
  
  // Verificar si el usuario puede gestionar proyectos (crear/editar/eliminar)
  const canManageProjects = () => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'gestor';
  };
  
  // Mostrar pantalla de carga mientras verifica el estado de autenticación
  if (isLoading || isCheckingToken) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #1a237e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div>Cargando...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // Verificar si hay token aunque no haya usuario
  const authenticated = isAuthenticated();
  
  // Verificar si el usuario está autenticado
  if (!currentUser) {
    if (authenticated) {
      console.log('Hay token pero no se pudo cargar usuario, redirigiendo a dashboard y forzando recarga');
      // Si hay token pero no se pudo cargar el usuario, forzar recarga
      window.location.href = '/dashboard';
      return null;
    }
    console.log('Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" />;
  }
  
  // Verificar permisos de administrador si es requerido
  if (adminOnly) {
    console.log('Ruta requiere admin, rol del usuario:', currentUser.role);
    if (!hasRole('admin')) {
      console.log('Usuario no es admin, redirigiendo a dashboard');
      return <Navigate to="/dashboard" />;
    }
  }
  
  // Verificar permisos de gestor si es requerido
  if (managerOnly) {
    console.log('Ruta requiere manager, rol del usuario:', currentUser.role, 'expertise:', currentUser.expertiseArea);
    if (!hasRole('admin') && !hasRole('manager') && !hasAdministrativeExpertise()) {
      console.log('Usuario no es admin, ni manager, ni tiene expertise administrativa, redirigiendo a dashboard');
      return <Navigate to="/dashboard" />;
    }
  }
  
  // Verificar permisos para gestionar proyectos si es requerido
  if (projectManagerOnly) {
    console.log('Ruta requiere permisos de gestión de proyectos, rol del usuario:', currentUser.role);
    if (!hasRole('admin') && !hasRole('manager')) {
      console.log('Usuario no tiene permisos para gestionar proyectos, redirigiendo a /projects');
      return <Navigate to="/projects" />;
    }
  }
  
  // Si pasa todas las verificaciones, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;