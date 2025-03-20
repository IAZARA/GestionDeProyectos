import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaFilter, FaSort, FaStar, FaRegStar, FaTrash, FaUser, FaEdit } from 'react-icons/fa';
import API from '../../services/api';
import { Modal } from '../../components/Modal';
import { deleteProject, getProjectMembers, getProjects, updateProject } from '../../services/project.service';
import { getUserById } from '../../services/user.service';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';

const PageContainer = styled.div`
  padding: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${props => props.primary ? '#1a237e' : 'white'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 1px solid ${props => props.primary ? '#1a237e' : '#ddd'};
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#151c60' : '#f5f5f5'};
  }
`;

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  min-width: 300px;
  
  input {
    border: none;
    outline: none;
    padding: 0.25rem 0.5rem;
    flex: 1;
    font-size: 0.9rem;
  }
  
  svg {
    color: #757575;
    margin-right: 0.5rem;
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProjectCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const ProjectHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`;

const ProjectTitle = styled(Link)`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a237e;
  margin: 0;
  text-decoration: none;
  display: block;
  margin-right: 2rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProjectOptions = styled.div`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  
  &:hover {
    color: #1a237e;
  }
`;

const ProjectContent = styled.div`
  padding: 1.25rem;
`;

const ProjectDescription = styled.p`
  color: #757575;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.alignRight ? 'flex-end' : 'flex-start'};
  width: 100%;
`;

const MetaLabel = styled.span`
  font-size: 0.75rem;
  color: #9e9e9e;
  margin-bottom: 0.25rem;
`;

const MetaValue = styled.span`
  font-size: 0.9rem;
  color: #424242;
  font-weight: 500;
`;

const ProgressContainer = styled.div`
  margin-top: 0.5rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
`;

const ProgressText = styled.span`
  color: #757575;
`;

const ProgressValue = styled.span`
  font-weight: 500;
  color: #1a237e;
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => {
    if (props.value < 25) return '#f44336';
    if (props.value < 50) return '#ff9800';
    if (props.value < 75) return '#2196f3';
    return '#4caf50';
  }};
  width: ${props => props.value}%;
  transition: width 0.3s ease;
`;

const ProjectFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem 1.25rem;
  background-color: #f9f9f9;
  border-top: 1px solid #f0f0f0;
`;

const MembersContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
`;

const MembersLabel = styled.span`
  color: #757575;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const MembersList = styled.span`
  color: #1a237e;
  font-weight: 500;
`;

const MembersNamesList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 0.25rem;
  max-height: 4.5rem;
  overflow-y: auto;
`;

const MemberItem = styled.div`
  font-size: 0.75rem;
  color: #424242;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'Pendiente': return '#e3f2fd';
      case 'En_Progreso': return '#fff8e1';
      case 'Completado': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Pendiente': return '#1976d2';
      case 'En_Progreso': return '#f57c00';
      case 'Completado': return '#388e3c';
      default: return '#757575';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EmptyTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  color: #757575;
  margin-bottom: 1.5rem;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const EffortPriorityContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const EffortPriorityBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: ${props => {
    const value = parseInt(props.value) || 0;
    if (value <= 4) return '#e8f5e9'; // verde
    if (value <= 7) return '#fff8e1'; // amarillo
    return '#ffebee'; // rojo
  }};
  width: 45%;
`;

const BoxLabel = styled.span`
  font-size: 0.7rem;
  font-weight: bold;
  color: #616161;
  margin-bottom: 0.2rem;
`;

const BoxValue = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => {
    const value = parseInt(props.value) || 0;
    if (value <= 4) return '#4caf50'; // verde
    if (value <= 7) return '#ff9800'; // naranja
    return '#f44336'; // rojo
  }};
