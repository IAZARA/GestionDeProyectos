import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  FaCheckDouble, 
  FaTimesCircle, 
  FaExclamationCircle, 
  FaBell, 
  FaFilter, 
  FaTrash,
  FaUserPlus,
  FaClipboardCheck,
  FaComment,
  FaFileUpload,
  FaBook,
  FaBullhorn,
  FaCalendarAlt,
  FaProjectDiagram
} from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #1a237e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #1a237e;
  color: white;
`;

const DangerButton = styled(Button)`
  background-color: #f44336;
  color: white;
`;

const SecondaryButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)`
  background-color: ${props => props.active ? '#e3f2fd' : '#f5f5f5'};
  color: ${props => props.active ? '#1a237e' : '#333'};
  border: 1px solid ${props => props.active ? '#bbdefb' : '#ddd'};
  
  &:hover {
    background-color: ${props => props.active ? '#bbdefb' : '#e0e0e0'};
  }
`;

const NotificationCard = styled.div`
  background-color: ${props => props.unread ? '#f0f7ff' : 'white'};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const NotificationIcon = styled.div`
  margin-right: 1.5rem;
  color: ${props => {
    switch (props.type) {
      case 'project_assignment':
      case 'member_added': 
        return '#4caf50'; // Verde
      case 'task_assigned':
      case 'task_status_changed':
        return '#2196f3'; // Azul
      case 'comment_added':
      case 'comment_mention':
        return '#ff9800'; // Naranja
      case 'deadline_approaching':
        return '#f44336'; // Rojo
      case 'file_uploaded':
      case 'document_uploaded':
        return '#9c27b0'; // Púrpura
      case 'wiki_updated':
        return '#00bcd4'; // Cian
      case 'admin_announcement':
        return '#e91e63'; // Rosa
      default:
        return '#757575'; // Gris
    }
  }};
  font-size: 1.5rem;
  margin-top: 0.25rem;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
`;

const NotificationDate = styled.span`
  color: #757575;
  font-size: 0.9rem;
`;

const NotificationMessage = styled.p`
  margin: 0 0 1rem 0;
  color: #555;
  font-size: 1rem;
`;

const NotificationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #757575;
  font-size: 0.9rem;
`;

const ProjectInfo = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionArea = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #757575;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
    color: ${props => props.danger ? '#f44336' : '#1a237e'};
  }
`;

const ViewButton = styled(Button)`
  background-color: #1a237e;
  color: white;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  color: #e0e0e0;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  color: #757575;
  margin-bottom: 0;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: ${props => props.active ? '#1a237e' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? '#1a237e' : '#f5f5f5'};
  }
`;

// Función para formatear fecha a formato legible
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para calcular hace cuánto tiempo ocurrió algo
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Hace unos segundos';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  }
  
  return `Hace ${Math.floor(diffInMonths / 12)} año${Math.floor(diffInMonths / 12) > 1 ? 's' : ''}`;
};

// Componente para seleccionar el icono según el tipo de notificación
const NotificationTypeIcon = ({ type }) => {
  switch (type) {
    case 'project_assignment':
      return <FaProjectDiagram />;
    case 'member_added':
      return <FaUserPlus />;
    case 'task_assigned':
    case 'task_status_changed':
      return <FaClipboardCheck />;
    case 'comment_added':
    case 'comment_mention':
      return <FaComment />;
    case 'deadline_approaching':
      return <FaCalendarAlt />;
    case 'file_uploaded':
    case 'document_uploaded':
      return <FaFileUpload />;
    case 'wiki_updated':
      return <FaBook />;
    case 'admin_announcement':
      return <FaBullhorn />;
    default:
      return <FaBell />;
  }
};

