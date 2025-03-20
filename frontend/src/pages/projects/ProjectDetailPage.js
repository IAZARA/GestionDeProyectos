import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getProjectById, getProjectStats, getProjectActivity, updateProjectStatus } from '../../services/project.service';
import { getDocumentsByProject, downloadDocument } from '../../services/document.service';
import { getWikiPages, createWikiPage, updateWikiPage } from '../../services/wiki.service';
import { getProjectTasks, updateTaskStatus } from '../../services/task.service';
import UploadDocumentModal from '../../components/documents/UploadDocumentModal';
import WikiPageModal from '../../components/wiki/CreateWikiPageModal';
import InlineWikiEditor from '../../components/wiki/InlineWikiEditor';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import EditTaskModal from '../../components/tasks/EditTaskModal';
import ProjectMembersManager from '../../components/projects/ProjectMembersManager';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  margin-top: 0;
  padding-top: 0;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ProjectDescription = styled.p`
  color: #4B5563;
  margin: 0.5rem 0 1rem;
  line-height: 1.5;
`;

const ProjectDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  font-size: 0.875rem;
  
  span {
    font-weight: 500;
  }
`;

const ProjectProgressWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1.5rem;
`;

const ProjectProgress = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #E5E7EB;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-top: 0.5rem;
`;

// Volver a la implementación original del ProgressBar como componente styled
// para evitar problemas con referencias nulas
const ProgressBar = styled.div`
  height: 100%;
  background-color: #3B82F6;
  width: ${props => props.progress || '0%'};
  transition: width 0.5s ease-in-out;
  will-change: width;
`;

const ProgressText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
`;

const ProjectDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ProjectTeam = styled.div`
  margin-top: 1rem;
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const TeamMember = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  
  &:hover {
    background-color: #F3F4F6;
  }
`;

const MemberInfo = styled.div`
  margin-left: 0.75rem;
`;

const MemberName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const MemberRole = styled.div`
  font-size: 0.75rem;
  color: #6B7280;
`;

const ActivityFeed = styled.div`
  margin-top: 1rem;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
  background-color: ${props => {
    const actionColors = {
      create: '#10B981',  // verde
      update: '#6366F1',  // indigo
      delete: '#EF4444',  // rojo
      read: '#6B7280',    // gris
      status_change: '#F59E0B' // amarillo
    };
    return actionColors[props.type] || '#6B7280';
  }};
  color: white;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActivityUser = styled.span`
  font-weight: 500;
  color: #111827;
`;

const ActivityTime = styled.span`
  color: #6B7280;
`;

const ActivityDescription = styled.div`
  color: #4B5563;
  margin-top: 0.25rem;
`;

const ActivityDetails = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.25rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #9CA3AF;
  
  svg {
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
`;

// Constantes para mapeo de estados
const STATUS_MAP_TO_BACKEND = {
  'Por_Hacer': 'To_Do',
  'En_Progreso': 'In_Progress',
  'En_Revision': 'In_Review',
  'Completado': 'Completed',
  'Deleted': 'Deleted'
};

const STATUS_MAP_FROM_BACKEND = {
  'To_Do': 'Por_Hacer',
  'In_Progress': 'En_Progreso',
  'In_Review': 'En_Revision',
  'Completed': 'Completado',
  'Deleted': 'Deleted'
};

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5rem;
  margin-top: 1rem;
  border: 1px dashed #D1D5DB;
  border-radius: 0.375rem;
  color: #6B7280;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #F9FAFB;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 0.5rem;
  }
  
  span {
    font-size: 0.875rem;
  }