`;

// Función para formatear fechas en español
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha límite';
  
  // Asegurarse de que la fecha es válida
  let date;
  try {
    // Crear la fecha utilizando UTC para evitar problemas de zona horaria
    const rawDate = new Date(dateString);
    // Ajustar para la zona horaria local
    date = new Date(rawDate.getTime() + (rawDate.getTimezoneOffset() * 60000));
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`Fecha inválida: ${dateString}`);
      return 'Fecha inválida';
    }
  } catch (error) {
    console.error(`Error al procesar la fecha: ${dateString}`, error);
    return 'Fecha inválida';
  }
  
  // Formatear la fecha usando la configuración para España
  const options = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' };
  return date.toLocaleDateString('es-ES', options);
};

// Función para obtener el texto del estado en español
const getStatusLabel = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'in_progress': 'En progreso',
    'completed': 'Completado',
    'on_hold': 'En pausa',
    'cancelled': 'Cancelado',
    'Pending': 'Pendiente',
    'In_Progress': 'En progreso',
    'Completed': 'Completado',
    'On_Hold': 'En pausa',
    'Cancelled': 'Cancelado'
  };
  
  return statusMap[status] || 'Pendiente';
};

// Función para generar un color de avatar consistente basado en el nombre del usuario
const getAvatarColor = (name) => {
  // Colores predefinidos que combinan bien con el tema de la aplicación
  const colors = [
    '#1976d2', // azul
    '#388e3c', // verde
    '#f57c00', // naranja
    '#7b1fa2', // púrpura
    '#c2185b', // rosa
    '#0097a7', // cian
    '#00796b', // verde azulado
    '#303f9f', // índigo
    '#5d4037', // marrón
    '#455a64'  // azul grisáceo
  ];
  
  // Si no hay nombre, usar el primer color
  if (!name || name.length === 0) return colors[0];
  
  // Calcular la suma de los códigos de caracteres del nombre
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  
  // Devolver un color basado en el nombre (determinista)
  return colors[sum % colors.length];
};

const ProjectsListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showEffortPriorityModal, setShowEffortPriorityModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [effortValue, setEffortValue] = useState(1);
  const [priorityValue, setPriorityValue] = useState(1);
  
  const navigate = useNavigate();
  const { canManageProjects, user } = useAuth();
  
  useEffect(() => {
    // Función para cargar proyectos desde la API
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Usar el servicio de proyectos que incluye el parámetro includeMembers=true
        try {
          const projects = await getProjects();
          console.log('Proyectos obtenidos a través del servicio:', projects);
          
          if (Array.isArray(projects) && projects.length > 0) {
            console.log('Estructura de proyectos recibidos:', projects);
            // Depurar estructura de miembros
            projects.forEach(project => {
              const members = project.members || project.miembros || [];
              console.log(`Miembros del proyecto "${project.name || project.title || project.nombre}":`, members);
            });
            setProjects(projects);
          } else {
            // Si no hay proyectos, mostrar array vacío
            setProjects([]);
          }
          setError(null);
        } catch (apiError) {
          console.error('Error al obtener proyectos de la API:', apiError);
          setProjects([]);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
        setError('Error al cargar proyectos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    // Ejecutar la función para cargar proyectos
    fetchProjects();
  }, []);
  
  // Filtrar y ordenar proyectos
  const filteredProjects = projects
    .filter(project => {
      // Filtrar por término de búsqueda
      const projectName = project.name || project.title || project.nombre || '';
      const projectDesc = project.description || project.descripcion || '';
      
      const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           projectDesc.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrar por estado
      const projectStatus = project.status || project.estado || '';
      const matchesStatus = statusFilter ? projectStatus === statusFilter : true;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Ordenar proyectos
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        return new Date(b.startDate) - new Date(a.startDate);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      // Por defecto, ordenar por fecha de inicio (más reciente primero)
      return new Date(b.startDate) - new Date(a.startDate);
    });
  
  const toggleStar = (projectId) => {
    setProjects(projects.map(project => 
      project._id === projectId 
        ? { ...project, isStarred: !project.isStarred } 
        : project
    ));
  };
  
  const handleDeleteProject = async () => {
    try {
      if (!projectToDelete || !projectToDelete._id) {
        setDeleteError('Error: No se puede identificar el proyecto a eliminar');
        return;
      }
      
      // Confirmar la eliminación directamente sin verificación de contraseña
      try {
        await deleteProject(projectToDelete._id);
        setProjects(projects.filter(p => p._id !== projectToDelete._id));
        toast.success('Proyecto eliminado correctamente');
        setShowDeleteModal(false);
        setProjectToDelete(null);
        setPassword('');
        setDeleteError('');
      } catch (deleteError) {
        console.error('Error específico al eliminar el proyecto:', deleteError);
        
        // Manejar diferentes tipos de errores basados en el código de estado
        if (deleteError.status === 500) {
          setDeleteError('Error en el servidor. Por favor, inténtalo más tarde o contacta al administrador.');
        } else if (deleteError.status === 404) {
          setDeleteError('El proyecto no se encuentra. Es posible que ya haya sido eliminado.');
          // Actualizar la lista de proyectos para reflejar el estado actual
          setProjects(projects.filter(p => p._id !== projectToDelete._id));
        } else if (deleteError.status === 403) {
          setDeleteError('No tienes permiso para eliminar este proyecto.');
        } else if (deleteError.status === 429) {
          setDeleteError('Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.');
        } else {
          // Mensaje de error genérico para otros casos
          setDeleteError(`Error al eliminar el proyecto: ${deleteError.message || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error('Error general al eliminar el proyecto:', error);
      setDeleteError('Ocurrió un error al intentar eliminar el proyecto. Por favor, inténtalo de nuevo.');
    }
  };
  
  const handleUpdateEffortPriority = async () => {
    try {
      if (!projectToEdit) return;
      
      // Verificar que los valores estén en el rango correcto
      const effort = Math.max(1, Math.min(10, parseInt(effortValue) || 1));
      const priority = Math.max(1, Math.min(10, parseInt(priorityValue) || 1));
      
      // Actualizar el proyecto con los nuevos valores
      const updatedProject = await updateProject(projectToEdit._id, {
        effort: effort,
        priority: priority
      });
      
      // Actualizar el proyecto en la lista local
      setProjects(projects.map(project => 
        project._id === projectToEdit._id 
          ? { ...project, effort: effort, priority: priority } 
          : project
      ));
      
      // Cerrar el modal
      setShowEffortPriorityModal(false);
      setProjectToEdit(null);
      
      toast.success('Esfuerzo y prioridad actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar esfuerzo y prioridad:', error);
      toast.error('Error al actualizar los valores');
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Cargando proyectos...</PageTitle>
        </PageHeader>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Proyectos</PageTitle>
        </PageHeader>
        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          {error}
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Proyectos</PageTitle>
        <ActionButtons>
          {canManageProjects() && (
            <StyledButton primary onClick={() => navigate('/projects/create')}>
              <FaPlus />
              Nuevo Proyecto
            </StyledButton>
          )}
        </ActionButtons>
      </PageHeader>
      
      <ToolbarContainer>
        <SearchBar>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Buscar proyectos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </ToolbarContainer>
      
      {filteredProjects.length > 0 ? (
        <ProjectsGrid>
          {filteredProjects.map(project => (
            <ProjectCard key={project._id} onClick={() => navigate(`/projects/${project._id}`)} style={{ cursor: 'pointer' }}>
              <ProjectHeader>
                <ProjectTitle to={`/projects/${project._id}`}>
                  {project.name || project.title || project.nombre || 'Proyecto sin nombre'}
                </ProjectTitle>
                <ProjectOptions>
                  {(canManageProjects() || user.role === 'admin') && (
                    <>
                      <IconButton 
                        title="Editar esfuerzo y prioridad"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToEdit(project);
                          setEffortValue(project.effort || 1);
                          setPriorityValue(project.priority || 1);
                          setShowEffortPriorityModal(true);
                        }}
                      >
                        <FaEdit color="#1a237e" />
                      </IconButton>
                      <IconButton 
                        title="Eliminar proyecto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash color="#d32f2f" />
                      </IconButton>
                    </>
                  )}
                  <IconButton 
                    title={project.isStarred ? "Quitar de favoritos" : "Añadir a favoritos"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(project._id);
                    }}
                  >
                    {project.isStarred ? <FaStar color="#FFD700" /> : <FaRegStar />}
                  </IconButton>
                </ProjectOptions>
              </ProjectHeader>
              
              <ProjectContent>
                <ProjectDescription>
                  {project.description || project.descripcion || 'Sin descripción'}
                </ProjectDescription>
                
                {/* Mostrar Esfuerzo y Prioridad */}
                <EffortPriorityContainer>
                  <EffortPriorityBox value={project.effort || 1}>
                    <BoxLabel>Esfuerzo</BoxLabel>
                    <BoxValue value={project.effort || 1}>{project.effort || 1}</BoxValue>
                  </EffortPriorityBox>
                  
                  <EffortPriorityBox value={project.priority || 1}>
                    <BoxLabel>Prioridad</BoxLabel>
                    <BoxValue value={project.priority || 1}>{project.priority || 1}</BoxValue>
                  </EffortPriorityBox>
                </EffortPriorityContainer>
                
                <ProjectMeta>
                  <MetaItem>
                    <MetaLabel>Inicio</MetaLabel>
                    <MetaValue>
                      {formatDate(
                        project.startDate || 
                        project.fechaInicio || 
                        project.createdAt || 
                        new Date().toISOString()
                      )}
                    </MetaValue>
                  </MetaItem>
                </ProjectMeta>
                
                <ProgressContainer>
                  <ProgressLabel>
                    <ProgressText>Progreso</ProgressText>
                    <ProgressValue>{parseInt(project.progress || project.progreso || 0)}%</ProgressValue>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill value={parseInt(project.progress || project.progreso || 0)} />
                  </ProgressBar>
                </ProgressContainer>
              </ProjectContent>
              
              <ProjectFooter>
                <MembersContainer>
                  <MembersLabel>Participantes</MembersLabel>
                  {(() => {
                    const members = project.members || project.miembros || [];
                    
                    console.log('Procesando miembros en ProjectCard:', {
                      projectId: project._id,
                      projectName: project.name,
                      totalMembers: members.length,
                      membersData: members,
                      hasPopulatedUsers: !!project._populated_users,
                      hasAllMembers: !!project._all_members,
                      populatedUsersSize: project._populated_users ? Object.keys(project._populated_users).length : 0,
                      allMembersSize: project._all_members ? project._all_members.length : 0
                    });
                    
                    if (members.length === 0) {
                      return <MembersList>Sin participantes</MembersList>;
                    }

                    // Obtener los datos de usuarios
                    const usersData = [];
                    
                    members.forEach((member, index) => {
                      console.log('Procesando miembro:', member);
                      
                      // Primero, intentar obtener el objeto de usuario
                      let userObject = null;
                      
                      // Caso 1: Si member.user es un objeto (usuario populado)
                      if (member.user && typeof member.user === 'object') {
                        userObject = member.user;
                        console.log('Encontrado user como objeto:', userObject);
                      }
                      // Caso 2: Si member.usuario es un objeto (otra variante populada)
                      else if (member.usuario && typeof member.usuario === 'object') {
                        userObject = member.usuario;
                        console.log('Encontrado usuario como objeto:', userObject);
                      }
                      // Caso 3: Si member es directamente el objeto de usuario
                      else if (member.firstName || member.lastName || member.email) {
                        userObject = member;
                        console.log('El miembro es directamente el usuario:', userObject);
                      }
                      // Caso 4: Buscar en el mapa de usuarios si tenemos solo un ID
                      else if (project._populated_users) {
                        const userId = typeof member === 'string' ? member : 
                                     (member.user || member.usuario || member._id);
                        
                        if (userId && project._populated_users[userId]) {
                          userObject = project._populated_users[userId];
                          console.log('Encontrado en _populated_users:', userObject);
                        }
                      }
                      // Caso 5: Buscar en todos los miembros
                      else if (project._all_members && Array.isArray(project._all_members)) {
                        const userId = typeof member === 'string' ? member : 
                                     (member.user || member.usuario || member._id);
                        
                        if (userId) {
                          const foundUser = project._all_members.find(u => 
                            u._id && u._id.toString() === userId.toString());
                          
                          if (foundUser) {
                            userObject = foundUser;
                            console.log('Encontrado en _all_members:', userObject);
                          }
                        }
                      }
                      
                      // Si no encontramos el usuario en ninguna parte, crear un objeto básico
                      if (!userObject) {
                        userObject = {
                          _id: typeof member === 'object' ? (member._id || `unknown-${index}`) : `unknown-${index}`,
                          firstName: '',
                          lastName: ''
                        };
                      }
                      
                      // Extraer el nombre del usuario del objeto
                      let fullName = '';
                      if (userObject.firstName && userObject.lastName) {
                        fullName = `${userObject.firstName} ${userObject.lastName}`.trim();
                      } else if (userObject.nombre) {
                        fullName = userObject.nombre;
                      } else if (userObject.name) {
                        fullName = userObject.name;
                      } else if (userObject.fullName) {
                        fullName = userObject.fullName;
                      } else if (userObject.email) {
                        // Usar el email como último recurso
                        fullName = userObject.email.split('@')[0];
                      }
                      
                      // Si todavía no tenemos nombre, usar un valor por defecto
                      if (!fullName) {
                        fullName = `Miembro ${index + 1}`;
                      }
                      
                      // Determinar el rol
                      const role = (member.role || member.rol || 'miembro').toLowerCase();
                      
                      usersData.push({
                        id: userObject._id || `member-${index}`,
                        name: fullName,
                        role: role
                      });
                    });

                    // Depurar la información final
                    console.log('Datos de usuarios procesados:', usersData);

                    return (
                      <>
                        <MembersNamesList>
                          {usersData.map((user, index) => (
                            <MemberItem key={user.id || index} title={`${user.name} (${user.role})`}>
                              <FaUser style={{ fontSize: '0.7rem', marginRight: '5px' }} /> {user.name}
                            </MemberItem>
                          ))}
                        </MembersNamesList>
                      </>
                    );
                  })()}
                </MembersContainer>
              </ProjectFooter>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      ) : (
        <EmptyState>
          <EmptyTitle>No se encontraron proyectos</EmptyTitle>
          <EmptyText>
            No hay proyectos que coincidan con los criterios de búsqueda actuales.
          </EmptyText>
          <StyledButton primary onClick={() => { setSearchTerm(''); setStatusFilter(''); setSortBy(''); }}>
            Limpiar filtros
          </StyledButton>
        </EmptyState>
      )}
      
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProjectToDelete(null);
            setPassword('');
            setDeleteError('');
          }}
          size="sm"
        >
          <Modal.Header onClose={() => {
            setShowDeleteModal(false);
            setProjectToDelete(null);
            setPassword('');
            setDeleteError('');
          }}>
            <span style={{ color: '#d32f2f', display: 'flex', alignItems: 'center' }}>
              <FaTrash style={{ marginRight: '8px' }} /> Eliminar Proyecto
            </span>
          </Modal.Header>
          
          <Modal.Body>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                backgroundColor: '#ffebee', 
                borderRadius: '50%', 
                width: '70px', 
                height: '70px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 15px auto'
              }}>
                <FaTrash size={30} color="#d32f2f" />
              </div>
              
              <h3 style={{ fontSize: '1.2rem', margin: '10px 0' }}>¿Estás seguro?</h3>
              <p style={{ margin: '0 0 15px 0' }}>
                Vas a eliminar el proyecto "<strong>{projectToDelete?.name || projectToDelete?.title || projectToDelete?.nombre}</strong>"
              </p>
              <p style={{ 
                backgroundColor: '#fff3cd', 
                color: '#856404', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '0.9rem',
                marginBottom: '20px'
              }}>
                Esta acción no se puede deshacer y eliminará todas las tareas asociadas al proyecto.
              </p>
            </div>
            
            {deleteError && (
              <div style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '10px', 
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                {deleteError}
              </div>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <StyledButton onClick={() => {
              setShowDeleteModal(false);
              setProjectToDelete(null);
              setPassword('');
              setDeleteError('');
            }}>
              Cancelar
            </StyledButton>
            <StyledButton 
              style={{ 
                backgroundColor: '#d32f2f', 
                borderColor: '#d32f2f'
              }}
              onClick={handleDeleteProject}
            >
              Eliminar Proyecto
            </StyledButton>
          </Modal.Footer>
        </Modal>
      )}
      
      {showEffortPriorityModal && (
        <Modal
          isOpen={showEffortPriorityModal}
          onClose={() => {
            setShowEffortPriorityModal(false);
            setProjectToEdit(null);
          }}
          size="sm"
        >
          <Modal.Header onClose={() => {
            setShowEffortPriorityModal(false);
            setProjectToEdit(null);
          }}>
            <span style={{ color: '#1a237e', display: 'flex', alignItems: 'center' }}>
              <FaEdit style={{ marginRight: '8px' }} /> Editar Esfuerzo y Prioridad
            </span>
          </Modal.Header>
          
          <Modal.Body>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '10px 0' }}>
                Proyecto: {projectToEdit?.name || projectToEdit?.title || projectToEdit?.nombre}
              </h3>
              
              <FormGroup>
                <Label>Esfuerzo (1 al 10)</Label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={effortValue}
                    onChange={(e) => setEffortValue(e.target.value)}
                  />
                  <div 
                    style={{ 
                      width: '30px',
                      height: '30px',
                      marginLeft: '10px',
                      borderRadius: '4px',
                      backgroundColor: 
                        effortValue <= 4 ? '#e8f5e9' : 
                        effortValue <= 7 ? '#fff8e1' : '#ffebee'
                    }}
                  />
                </div>
              </FormGroup>
              
              <FormGroup>
                <Label>Prioridad (1 al 10)</Label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={priorityValue}
                    onChange={(e) => setPriorityValue(e.target.value)}
                  />
                  <div 
                    style={{ 
                      width: '30px',
                      height: '30px',
                      marginLeft: '10px',
                      borderRadius: '4px',
                      backgroundColor: 
                        priorityValue <= 4 ? '#e8f5e9' : 
                        priorityValue <= 7 ? '#fff8e1' : '#ffebee'
                    }}
                  />
                </div>
              </FormGroup>
            </div>
          </Modal.Body>
          
          <Modal.Footer>
            <StyledButton onClick={() => {
              setShowEffortPriorityModal(false);
              setProjectToEdit(null);
            }}>
              Cancelar
            </StyledButton>
            <StyledButton 
              style={{ 
                backgroundColor: '#1a237e', 
                borderColor: '#1a237e',
                color: 'white'
              }}
              onClick={handleUpdateEffortPriority}
            >
              Guardar Cambios
            </StyledButton>
          </Modal.Footer>
        </Modal>
      )}
    </PageContainer>
  );
};

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const FormGroup = styled.div`
  margin: 1.5rem 0;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

export default ProjectsListPage;