// Obtener título significativo por tipo de notificación
const getNotificationTitle = (notification) => {
  switch (notification.type) {
    case 'project_assignment':
      return 'Asignación de proyecto';
    case 'member_added':
      return 'Nuevo miembro en el equipo';
    case 'task_assigned':
      return 'Nueva tarea asignada';
    case 'task_status_changed':
      return 'Cambio de estado en tarea';
    case 'comment_added':
      return 'Nuevo comentario';
    case 'comment_mention':
      return 'Te han mencionado en un comentario';
    case 'deadline_approaching':
      return 'Fecha límite próxima';
    case 'file_uploaded':
    case 'document_uploaded':
      return 'Documento subido';
    case 'wiki_updated':
      return 'Actualización en la wiki';
    case 'admin_announcement':
      return 'Anuncio administrativo';
    default:
      return 'Notificación';
  }
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    refreshNotifications 
  } = useNotifications();
  
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  
  // Filtrar notificaciones según el filtro seleccionado
  useEffect(() => {
    // Asegurarse de que notifications sea un array
    const notificationsArray = Array.isArray(notifications) ? notifications : [];
    
    let filtered = [...notificationsArray];
    
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(notification => !notification.read);
        break;
      case 'projects':
        filtered = filtered.filter(notification => 
          notification.type === 'project_assignment' || notification.type === 'member_added');
        break;
      case 'tasks':
        filtered = filtered.filter(notification => 
          notification.type === 'task_assigned' || notification.type === 'task_status_changed');
        break;
      case 'comments':
        filtered = filtered.filter(notification => 
          notification.type === 'comment_added' || notification.type === 'comment_mention');
        break;
      case 'documents':
        filtered = filtered.filter(notification => 
          notification.type === 'file_uploaded' || notification.type === 'document_uploaded');
        break;
      case 'announcements':
        filtered = filtered.filter(notification => notification.type === 'admin_announcement');
        break;
      default:
        // all, no hay filtro adicional
        break;
    }
    
    setFilteredNotifications(filtered);
    setCurrentPage(1); // Resetear a primera página cuando cambia el filtro
  }, [notifications, filter]);
  
  // Calcular paginación
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);
  
  // Manejar cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Verificar si todos los elementos de la página actual están seleccionados
  const allCurrentSelected = currentItems.length > 0 && 
    currentItems.every(notification => 
      selectedNotifications.includes(notification._id)
    );
  
  // Manejar selección de todos los elementos en la página actual
  const handleSelectAllCurrent = () => {
    if (allCurrentSelected) {
      // Deseleccionar todos de la página actual
      setSelectedNotifications(prev => 
        prev.filter(id => !currentItems.some(item => item._id === id))
      );
    } else {
      // Seleccionar todos de la página actual
      const currentIds = currentItems.map(item => item._id);
      setSelectedNotifications(prev => [...new Set([...prev, ...currentIds])]);
    }
  };
  
  // Manejar selección de notificación individual
  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };
  
  // Marcar como leídas las seleccionadas
  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };
  
  // Eliminar las seleccionadas
  const handleDeleteSelected = async () => {
    if (window.confirm(`¿Estás seguro de eliminar ${selectedNotifications.length} notificación(es)?`)) {
      for (const id of selectedNotifications) {
        await deleteNotification(id);
      }
      setSelectedNotifications([]);
    }
  };
  
  // Manejar clic en notificación
  const handleNotificationClick = (notification) => {
    // Marcar como leída
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navegar si hay un enlace de acción
    if (notification.actionLink) {
      navigate(notification.actionLink);
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>
          <FaBell />
          Notificaciones
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              padding: '0.25rem 0.5rem',
              fontSize: '0.9rem',
              marginLeft: '0.5rem'
            }}>
              {unreadCount}
            </span>
          )}
        </Title>
        
        <ActionButtons>
          {selectedNotifications.length > 0 ? (
            <>
              <PrimaryButton 
                onClick={handleMarkSelectedAsRead}
                disabled={selectedNotifications.every(id => {
                  const notificationsArray = Array.isArray(notifications) ? notifications : [];
                  const notification = notificationsArray.find(n => n._id === id);
                  return notification?.read;
                })}
              >
                <FaCheckDouble /> Marcar seleccionadas como leídas
              </PrimaryButton>
              
              <DangerButton onClick={handleDeleteSelected}>
                <FaTrash /> Eliminar seleccionadas
              </DangerButton>
            </>
          ) : (
            <>
              <PrimaryButton 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <FaCheckDouble /> Marcar todas como leídas
              </PrimaryButton>
              
              <SecondaryButton onClick={refreshNotifications}>
                <FaFilter /> Actualizar
              </SecondaryButton>
            </>
          )}
        </ActionButtons>
      </Header>
      
      <FiltersContainer>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          <FaBell /> Todas
        </FilterButton>
        
        <FilterButton 
          active={filter === 'unread'} 
          onClick={() => setFilter('unread')}
        >
          <FaExclamationCircle /> No leídas
        </FilterButton>
        
        <FilterButton 
          active={filter === 'projects'} 
          onClick={() => setFilter('projects')}
        >
          <FaProjectDiagram /> Proyectos
        </FilterButton>
        
        <FilterButton 
          active={filter === 'tasks'} 
          onClick={() => setFilter('tasks')}
        >
          <FaClipboardCheck /> Tareas
        </FilterButton>
        
        <FilterButton 
          active={filter === 'comments'} 
          onClick={() => setFilter('comments')}
        >
          <FaComment /> Comentarios
        </FilterButton>
        
        <FilterButton 
          active={filter === 'documents'} 
          onClick={() => setFilter('documents')}
        >
          <FaFileUpload /> Documentos
        </FilterButton>
        
        <FilterButton 
          active={filter === 'announcements'} 
          onClick={() => setFilter('announcements')}
        >
          <FaBullhorn /> Anuncios
        </FilterButton>
      </FiltersContainer>
      
      {loading ? (
        <EmptyState>
          <EmptyStateIcon>
            <span className="spinner-border" role="status"></span>
          </EmptyStateIcon>
          <EmptyStateTitle>Cargando notificaciones...</EmptyStateTitle>
        </EmptyState>
      ) : currentItems.length > 0 ? (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <SecondaryButton onClick={handleSelectAllCurrent}>
              {allCurrentSelected ? 'Deseleccionar todos' : 'Seleccionar página'}
            </SecondaryButton>
          </div>
          
          {currentItems.map(notification => (
            <NotificationCard 
              key={notification._id} 
              unread={!notification.read}
              onClick={() => handleNotificationClick(notification)}
            >
              <input 
                type="checkbox"
                style={{ marginRight: '1rem' }}
                checked={selectedNotifications.includes(notification._id)}
                onChange={() => handleSelectNotification(notification._id)}
                onClick={e => e.stopPropagation()}
              />
              
              <NotificationIcon type={notification.type}>
                <NotificationTypeIcon type={notification.type} />
              </NotificationIcon>
              
              <NotificationContent>
                <NotificationHeader>
                  <NotificationTitle>
                    {getNotificationTitle(notification)}
                  </NotificationTitle>
                  <NotificationDate>
                    {formatDate(notification.createdAt)}
                  </NotificationDate>
                </NotificationHeader>
                
                <NotificationMessage>
                  {notification.content}
                </NotificationMessage>
                
                <NotificationFooter>
                  <FooterInfo>
                    {notification.sender && (
                      <span>
                        De: {notification.sender.firstName} {notification.sender.lastName}
                      </span>
                    )}
                    
                    {notification.project && (
                      <ProjectInfo>
                        <FaProjectDiagram />
                        {notification.project.name}
                      </ProjectInfo>
                    )}
                    
                    <span>{timeAgo(notification.createdAt)}</span>
                  </FooterInfo>
                  
                  <ActionArea>
                    {!notification.read && (
                      <IconButton 
                        title="Marcar como leída"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                      >
                        <FaCheckDouble />
                      </IconButton>
                    )}
                    
                    <IconButton 
                      danger
                      title="Eliminar notificación"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('¿Eliminar esta notificación?')) {
                          deleteNotification(notification._id);
                        }
                      }}
                    >
                      <FaTimesCircle />
                    </IconButton>
                    
                    {notification.actionLink && (
                      <ViewButton
                        onClick={() => navigate(notification.actionLink)}
                      >
                        Ver
                      </ViewButton>
                    )}
                  </ActionArea>
                </NotificationFooter>
              </NotificationContent>
            </NotificationCard>
          ))}
          
          {totalPages > 1 && (
            <Pagination>
              <PageButton 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </PageButton>
              
              <PageButton 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </PageButton>
              
              {[...Array(totalPages)].map((_, i) => (
                <PageButton 
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </PageButton>
              ))}
              
              <PageButton 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </PageButton>
              
              <PageButton 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </PageButton>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaBell />
          </EmptyStateIcon>
          <EmptyStateTitle>No hay notificaciones</EmptyStateTitle>
          <EmptyStateText>
            No tienes notificaciones que coincidan con el filtro actual.
          </EmptyStateText>
        </EmptyState>
      )}
    </Container>
  );
};

export default NotificationsPage;