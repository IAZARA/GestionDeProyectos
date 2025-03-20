import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaProjectDiagram, FaTasks, FaCalendarCheck, FaUsers, FaBell, FaCalendarDay, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getMyProjects } from '../../services/project.service';
import { getMyTasks } from '../../services/task.service';
import { getMyEvents } from '../../services/calendar.service';
import { getRecentActivity } from '../../services/activity.service';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { Container, Row, Col } from 'react-bootstrap';
import { FaChartBar } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/es';

// Configurar locale para fechas
moment.locale('es');

const DashboardContainer = styled.div`
  padding: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DashboardCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: ${props => props.bgColor || '#e3f2fd'};
  color: ${props => props.iconColor || '#1a237e'};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.75rem;
  font-size: 1.25rem;
`;

const CardTitle = styled.h2`
  font-size: 1.1rem;
  color: #424242;
  margin: 0;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1a237e;
  margin: 0.5rem 0;
`;

const CardFooter = styled.div`
  font-size: 0.875rem;
  color: #757575;
  margin-top: auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: #424242;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ActivityFeed = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const ActivityItem = styled.div`
  padding: 1rem;
  background-color: ${props => props.isToday ? '#e3f2fd' : 'white'};
  border-radius: 8px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  ${props => props.isToday && `
    border-left: 4px solid #1976d2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  `}
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${props => props.bgColor || '#e3f2fd'};
  color: ${props => props.iconColor || '#1a237e'};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-size: 0.875rem;
  color: #9e9e9e;
`;

const TasksContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TaskItem = styled.div`
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  }};
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled.div`
  font-weight: bold;
`;

const TaskBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: ${props => {
    switch (props.status) {
      case 'Por_Hacer': return '#e3f2fd';
      case 'En_Progreso': return '#fff8e1';
      case 'En_Revision': return '#e8f5e9';
      case 'Completado': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Por_Hacer': return '#1976d2';
      case 'En_Progreso': return '#f57c00';
      case 'En_Revision': return '#7b1fa2';
      case 'Completado': return '#388e3c';
      default: return '#757575';
    }
  }};
`;

const TaskDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #757575;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #757575;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
`;

const TodayBadge = styled.span`
  background-color: #1976d2;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 8px;
`;

const formatDate = (dateString) => {
  if (!dateString) return '';
  return moment(dateString).format('DD MMM YYYY');
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  return moment(dateString).format('HH:mm');
};