`;

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [wikiPages, setWikiPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState('Por_Hacer');
  const [activityPage, setActivityPage] = useState(1);
  const [activityLimit, setActivityLimit] = useState(10);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  
  // Función para obtener las estadísticas actualizadas del proyecto desde el servidor
  const fetchProjectStats = useCallback(
    async (shouldUpdateImmediately = false) => {
      if (!projectId) return;

      try {
        // Si se solicita actualización inmediata, actualizar el UI primero

        if (shouldUpdateImmediately) {
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(t => 
            t.backendStatus === 'Completed' || 
            STATUS_MAP_TO_BACKEND[t.status] === 'Completed' || 
            t.status === 'Completado'
          ).length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          setStats(prev => ({
            ...(prev || {}),
            totalTareas: totalTasks,
            tareasCompletadas: completedTasks,
            tareasPendientes: totalTasks - completedTasks,
            progreso: progress
          }));
        }

        // Obtener datos actualizados del servidor
        const statsData = await getProjectStats(projectId);
        
        // Actualizar con los datos del servidor
        setStats(statsData || {
          totalTareas: 0,
          tareasCompletadas: 0,
          tareasPendientes: 0,
          progreso: 0
        });
      } catch (error) {
        console.error('Error al obtener estadísticas del proyecto:', error);
      }
    },
    [projectId, tasks]
  );

  // Actualizar el useEffect para que se ejecute cuando cambie el estado tasks
  useEffect(() => {
    console.log('Actualizando estadísticas debido a cambio en tareas. Número de tareas:', tasks.length);
    if (Array.isArray(tasks) && tasks.length > 0) {
      fetchProjectStats(true);
    }
  }, [tasks, fetchProjectStats]);
  
  const fetchWikiData = async () => {
    try {
      const wikiData = await getWikiPages(projectId);
      if (wikiData && wikiData.length > 0) {
        setWikiPages(wikiData);
      } else {
        // Si no hay páginas wiki, creamos una con contenido por defecto
        const defaultContent = '## Descripción\nDescribe aquí los detalles de tu proyecto.\n\n## Objetivos\n- Objetivo 1\n- Objetivo 2\n- Objetivo 3\n\n## Requisitos\n- Requisito 1\n- Requisito 2\n- Requisito 3\n\n## Instrucciones\nAñade aquí las instrucciones o guías necesarias para el proyecto.\n\n## Recursos\n- [Enlace a recursos 1]\n- [Enlace a recursos 2]';
        setWikiPages([]);
      }
    } catch (error) {
      console.error('Error al obtener datos de la wiki:', error);
      setWikiPages([]);
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Guardar el ID del proyecto actual en localStorage para que otros componentes puedan acceder a él
        if (projectId) {
          localStorage.setItem('currentProject', JSON.stringify({ id: projectId }));
        }
        
        // Obtener datos principales del proyecto
        const [projectData, statsData, activityData, tasksData] = await Promise.all([
          getProjectById(projectId),
          getProjectStats(projectId),
          getProjectActivity(projectId),
          getProjectTasks(projectId)
        ]);
        
        if (!projectData) {
          setError('No se pudo encontrar el proyecto');
          setLoading(false);
          return;
        }

        setProject(projectData);
        setStats(statsData || { totalTareas: 0, tareasCompletadas: 0, tareasPendientes: 0, progreso: 0 });
        setActivity(activityData || []);
        // Mapear los estados al cargar las tareas
        const tasksWithBackendStatus = (tasksData || []).map(task => ({
          ...task,
          backendStatus: STATUS_MAP_TO_BACKEND[task.status] || task.status
        }));

        setTasks(tasksWithBackendStatus);
        
        // Obtener documentos del proyecto
        try {
          const documentsData = await getDocumentsByProject(projectId);
          setDocuments(documentsData || []);
        } catch (docError) {
          console.error('Error al cargar documentos:', docError);
          setDocuments([]);
        }
        
        // Obtener o crear la página wiki del proyecto
        try {
          await fetchWikiData();
        } catch (wikiError) {
          console.error('Error al cargar/crear página wiki:', wikiError);
          setWikiPages([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('No se pudo cargar la información del proyecto. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const handleStatusChange = async (status) => {
    try {
      const response = await updateProjectStatus(projectId, status);
      if (response.success) {
        setProject(prev => ({ ...prev, estado: status }));
      }
    } catch (error) {
      console.error('Error al actualizar el estado del proyecto:', error);
    }
  };

  const handleEditProject = () => {
    // Navegar a la página de edición de proyecto
    navigate(`/projects/${projectId}/edit`);
  };
  
  // Función para manejar el movimiento de tareas en el tablero Kanban
  const handleTaskMove = async (taskId, sourceStatus, destinationStatus) => {
    try {
      // Actualizar el estado local inmediatamente para una UI responsiva
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { ...task, status: destinationStatus }
            : task
        )
      );

      // Actualizar en el servidor primero
      await updateTaskStatus(taskId, destinationStatus);

      // Actualizar estado local y backendStatus después de la actualización del servidor
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? {
                ...task, 
                status: destinationStatus,
                backendStatus: STATUS_MAP_TO_BACKEND[destinationStatus] || destinationStatus
              }
            : task
        )
      );
      
      // Obtener las estadísticas actualizadas del servidor
      await fetchProjectStats(true);
    } catch (error) {
      console.error('Error al mover la tarea:', error);
      // Revertir cambios locales si hay error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { ...task, status: sourceStatus }
            : task
        )
      );
      // Recargar estadísticas del servidor
      fetchProjectStats(true);
    }
  };
  
  // Función para manejar el clic en una tarea
  const handleTaskClick = (taskId) => {
    console.log('Clic en tarea:', taskId);
    
    // Buscar la tarea por su ID
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      console.log('Detalles de la tarea:', task);
      setSelectedTask(task);
      setEditTaskModalOpen(true);
    }
  };
  
  // Función para manejar la adición de una nueva tarea
  const handleAddTask = (status) => {
    setSelectedTaskStatus(status);
    setCreateTaskModalOpen(true);
  };

  // Función para manejar la creación exitosa de una tarea
  const handleTaskCreated = async (newTask) => {
    console.log('Tarea creada recibida:', newTask);
    
    
    // Adaptar la tarea para el frontend
    const adaptedTask = {
      ...newTask,
      status: STATUS_MAP_FROM_BACKEND[newTask.status] || newTask.status,
      titulo: newTask.titulo || newTask.title,
      descripcion: newTask.descripcion || newTask.description
    };
    
    // Actualizar el estado local inmediatamente para UI responsiva
    setTasks(prevTasks => [...prevTasks, adaptedTask]);


    // Adaptar la tarea con el estado del backend
    adaptedTask.backendStatus = STATUS_MAP_TO_BACKEND[adaptedTask.status] || adaptedTask.status;

    // Calcular y actualizar estadísticas localmente
    const updatedTasks = [...tasks, adaptedTask];
    const totalTasks = updatedTasks.length;
    const completedTasks = updatedTasks.filter(t => 
      t.backendStatus === 'Completed' || t.status === 'Completado'
    ).length;
    setStats(prev => ({
      ...prev,
      totalTareas: totalTasks,
      tareasCompletadas: completedTasks,
      tareasPendientes: totalTasks - completedTasks,
      progreso: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }));

    // Actualizar datos desde el servidor
    try {
      await fetchProjectStats(true);
    } catch (error) {
      console.error('Error al actualizar estadísticas después de crear tarea:', error);
    }
  };

  const handleWikiPageUpdate = (updatedPage) => {
    setWikiPages([updatedPage]); // Solo mantenemos una página
  };

  const formatActivityDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (actionType, entityType) => {
    // Iconos basados en el tipo de acción
    switch (actionType) {
      case 'create':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'update':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.2322 5.23223L18.7677 8.76777M16.7322 3.73223C17.7085 2.75592 19.2914 2.75592 20.2677 3.73223C21.244 4.70854 21.244 6.29146 20.2677 7.26777L6.5 21.0355H3V17.4644L16.7322 3.73223Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'delete':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'status_change':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L20 6M20 6L16 2M20 6L16 10M15 18H4M4 18L8 14M4 18L8 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'read':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor"/>
            <path d="M21 12C19.1114 14.991 15.7183 18 12 18C8.2817 18 4.88856 14.991 3 12C4.88856 9.00903 8.2817 6 12 6C15.7183 6 19.1114 9.00903 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  // Actualizar la función para obtener actividades
  const fetchProjectActivity = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setActivityPage(1);
      }
      
      setActivityLoading(true);
      const currentPage = refresh ? 1 : activityPage;
      
      // Obtener actividad del proyecto con paginación
      const activityData = await getProjectActivity(projectId, {
        page: currentPage,
        limit: activityLimit
      });
      
      // Actualizar estado con los resultados
      if (refresh || currentPage === 1) {
        setActivity(activityData.activities || []);
      } else {
        setActivity(prev => [...prev, ...(activityData.activities || [])]);
      }
      
      // Guardar meta-información de paginación
      setActivityTotal(activityData.total || 0);
      setActivityPage(activityData.page || 1);
    } catch (error) {
      console.error('Error al obtener actividad del proyecto:', error);
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, [projectId, activityPage, activityLimit, getProjectActivity]);

  // Función para cargar más actividades
  const loadMoreActivities = () => {
    if (activity.length < activityTotal && !activityLoading) {
      setActivityPage(prevPage => prevPage + 1);
    }
  };

  // Actualizar el useEffect para llamar a la función
  useEffect(() => {
    if (projectId) {
      fetchProjectActivity(true);
    }
  }, [projectId, fetchProjectActivity]);

  // Función para manejar la eliminación de tareas
  const handleTaskDeleted = (taskId) => {
    console.log(`[handleTaskDeleted] INICIANDO - Tarea marcada como eliminada: ${taskId} del proyecto ID: ${projectId}`);
    
    try {
      // Verificar que la tarea existe en el estado actual
      const taskExists = tasks.some(task => task._id === taskId);
      if (!taskExists) {
        console.warn(`[handleTaskDeleted] La tarea ${taskId} no existe en el estado actual`);
        return;
      }

      // Prueba directa - Eliminar por completo la tarea del estado
      // En lugar de solo marcarla como eliminada
      console.log('[handleTaskDeleted] Aplicando la estrategia de ELIMINAR la tarea del estado completamente');
      const filteredTasks = tasks.filter(task => task._id !== taskId);
      
      console.log(`[handleTaskDeleted] Comparación de tareas: Original: ${tasks.length}, Filtradas: ${filteredTasks.length}`);
      console.log('[handleTaskDeleted] Tarea que se está eliminando:', tasks.find(t => t._id === taskId));
      
      // Actualizar el estado directamente con las tareas filtradas (sin la eliminada)
      setTasks(filteredTasks);
      
      // Log para verificar que el estado se actualizó correctamente
      setTimeout(() => {
        console.log('[handleTaskDeleted] Verificación de estado después de eliminar:', 
          tasks.find(t => t._id === taskId) ? 'La tarea AÚN existe en el estado' : 'La tarea ya NO existe en el estado');
      }, 300);
      
      // Además, forzar una actualización de las estadísticas
      const completedTasks = filteredTasks.filter(t => 
        t.backendStatus === 'Completed' || 
        STATUS_MAP_TO_BACKEND[t.status] === 'Completed' || 
        t.status === 'Completado'
      ).length;
      const totalTasks = filteredTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Actualizar estadísticas localmente
      setStats(prev => ({
        ...(prev || {}),
        totalTareas: totalTasks,
        tareasCompletadas: completedTasks,
        tareasPendientes: totalTasks - completedTasks,
        progreso: progress
      }));
      
      // Actualizar estadísticas desde el servidor
      fetchProjectStats(true);
      
      console.log('[handleTaskDeleted] Estado actualizado con éxito');
    } catch (error) {
      console.error('[handleTaskDeleted] Error al actualizar estado después de marcar tarea como eliminada:', error);
    } finally {
      // Cerrar el modal
      setEditTaskModalOpen(false);
      setSelectedTask(null);
    }
  };

  if (loading) {
    return <Spinner fullPage />;
  }

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
        <Button onClick={() => navigate('/projects')}>Volver a Proyectos</Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <h2>Proyecto no encontrado</h2>
        <Button onClick={() => navigate('/projects')}>Volver a Proyectos</Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completado':
        return 'success';
      case 'en_progreso':
        return 'info';
      case 'en_pausa':
        return 'warning';
      case 'cancelado':
        return 'danger';
      case 'pendiente':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_progreso':
        return 'En Progreso';
      case 'en_pausa':
        return 'En Pausa';
      case 'cancelado':
        return 'Cancelado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return status;
    }
  };
  
  // Manejadores para los modales
  const handleDocumentUploadSuccess = (newDocument) => {
    setDocuments([newDocument, ...documents]);
  };

  return (
    <>
      <div>
        <PageHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <PageTitle>{project.nombre}</PageTitle>
            <Badge 
              variant={getStatusBadgeVariant(project.estado)}
              onClick={() => {
                // Cambiar el estado del proyecto al hacer clic en el badge
                // Rotamos entre los estados: pendiente -> en_progreso -> completado
                const estados = ['pendiente', 'en_progreso', 'completado'];
                const currentIndex = estados.indexOf(project.estado);
                const nextIndex = (currentIndex + 1) % estados.length;
                handleStatusChange(estados[nextIndex]);
              }}
              style={{ cursor: 'pointer' }}
            >
              {getStatusLabel(project.estado)}
            </Badge>
          </div>
        </PageHeader>

        <ProjectInfo>
          <ProjectDescription>
            {project.descripcion}
          </ProjectDescription>
          
          <ProjectDate>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 2C5.44772 2 5 2.44772 5 3V4H4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V6C18 4.89543 17.1046 4 16 4H15V3C15 2.44772 14.5523 2 14 2C13.4477 2 13 2.44772 13 3V4H7V3C7 2.44772 6.55228 2 6 2ZM16 6H4V16H16V6Z" fill="currentColor"/>
            </svg>
            <span>Creado:</span> {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </ProjectDate>
          
          <ProjectDate>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM11 6C11 5.44772 10.5523 5 10 5C9.44771 5 9 5.44772 9 6V10C9 10.2652 9.10536 10.5196 9.29289 10.7071L12.1213 13.5355C12.5118 13.9261 13.145 13.9261 13.5355 13.5355C13.9261 13.145 13.9261 12.5118 13.5355 12.1213L11 9.58579V6Z" fill="currentColor"/>
            </svg>
            <span>Fecha límite:</span> {project.fechaFin ? new Date(project.fechaFin).toLocaleDateString() : 'Sin fecha límite'}
          </ProjectDate>
        </ProjectInfo>

        <ProjectProgressWrapper>
          <ProgressText>
            <span>Progreso del proyecto</span>
            <span>{stats?.progreso || 0}%</span>
          </ProgressText>
          <ProjectProgress>
            {/* Usar key para forzar la recreación del componente cuando cambia el progreso */}
            <ProgressBar 
              key={`progress-${Date.now()}-${stats?.progreso || 0}`} 
              progress={`${stats?.progreso || 0}%`} 
            />
          </ProjectProgress>
        </ProjectProgressWrapper>

        <Tabs defaultIndex={0}>
          <Tabs.Tab>Tablero Kanban</Tabs.Tab>
          <Tabs.Tab>Documentos</Tabs.Tab>
          <Tabs.Tab>Wiki</Tabs.Tab>
          <Tabs.Tab>Actividad</Tabs.Tab>
          <Tabs.Tab>Miembros</Tabs.Tab>
          
          <Tabs.Panel>
            <KanbanBoard 
              tasks={tasks} 
              projectId={projectId} 
              onTaskMove={handleTaskMove} 
              onTaskClick={handleTaskClick} 
              onAddTask={handleAddTask} 
            />
          </Tabs.Panel>
          
          <Tabs.Panel>
            <Card>
              <Card.Body>
                <h3>Documentos del Proyecto</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p>Aquí podrás subir y gestionar los documentos relacionados con este proyecto.</p>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <Button 
                      variant="primary" 
                      leftIcon={
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.5 15H14.5M10 4V11M10 11L13 8M10 11L7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      onClick={() => setUploadDocumentModalOpen(true)}
                    >
                      Subir documento
                    </Button>
                  </div>
                  
                  <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0 }}>Documentos recientes</h4>
                      <div>
                        <select style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                          <option>Ordenar por: Más recientes</option>
                          <option>Ordenar por: Nombre</option>
                          <option>Ordenar por: Tamaño</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {documents && documents.length > 0 ? (
                        documents.map((doc, index) => (
                          <div 
                            key={doc._id || index} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '0.75rem',
                              borderRadius: '4px',
                              backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                              border: '1px solid #eee'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                                <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                                <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
                              </svg>
                              <div>
                                <div style={{ fontWeight: 'bold' }}>{doc.nombre || doc.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {new Date(doc.createdAt || doc.fechaCreacion).toLocaleDateString()} · 
                                  {doc.tamaño || doc.size ? `${(doc.tamaño || doc.size) / 1024} KB` : 'Tamaño desconocido'}
                                </div>
                              </div>
                            </div>
                            <div>
                              <Button 
                                variant="text" 
                                onClick={async () => {
                                  try {
                                    // Obtener el blob del documento del servicio
                                    const blob = await downloadDocument(projectId, doc._id);
                                    
                                    // Crear una URL a partir del blob
                                    const url = window.URL.createObjectURL(blob);
                                    
                                    // Crear un enlace temporal
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', doc.name || doc.nombre || 'documento');
                                    
                                    // Añadir el enlace al documento
                                    document.body.appendChild(link);
                                    
                                    // Hacer clic y eliminar el enlace
                                    link.click();
                                    document.body.removeChild(link);
                                    
                                    // Liberar la URL
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error('Error al descargar documento:', error);
                                    alert('Error al descargar el documento. Por favor, intente nuevamente.');
                                  }
                                }}
                              >
                                Descargar
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#757575', textAlign: 'center', margin: '2rem 0' }}>
                          No hay documentos disponibles para este proyecto.
                          <br />
                          Sube tu primer documento para comenzar.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Tabs.Panel>
          
          <Tabs.Panel>
            <Card>
              <Card.Body>
                <InlineWikiEditor projectId={projectId} />
              </Card.Body>
            </Card>
          </Tabs.Panel>
          
          <Tabs.Panel>
            <ProjectDetailGrid>
              <Card>
                <Card.Header>
                  <div className="flex justify-between items-center">
                    <h3>Actividad Reciente</h3>
                    <Button variant="text" size="sm" onClick={() => fetchProjectActivity()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 12L12 12M12 12L8 12M12 12V8M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Actualizar
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <ActivityFeed>
                    <ActivityList>
                      {activity.length > 0 ? (
                        <>
                          {activity.map((item, index) => (
                            <ActivityItem key={index}>
                              <ActivityIcon type={item.tipo} entityType={item.entidad?.tipo}>
                                {getActivityIcon(item.tipo, item.entidad?.tipo)}
                              </ActivityIcon>
                              <ActivityContent>
                                <ActivityHeader>
                                  <ActivityUser>{item.usuario?.nombre || 'Usuario'}</ActivityUser>
                                  <ActivityTime>{formatActivityDate(item.fecha)}</ActivityTime>
                                </ActivityHeader>
                                <ActivityDescription>{item.descripcion}</ActivityDescription>
                                {item.detalles && item.detalles.description && (
                                  <ActivityDetails>{item.detalles.description}</ActivityDetails>
                                )}
                              </ActivityContent>
                            </ActivityItem>
                          ))}
                          
                          {/* Botón para cargar más actividades */}
                          {activity.length < activityTotal && (
                            <LoadMoreButton 
                              onClick={loadMoreActivities}
                              disabled={activityLoading}
                            >
                              {activityLoading ? (
                                <>
                                  <Spinner size="sm" />
                                  <span>Cargando...</span>
                                </>
                              ) : (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span>Cargar más actividades ({activity.length} de {activityTotal})</span>
                                </>
                              )}
                            </LoadMoreButton>
                          )}
                        </>
                      ) : (
                        <EmptyState>
                          {activityLoading ? (
                            <>
                              <Spinner size="md" />
                              <p>Cargando actividades...</p>
                            </>
                          ) : (
                            <>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12L15 15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#9CA3AF" strokeWidth="2"/>
                              </svg>
                              <p>No hay actividad reciente para mostrar.</p>
                              <Button variant="outline" size="sm" onClick={() => fetchProjectActivity(true)}>Actualizar</Button>
                            </>
                          )}
                        </EmptyState>
                      )}
                    </ActivityList>
                  </ActivityFeed>
                </Card.Body>
              </Card>
              
              <div>
                <Card>
                  <Card.Header>
                    <h3>Equipo del Proyecto</h3>
                  </Card.Header>
                  <Card.Body>
                    <ProjectTeam>
                      <TeamList>
                        {project.miembros && project.miembros.length > 0 ? (
                          project.miembros.map((member, index) => (
                            <TeamMember key={index}>
                              <Avatar 
                                name={member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Usuario'} 
                                src={member.user?.profilePicture} 
                                size="sm"
                              />
                              <MemberInfo>
                                <MemberName>{member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Usuario'}</MemberName>
                                <MemberRole>{member.user?.role || 'Miembro'}</MemberRole>
                              </MemberInfo>
                            </TeamMember>
                          ))
                        ) : (
                          <p>No hay miembros asignados a este proyecto.</p>
                        )}
                      </TeamList>
                    </ProjectTeam>
                  </Card.Body>
                </Card>
                
                <Card className="mt-4">
                  <Card.Header>
                    <h3>Estadísticas</h3>
                  </Card.Header>
                  <Card.Body>
                    <div>
                      <p><strong>Tareas totales:</strong> {stats?.totalTareas || 0}</p>
                      <p><strong>Tareas completadas:</strong> {stats?.tareasCompletadas || 0}</p>
                      <p><strong>Tareas pendientes:</strong> {stats?.tareasPendientes || 0}</p>
                      <p><strong>Días restantes:</strong> {stats?.diasRestantes || 0}</p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </ProjectDetailGrid>
          </Tabs.Panel>
          
          <Tabs.Panel>
            <ProjectMembersManager
              projectId={projectId}
              project={project}
              onMemberUpdate={(updatedMembers) => {
                setProject(prev => ({ ...prev, miembros: updatedMembers }));
              }}
            />
          </Tabs.Panel>
        </Tabs>
        
        {/* Modales para documentos y wiki */}
        <UploadDocumentModal 
          open={uploadDocumentModalOpen}
          onClose={() => setUploadDocumentModalOpen(false)}
          projectId={projectId}
          onUploadSuccess={handleDocumentUploadSuccess}
        />
        
        {createTaskModalOpen && (
          <CreateTaskModal
            open={createTaskModalOpen}
            onClose={() => setCreateTaskModalOpen(false)}
            projectId={projectId}
            initialStatus={selectedTaskStatus}
            onCreateSuccess={handleTaskCreated}
          />
        )}
        
        {editTaskModalOpen && selectedTask && (
          <EditTaskModal
            open={editTaskModalOpen}
            onClose={() => {
              setEditTaskModalOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onEditSuccess={async (updatedTask) => {
              console.log('Tarea actualizada:', updatedTask);
              
              // Actualizar la tarea en el estado local
              setTasks(prevTasks => prevTasks.map(task => 
                task._id === updatedTask._id ? {
                  ...updatedTask,
                  status: updatedTask.status,
                  titulo: updatedTask.title || updatedTask.titulo,
                  descripcion: updatedTask.description || updatedTask.descripcion
                } : task
              ));
              
              // Actualizar las estadísticas inmediatamente para UI responsiva
              const updatedTasks = tasks.map(task => {
                if (task._id === updatedTask._id) {
                  return {
                    ...updatedTask,
                    status: updatedTask.status,
                    backendStatus: STATUS_MAP_TO_BACKEND[updatedTask.status] || updatedTask.status
                  };
                }
                return task;
              });

              const totalTasks = updatedTasks.length;
              const completedTasks = updatedTasks.filter(t => 
                t.backendStatus === 'Completed' || t.status === 'Completado'
              ).length;
              
              // Actualizar stats localmente
              setStats(prev => ({
                ...prev,
                totalTareas: totalTasks,
                tareasCompletadas: completedTasks,
                tareasPendientes: totalTasks - completedTasks,
                progreso: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
              }));
              
              // Actualizar desde el servidor
              try {
                await fetchProjectStats(true);
              } catch (error) {
                console.error('Error al actualizar estadísticas después de editar tarea:', error);
              }
            }}
            onDeleteSuccess={handleTaskDeleted}
          />
        )}
      </div>
    </>
  );
};

export default ProjectDetailPage;
