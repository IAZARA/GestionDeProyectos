import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Referencia para el tiempo de la última actualización
  const lastRefreshTimeRef = useRef(0);
  const isRefreshingRef = useRef(false);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    
    // Prevenir múltiples solicitudes simultáneas
    if (isRefreshingRef.current) {
      console.log('Ya hay una solicitud en curso, ignorando...');
      return;
    }
    
    // Limitar la frecuencia de solicitudes (mínimo 3 segundos entre solicitudes)
    const now = Date.now();
    const MIN_REFRESH_INTERVAL = 3000; // 3 segundos
    if (now - lastRefreshTimeRef.current < MIN_REFRESH_INTERVAL) {
      console.log('Solicitud demasiado frecuente, ignorando...');
      return;
    }
    
    try {
      isRefreshingRef.current = true;
      lastRefreshTimeRef.current = now;
      
      setLoading(true);
      const response = await API.get('/notifications');
      
      console.log('Respuesta de API de notificaciones:', response.data);
      
      // Manejar diferentes formatos de respuesta
      let notificationsArray = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        notificationsArray = response.data;
      } else if (response.data && Array.isArray(response.data.notifications)) {
        // Si la respuesta tiene una propiedad 'notifications' que es un array
        notificationsArray = response.data.notifications;
      } else {
        // Si no se encuentra un array válido, establecer un array vacío
        console.warn('La respuesta de la API no contiene un array de notificaciones válido:', response.data);
      }
      
      // Normalizar el formato de las notificaciones
      const normalizedNotifications = notificationsArray.map(notification => {
        // Traducir mensajes en inglés a español
        let mensaje = notification.message || notification.content || notification.description;
        
        // Traducir mensajes comunes en inglés a español
        if (mensaje) {
          const traducciones = {
            "You have been assigned to task": "Has sido asignado a la tarea",
            "Task status changed to": "Estado de la tarea cambiado a",
            "New comment added to task": "Nuevo comentario añadido a la tarea",
            "You have been mentioned in a comment": "Has sido mencionado en un comentario",
            "New document uploaded": "Nuevo documento subido",
            "Document has been uploaded to project": "Se ha subido un documento al proyecto",
            "You have been added to project": "Has sido añadido al proyecto",
            "Project status has been updated": "El estado del proyecto ha sido actualizado",
            "Task deadline approaching": "La fecha límite de la tarea se acerca",
            "Your task is overdue": "Tu tarea está atrasada",
            "Wiki page has been updated": "La página Wiki ha sido actualizada"
          };
          
          // Reemplazar todas las coincidencias
          Object.entries(traducciones).forEach(([ingles, espanol]) => {
            if (mensaje.includes(ingles)) {
              mensaje = mensaje.replace(ingles, espanol);
            }
          });
        }
        
        return {
          ...notification,
          // Asegurar que title y message estén presentes
          title: notification.title || notification.subject || 'Nueva notificación',
          message: mensaje || 
                  (notification.type === 'task_assigned' 
                    ? `Has sido asignado a la tarea "${notification.taskName || notification.task?.title || 'Nueva tarea'}"` 
                    : 'Sin detalles disponibles'),
          // Asegurar que read sea booleano
          read: Boolean(notification.read)
        };
      });
      
      setNotifications(normalizedNotifications);
      
      // Actualizar contador de no leídas
      try {
        const countResponse = await API.get('/notifications/count');
        if (typeof countResponse.data.count === 'number') {
          setUnreadCount(countResponse.data.count);
        } else if (typeof countResponse.data.unreadCount === 'number') {
          setUnreadCount(countResponse.data.unreadCount);
        } else {
          // Contar manualmente las no leídas
          // Usamos el valor de respuesta.data, no el estado notifications
          const notificationsArray = 
            (Array.isArray(response.data) ? response.data : 
             (Array.isArray(response.data?.notifications) ? response.data.notifications : []));
          
          setUnreadCount(notificationsArray.filter(n => !n.read).length);
        }
      } catch (countError) {
        console.error('Error al obtener contador de notificaciones no leídas:', countError);
        // Establecer contador a 0 en caso de error
        setUnreadCount(0);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar notificaciones', error);
      // Asegurar que notifications sea un array vacío en caso de error
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    } finally {
      // Siempre marcar como no refrescando al finalizar
      isRefreshingRef.current = false;
    }
  }, [currentUser]);

  // Cargar notificaciones cuando cambia el usuario
  useEffect(() => {
    loadNotifications();
  }, [currentUser, loadNotifications]);

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      
      // Asegurar que estamos trabajando con un array
      const notificationsArray = Array.isArray(notifications) ? notifications : [];
      
      // Actualizar estado local solo si hay notificaciones
      if (notificationsArray.length > 0) {
        setNotifications(
          notificationsArray.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Verificar si realmente se cambió una notificación no leída a leída
        const notification = notificationsArray.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      
      // Asegurar que estamos trabajando con un array
      const notificationsArray = Array.isArray(notifications) ? notifications : [];
      
      // Actualizar estado local solo si hay notificaciones
      if (notificationsArray.length > 0) {
        setNotifications(notificationsArray.map(notification => ({ ...notification, read: true })));
      }
      
      // Resetear contador
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas', error);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      
      // Asegurar que estamos trabajando con un array
      const notificationsArray = Array.isArray(notifications) ? notifications : [];
      
      // Actualizar estado local
      const updatedNotifications = notificationsArray.filter(
        notification => notification._id !== notificationId
      );
      setNotifications(updatedNotifications);
      
      // Actualizar contador si la notificación no leída fue eliminada
      const deletedNotification = notificationsArray.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (error) {
      console.error('Error al eliminar notificación', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;