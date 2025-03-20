import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { getMyTasks } from '../../services/task.service';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FiltersContainer = styled.div`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterTitle = styled.h5`
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0;
  color: #333;
`;

const TaskStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => 
    props.status === 'Completed' || props.status === 'Completado' ? '#e8f5e9' :
    props.status === 'In_Progress' || props.status === 'En_Progreso' ? '#e3f2fd' :
    props.status === 'In_Review' || props.status === 'En_Revision' ? '#fff8e1' : '#f5f5f5'
  };
  color: ${props => 
    props.status === 'Completed' || props.status === 'Completado' ? '#388e3c' :
    props.status === 'In_Progress' || props.status === 'En_Progreso' ? '#1976d2' :
    props.status === 'In_Review' || props.status === 'En_Revision' ? '#ff8f00' : '#616161'
  };
`;

const TaskInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const TaskInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #616161;
`;

const TaskDescription = styled.p`
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.9rem;
`;

const ProjectBadge = styled.span`
  background-color: #e8eaf6;
  color: #3f51b5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.priority?.toLowerCase()) {
      case 'alta':
      case 'high':
        return '#fef2f2';
      case 'urgente':
      case 'urgent':
        return '#fed7d7';
      case 'media':
      case 'medium':
        return '#fffbeb';
      case 'baja':
      case 'low':
        return '#f0fdfa';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.priority?.toLowerCase()) {
      case 'alta':
      case 'high':
        return '#b91c1c';
      case 'urgente':
      case 'urgent':
        return '#9b2c2c';
      case 'media':
      case 'medium':
        return '#92400e';
      case 'baja':
      case 'low':
        return '#065f46';
      default:
        return '#4b5563';
    }
  }};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
    background-color: ${props => {
      switch (props.priority?.toLowerCase()) {
        case 'alta':
        case 'high':
          return '#ef4444';
        case 'urgente':
        case 'urgent':
          return '#b91c1c';
        case 'media':
        case 'medium':
          return '#f59e0b';
        case 'baja':
        case 'low':
          return '#10b981';
        default:
          return '#9ca3af';
      }
    }};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6b7280;

  svg {
    margin-bottom: 1rem;
    color: #9ca3af;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #4b5563;
  }

  p {
    margin-bottom: 1.5rem;
  }
