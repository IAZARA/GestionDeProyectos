import React from 'react';
import styled from 'styled-components';
import Badge from '../common/Badge';

const TaskListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
`;

const TaskDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'Completado':
      return 'success';
    case 'En_Progreso':
      return 'info';
    case 'En_Revision':
      return 'warning';
    case 'Por_Hacer':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'Completado':
      return 'Completado';
    case 'En_Progreso':
      return 'En Progreso';
    case 'En_Revision':
      return 'En Revisión';
    case 'Por_Hacer':
      return 'Por Hacer';
    default:
      return status;
  }
};

const TaskList = ({ tasks, onTaskClick }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        No hay tareas disponibles
      </div>
    );
  }

  return (
    <TaskListContainer>
      {tasks.map((task) => (
        <TaskItem 
          key={task._id} 
          onClick={() => onTaskClick(task._id)}
          style={{ cursor: 'pointer' }}
        >
          <TaskInfo>
            <TaskTitle>{task.titulo}</TaskTitle>
            {task.descripcion && (
              <TaskDescription>{task.descripcion}</TaskDescription>
            )}
            <TaskMeta>
              <span>Proyecto: {task.proyecto?.nombre || 'Sin proyecto'}</span>
              {task.fechaFin && (
                <span>Fecha límite: {new Date(task.fechaFin).toLocaleDateString()}</span>
              )}
            </TaskMeta>
          </TaskInfo>
          <Badge variant={getStatusBadgeVariant(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
        </TaskItem>
      ))}
    </TaskListContainer>
  );
};

export default TaskList; 