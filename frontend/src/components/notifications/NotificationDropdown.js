import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaCheckDouble, FaTimesCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';

const DropdownContainer = styled.div`
  position: absolute;
  top: 60px;
  right: 10px;
  width: 350px;
  max-height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const DropdownHeader = styled.div`
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #333;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #1a237e;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-right: 0.25rem;
  }
`;

const NotificationsList = styled.div`
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #bdbdbd;
    border-radius: 4px;
  }
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  background-color: ${props => (props.$unread ? '#f0f4ff' : 'white')};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => (props.$unread ? '#e3f2fd' : '#f5f5f5')};
  }
`;

const NotificationIcon = styled.div`
  margin-right: 1rem;
  color: ${props => {
    switch (props.$type) {
      case 'info': return '#2196f3';
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#757575';
    }
  }};
  font-size: 1.2rem;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #333;
`;

const NotificationMessage = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: #757575;
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: #9e9e9e;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 10px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #757575;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
  }
`;

const EmptyNotifications = styled.div`
  padding: 2rem;
  text-align: center;
  color: #757575;
  font-size: 0.9rem;
`;

const ViewAllLink = styled(Link)`
  display: block;
  padding: 0.75rem;
  text-align: center;
  background-color: #f5f5f5;
  color: #1a237e;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  
  &:hover {
    background-color: #e3f2fd;
  }
`;

// Función auxiliar para formatear fechas relativas
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  
  if (diffSec < 60) {
    return 'Ahora mismo';
  } else if (diffMin < 60) {
    return `hace ${diffMin} min`;
  } else if (diffHr < 24) {
    return `hace ${diffHr} h`;
  } else if (diffDays < 7) {
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
};

// Componente para seleccionar el icono según el tipo de notificación
const NotificationTypeIcon = ({ type }) => {
  switch (type) {
    case 'info':
      return <FaInfoCircle />;
    case 'success':
      return <FaCheckDouble />;
    case 'warning':
      return <FaExclamationCircle />;
    case 'error':
      return <FaTimesCircle />;
    default:
      return <FaInfoCircle />;
  }
};

const NotificationDropdown = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  console.log('Renderizando NotificationDropdown con notificaciones:', notifications);
  
  const handleMarkAsRead = (notificationId, e) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };
  
  const handleDeleteNotification = (notificationId, e) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };
  
  const handleNotificationClick = (notification) => {
    // Si no está leída, marcarla como leída
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navegar al objeto relacionado basado en el tipo de notificación
    const { type } = notification;
    let link = '';
    
    if (notification.actionLink) {
      // Si hay un actionLink definido en la notificación, usarlo
      link = notification.actionLink;
    } else {
      // Determinar el enlace basado en el tipo de notificación
      switch (type) {
        case 'task_assigned':
          link = `/tasks/${notification.task?._id || notification.taskId}`;
          break;
        case 'project_assignment':
          link = `/projects/${notification.project?._id || notification.projectId}`;
          break;
        case 'wiki_updated':
          link = `/projects/${notification.project?._id || notification.projectId}/wiki`;
          break;
        case 'comment_added':
        case 'comment_mention':
          link = `/projects/${notification.project?._id || notification.projectId}/tasks/${notification.task?._id || notification.taskId}`;
          break;
        case 'document_uploaded':
          link = `/projects/${notification.project?._id || notification.projectId}/documents`;
          break;
        default:
          // Por defecto, redirigir a la página de notificaciones
          link = '/notifications';
      }
    }
    
    // Cerrar el dropdown y redirigir
    window.location.href = link;
  };
  
  return (
    <DropdownContainer>
      <DropdownHeader>
        <HeaderTitle>Notificaciones</HeaderTitle>
        <HeaderActions>
          <ActionButton onClick={markAllAsRead}>
            <FaCheckDouble />
            Marcar todas como leídas
          </ActionButton>
        </HeaderActions>
      </DropdownHeader>
      
      <NotificationsList>
        {loading ? (
          <EmptyNotifications>Cargando notificaciones...</EmptyNotifications>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <NotificationItem 
              key={notification._id} 
              $unread={!notification.read}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationIcon $type={notification.type}>
                <NotificationTypeIcon type={notification.type} />
              </NotificationIcon>
              
              <NotificationContent>
                <NotificationTitle>{notification.title || 'Notificación'}</NotificationTitle>
                <NotificationMessage>
                  {(() => {
                    let mensaje = notification.message || notification.content;
                    
                    // Traducciones específicas de mensajes en inglés a español
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
                      
                      return mensaje;
                    }
                    
                    // Mensajes predeterminados según el tipo de notificación
                    switch (notification.type) {
                      case 'task_assigned':
                        return `Has sido asignado a la tarea "${notification.task?.title || 'Nueva tarea'}"`;
                      case 'task_status_changed':
                        return `El estado de la tarea "${notification.task?.title || 'una tarea'}" ha cambiado`;
                      case 'project_assignment':
                        return `Has sido añadido al proyecto "${notification.project?.name || 'Nuevo proyecto'}"`;
                      case 'comment_added':
                        return 'Se ha añadido un nuevo comentario';
                      case 'document_uploaded':
                        return 'Se ha subido un nuevo documento';
                      default:
                        return 'Sin detalles disponibles';
                    }
                  })()}
                </NotificationMessage>
                <NotificationTime>{formatTimeAgo(notification.createdAt)}</NotificationTime>
              </NotificationContent>
              
              <NotificationActions>
                {!notification.read && (
                  <IconButton 
                    title="Marcar como leída"
                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                  >
                    <FaCheckDouble />
                  </IconButton>
                )}
                <IconButton 
                  title="Eliminar"
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                >
                  <FaTimesCircle />
                </IconButton>
              </NotificationActions>
            </NotificationItem>
          ))
        ) : (
          <EmptyNotifications>No tienes notificaciones nuevas</EmptyNotifications>
        )}
      </NotificationsList>
      
      <ViewAllLink to="/notifications">Ver todas las notificaciones</ViewAllLink>
    </DropdownContainer>
  );
};

export default NotificationDropdown;