`;

const TaskCounter = styled.span`
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const taskData = await getMyTasks();
        console.log('Tareas obtenidas:', taskData);
        
        // Filtrar tareas marcadas como eliminadas
        const filteredTasks = (taskData || []).filter(task => 
          task.status !== 'Deleted' && 
          task.backendStatus !== 'Deleted'
        );
        
        setTasks(filteredTasks);
        setFilteredTasks(filteredTasks);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar tareas:', err);
        setError('Error al cargar las tareas');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    let result = [...tasks];
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      // Mapear la entrada del filtro a los posibles estados en las tareas (inglés/español)
      const statusMappings = {
        'to_do': ['To_Do', 'Por_Hacer'],
        'in_progress': ['In_Progress', 'En_Progreso'],
        'in_review': ['In_Review', 'En_Revision'],
        'completed': ['Completed', 'Completado']
      };
      
      const validStatusValues = statusMappings[statusFilter] || [statusFilter];
      result = result.filter(task => validStatusValues.includes(task.status));
    }
    
    // Filtrar por prioridad
    if (priorityFilter !== 'all') {
      // Mapear la entrada del filtro a los posibles valores de prioridad (inglés/español)
      const priorityMappings = {
        'low': ['Low', 'baja'],
        'medium': ['Medium', 'media'],
        'high': ['High', 'alta'],
        'urgent': ['Urgent', 'urgente']
      };
      
      const validPriorityValues = priorityMappings[priorityFilter] || [priorityFilter];
      result = result.filter(task => {
        const taskPriority = task.priority || task.prioridad || '';
        return validPriorityValues.includes(taskPriority);
      });
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(task => 
        (task.title || task.titulo || '').toLowerCase().includes(term) ||
        (task.description || task.descripcion || '').toLowerCase().includes(term) ||
        (task.project?.name || '').toLowerCase().includes(term)
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Mapear el estado a español para mostrar
  const mapStatus = (status) => {
    const statusMap = {
      'To_Do': 'Por hacer',
      'In_Progress': 'En progreso',
      'In_Review': 'En revisión',
      'Completed': 'Completado'
    };
    return statusMap[status] || status;
  };

  // Mapear prioridad para mostrar
  const mapPriority = (priority) => {
    const priorityMap = {
      'Low': 'Baja',
      'Medium': 'Media',
      'High': 'Alta',
      'Urgent': 'Urgente',
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return priorityMap[priority] || priority || 'Normal';
  };

  // Función para restablecer todos los filtros
  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size="lg" />
        <p>Cargando tus tareas...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>Error al cargar tareas</h3>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <div>
          <PageTitle>Mis Tareas</PageTitle>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <TaskCounter>{filteredTasks.length} tareas</TaskCounter>
            {(statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm !== '') && (
              <Button variant="text" size="sm" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
        <Button 
          variant={showFilters ? "primary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          }
        >
          Filtros
        </Button>
      </PageHeader>
      
      {showFilters && (
        <FiltersContainer>
          <FilterTitle>Filtrar tareas</FilterTitle>
          <Row>
            <Col xs={12} md={4}>
              <FilterGroup>
                <Form.Group controlId="searchTerm">
                  <Form.Label>Buscar</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Buscar por título o descripción" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </FilterGroup>
            </Col>
            <Col xs={12} md={4}>
              <FilterGroup>
                <Form.Group controlId="statusFilter">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="to_do">Por hacer</option>
                    <option value="in_progress">En progreso</option>
                    <option value="in_review">En revisión</option>
                    <option value="completed">Completado</option>
                  </Form.Select>
                </Form.Group>
              </FilterGroup>
            </Col>
            <Col xs={12} md={4}>
              <FilterGroup>
                <Form.Group controlId="priorityFilter">
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </Form.Select>
                </Form.Group>
              </FilterGroup>
            </Col>
          </Row>
        </FiltersContainer>
      )}
      
      {filteredTasks.length === 0 ? (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="9" y1="10" x2="15" y2="10"></line>
          </svg>
          <h3>No hay tareas que mostrar</h3>
          <p>
            {tasks.length === 0 
              ? 'No tienes tareas asignadas actualmente.' 
              : 'No hay tareas que coincidan con los filtros aplicados.'}
          </p>
          {tasks.length > 0 && (
            <Button onClick={resetFilters}>Limpiar filtros</Button>
          )}
        </EmptyState>
      ) : (
        <TasksList>
          {filteredTasks.map(task => (
            <TaskCard key={task._id || Math.random()}>
              <TaskHeader>
                <TaskTitle>{task.title || task.titulo}</TaskTitle>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <PriorityBadge priority={task.priority || task.prioridad}>
                    {mapPriority(task.priority || task.prioridad)}
                  </PriorityBadge>
                  <TaskStatus status={task.status}>{mapStatus(task.status)}</TaskStatus>
                </div>
              </TaskHeader>
              
              <TaskDescription>
                {task.description || task.descripcion || 'Sin descripción'}
              </TaskDescription>
              
              {task.project && task.project.name && (
                <ProjectBadge>Proyecto: {task.project.name}</ProjectBadge>
              )}
              
              <TaskInfo>
                <TaskInfoItem>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Fecha límite: {formatDate(task.dueDate || task.fechaLimite)}</span>
                </TaskInfoItem>
                
                {task.createdBy && (
                  <TaskInfoItem>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Creada por: {
                      task.createdBy.firstName ? 
                      `${task.createdBy.firstName} ${task.createdBy.lastName || ''}` : 
                      task.createdBy.nombre || 'Usuario'
                    }</span>
                  </TaskInfoItem>
                )}
              </TaskInfo>
            </TaskCard>
          ))}
        </TasksList>
      )}
    </Container>
  );
};

export default TasksPage;