const formatEventDate = (event) => {
  const start = event.start || event.startDate;
  const end = event.end || event.endDate;
  const allDay = event.allDay;
  
  if (allDay) {
    return moment(start).format('DD MMM YYYY');
  }
  
  if (moment(start).isSame(end, 'day')) {
    return `${moment(start).format('DD MMM YYYY')} · ${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
  }
  
  return `${moment(start).format('DD MMM YYYY HH:mm')} - ${moment(end).format('DD MMM YYYY HH:mm')}`;
};

const getGreeting = () => {
  const hour = moment().hour();
  
  if (hour >= 5 && hour < 12) {
    return 'Buenos días';
  } else if (hour >= 12 && hour < 20) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    projectCount: 0,
    taskCount: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    upcomingEventsList: [],
    recentActivity: [],
    pendingTasks: []
  });
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos reales a través de los servicios
        const projects = await getMyProjects();
        const allTasks = await getMyTasks();
        const tasks = allTasks ? allTasks.filter(task => 
          task.status !== 'Deleted' && 
          task.backendStatus !== 'Deleted'
        ) : [];
        
        const activities = await getRecentActivity();
        const eventsFromAPI = await getMyEvents();
        const customEvents = JSON.parse(localStorage.getItem('customEvents') || '[]');
        
        // Combinar y normalizar todos los eventos
        const allEvents = [...eventsFromAPI, ...customEvents].map(event => ({
          ...event,
          startDate: event.start || event.startDate,
          endDate: event.end || event.endDate
        }));
        
        // Filtrar eventos próximos (próximos 7 días) y ordenarlos por fecha
        const today = moment().startOf('day');
        const nextWeek = moment().add(7, 'days').endOf('day');
        
        const upcomingEventsList = allEvents
          .filter(event => {
            const eventStart = moment(event.startDate);
            return eventStart.isBetween(today, nextWeek, null, '[]');
          })
          .sort((a, b) => moment(a.startDate) - moment(b.startDate));
        
        setDashboardData({
          projectCount: projects?.length || 0,
          taskCount: tasks?.length || 0,
          completedTasks: tasks?.filter(task => 
            task.status === 'Completed' || 
            task.status === 'Completado' || 
            task.backendStatus === 'Completed'
          ).length || 0,
          upcomingEvents: upcomingEventsList.length || 0,
          upcomingEventsList,
          recentActivity: activities || [],
          pendingTasks: tasks
            ?.filter(task => 
              task.status !== 'Completed' && 
              task.status !== 'Completado' &&
              task.backendStatus !== 'Completed' &&
              task.status !== 'Deleted' &&
              task.backendStatus !== 'Deleted'
            )
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5) || []
        });
        
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Por favor, intente de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <Spinner fullPage />;
  }
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  // Función para obtener el color basado en el tipo de evento
  const getEventColor = (type) => {
    switch (type) {
      case 'meeting':
        return { bgColor: '#e3f2fd', iconColor: '#1976d2' };
      case 'task':
        return { bgColor: '#e8f5e9', iconColor: '#388e3c' };
      case 'deadline':
        return { bgColor: '#ffebee', iconColor: '#d32f2f' };
      case 'training':
        return { bgColor: '#f3e5f5', iconColor: '#7b1fa2' };
      case 'license':
        return { bgColor: '#e1f5fe', iconColor: '#0288d1' };
      default:
        return { bgColor: '#e3f2fd', iconColor: '#1976d2' };
    }
  };
  
  return (
    <DashboardContainer>
      <PageTitle>{getGreeting()}, {currentUser?.firstName || 'Usuario'}</PageTitle>
      
      <DashboardGrid>
        <DashboardCard>
          <CardHeader>
            <CardIcon bgColor="#e8f5e9" iconColor="#388e3c">
              <FaProjectDiagram />
            </CardIcon>
            <CardTitle>Proyectos Activos</CardTitle>
          </CardHeader>
          <CardValue>{dashboardData.projectCount}</CardValue>
          <CardFooter>
            <Link to="/projects" style={{ textDecoration: 'none', color: 'inherit' }}>
              Ver todos los proyectos
            </Link>
          </CardFooter>
        </DashboardCard>
        
        <DashboardCard>
          <CardHeader>
            <CardIcon bgColor="#fff8e1" iconColor="#f57c00">
              <FaTasks />
            </CardIcon>
            <CardTitle>Tareas Asignadas</CardTitle>
          </CardHeader>
          <CardValue>{dashboardData.taskCount}</CardValue>
          <CardFooter>
            <Link to="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
              {dashboardData.completedTasks} tareas completadas
            </Link>
          </CardFooter>
        </DashboardCard>
        
        <DashboardCard>
          <CardHeader>
            <CardIcon bgColor="#e3f2fd" iconColor="#1976d2">
              <FaCalendarCheck />
            </CardIcon>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardValue>{dashboardData.upcomingEvents}</CardValue>
          <CardFooter>
            <Link to="/calendar" style={{ textDecoration: 'none', color: 'inherit' }}>
              Ver calendario
            </Link>
          </CardFooter>
        </DashboardCard>
      </DashboardGrid>
      
      <SectionTitle>Tareas Pendientes</SectionTitle>
      <TasksContainer>
        {dashboardData.pendingTasks.length > 0 ? (
          <TaskList>
            {dashboardData.pendingTasks.map(task => (
              <TaskItem key={task._id} priority={task.priority}>
                <TaskHeader>
                  <TaskTitle>
                    <Link to={`/tasks/${task._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {task.title || task.titulo}
                    </Link>
                  </TaskTitle>
                  <TaskBadge status={task.status}>
                    {task.status.replace('_', ' ')}
                  </TaskBadge>
                </TaskHeader>
                <TaskDetails>
                  <div>
                    Proyecto: 
                    <Link to={`/projects/${task.project?._id || task.project || task.projectId}`} style={{ marginLeft: '5px', color: '#1a237e' }}>
                      {task.projectName || task.project?.name || 'Ver proyecto'}
                    </Link>
                  </div>
                  <div>Vence: {formatDate(task.dueDate)}</div>
                </TaskDetails>
              </TaskItem>
            ))}
          </TaskList>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            No tienes tareas pendientes
          </div>
        )}
      </TasksContainer>
      
      <SectionTitle>Próximos Eventos</SectionTitle>
      <ActivityFeed>
        {dashboardData.upcomingEventsList && dashboardData.upcomingEventsList.length > 0 ? (
          dashboardData.upcomingEventsList.map((event, index) => {
            const colors = getEventColor(event.type);
            const eventStart = moment(event.startDate);
            const isToday = eventStart.isSame(moment(), 'day');
            
            return (
              <ActivityItem key={event.id || index} isToday={isToday}>
                <ActivityIcon 
                  bgColor={event.color ? event.color + '1A' : colors.bgColor}
                  iconColor={event.color || colors.iconColor}
                >
                  <FaCalendarDay />
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>
                    {event.title}
                    {isToday && <TodayBadge>HOY</TodayBadge>}
                  </ActivityTitle>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '12px' }}>
                      <FaClock style={{ marginRight: '4px', fontSize: '12px' }} />
                      {formatEventDate(event)}
                    </span>
                    {event.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <FaMapMarkerAlt style={{ marginRight: '4px', fontSize: '12px' }} />
                        {event.location}
                      </span>
                    )}
                  </div>
                </ActivityContent>
              </ActivityItem>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            No hay eventos programados para los próximos 7 días
          </div>
        )}
      </ActivityFeed>
    </DashboardContainer>
  );
};

export default DashboardPage;