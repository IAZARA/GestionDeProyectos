import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaEllipsisH } from 'react-icons/fa';
import KanbanTaskCard from './KanbanTaskCard';

const BoardContainer = styled.div`
  display: flex;
  overflow-x: auto;
  min-height: 70vh;
  padding: 1rem 0.5rem;
  
  &::-webkit-scrollbar {
    height: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #bbb;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  min-width: 320px;
  margin: 0 0.5rem;
  background-color: #f4f5f7;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  max-height: 75vh;
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e4e4e4;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
  display: flex;
  align-items: center;
`;

const TaskCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 8px;
  background-color: #e0e0e0;
  color: #616161;
  border-radius: 50%;
  font-size: 0.8rem;
`;

const ColumnActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ColumnButton = styled.button`
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const TasksContainer = styled.div`
  padding: 0.5rem;
  flex-grow: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const PlaceholderText = styled.div`
  color: #9e9e9e;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
`;

const AddTaskButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 2px dashed #e0e0e0;
  color: #757575;
  border-radius: 4px;
  margin-top: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #bbdefb;
    color: #1976d2;
  }
`;

const ColumnIndicator = styled.div`
  width: 32px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.status) {
      case 'Por_Hacer': return '#f44336'; // Rojo para el primero
      case 'En_Progreso': return '#ffeb3b'; // Amarillo para el segundo
      case 'En_Revision': return '#2196f3'; // Azul para el tercero
      case 'Completado': return '#4caf50'; // Verde para completado
      default: return '#bdbdbd';
    }
  }};
  margin-right: 8px;
`;

// Componente principal del tablero Kanban
const KanbanBoard = ({ tasks = [], projectId, onTaskMove, onTaskClick, onAddTask }) => {
  // Estados para manejar las tareas - asegurar que siempre sea un array
  const [localTasks, setLocalTasks] = useState(Array.isArray(tasks) ? tasks.filter(task => task.status !== 'Deleted') : []);
  
  // Actualizar tareas locales cuando cambian las props
  useEffect(() => {
    // Filtrar tareas marcadas como eliminadas
    setLocalTasks(Array.isArray(tasks) ? tasks.filter(task => 
      task.status !== 'Deleted' && 
      task.backendStatus !== 'Deleted'
    ) : []);
  }, [tasks]);
  
  // Columnas predefinidas para el tablero Kanban
  const columns = [
    { id: 'Por_Hacer', title: 'Por Hacer' },
    { id: 'En_Progreso', title: 'En Progreso' },
    { id: 'En_Revision', title: 'En Revisión' },
    { id: 'Completado', title: 'Completado' }
  ];
  
  // Agrupar tareas por estado
  const getTasksByStatus = (status) => {
    // Asegurar que localTasks sea un array
    if (!Array.isArray(localTasks)) {
      return [];
    }
    
    // Mapeo completo de estados para cubrir todos los casos posibles
    const statusMapFromBackend = {
      // Estados en español del backend (minúsculas)
      'pendiente': 'Por_Hacer',
      'en_progreso': 'En_Progreso',
      'en_revision': 'En_Revision',
      'completado': 'Completado',
      'eliminado': 'Deleted',
      // Estados en inglés del backend
      'To_Do': 'Por_Hacer',
      'In_Progress': 'En_Progreso',
      'In_Review': 'En_Revision',
      'Completed': 'Completado',
      'Deleted': 'Deleted',
      // Estados en español del frontend (para asegurar consistencia)
      'Por_Hacer': 'Por_Hacer',
      'En_Progreso': 'En_Progreso',
      'En_Revision': 'En_Revision',
      'Completado': 'Completado',
      'Deleted': 'Deleted'
    };
    
    console.log('Filtrando tareas para estado:', status);
    console.log('Tareas disponibles:', localTasks);
    
    return localTasks.filter(task => {
      // Normalizar el estado de la tarea para comparación
      const taskStatus = task.status || '';
      
      // Si la tarea ya tiene un estado en el formato del Kanban, usarlo directamente
      if (taskStatus === status) {
        return true;
      }
      
      // Si no, intentar mapear el estado del backend al formato del Kanban
      const mappedStatus = statusMapFromBackend[taskStatus];
      
      // Intentar con versión en minúsculas si no se encuentra un mapeo directo
      const mappedStatusLowerCase = mappedStatus || statusMapFromBackend[taskStatus.toLowerCase()];
      
      console.log(`Tarea ${task.title || task.titulo}: estado=${taskStatus}, mapeado=${mappedStatusLowerCase || 'no mapeado'}`);
      
      // Verificar si el estado mapeado coincide con el estado deseado
      return mappedStatusLowerCase === status;
    });
  };
  
  // Manejar fin del arrastre
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // Verificar si la tarea se soltó en una posición válida
    if (!destination) return;
    
    // Verificar si la tarea se movió realmente a una posición diferente
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Encontrar la tarea que se está moviendo
    const taskToMove = localTasks.find(task => task._id === draggableId);
    if (!taskToMove) return;
    
    // Guardar el estado anterior para pasarlo al callback
    const sourceStatus = taskToMove.status;
    
    // Actualizar el estado local primero para una UI más responsiva
    const updatedTasks = localTasks.map(task => {
      if (task._id === draggableId) {
        return { ...task, status: destination.droppableId };
      }
      return task;
    });
    
    setLocalTasks(updatedTasks);
    
    // Llamar a la función para actualizar el estado de la tarea en el servidor
    if (onTaskMove) {
      onTaskMove(draggableId, sourceStatus, destination.droppableId);
    } else {
      // Si no se proporciona onTaskMove, usar la API directamente
      import('../../services/task.service').then(({ updateTaskStatus }) => {
        updateTaskStatus(draggableId, destination.droppableId);
      });
    }
  };
  
  // Manejar clic en una tarea
  const handleTaskClick = (taskId) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      console.log('Clic en tarea:', taskId);
      // Podríamos mostrar un modal con detalles de la tarea aquí
    }
  };
  
  // Manejar añadir nueva tarea
  const handleAddTask = (status) => {
    if (onAddTask) {
      onAddTask(status);
    } else {
      console.log('Añadir tarea en estado:', status);
      // Podríamos mostrar un modal para crear tarea aquí
    }
  };
  
  // Renderizar el tablero Kanban
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <BoardContainer>
        {columns.map(column => (
          <Column key={column.id}>
            <ColumnHeader>
              <ColumnTitle>
                <ColumnIndicator status={column.id} />
                {column.title}
                <TaskCount>{getTasksByStatus(column.id).length}</TaskCount>
              </ColumnTitle>
              <ColumnActions>
                <ColumnButton title="Más opciones">
                  <FaEllipsisH />
                </ColumnButton>
              </ColumnActions>
            </ColumnHeader>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <TasksContainer
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {getTasksByStatus(column.id).length > 0 ? (
                    getTasksByStatus(column.id).map((task, index) => (
                      <Draggable 
                        key={task._id} 
                        draggableId={task._id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <KanbanTaskCard
                            task={task}
                            provided={provided}
                            snapshot={snapshot}
                            onClick={() => handleTaskClick(task._id)}
                          />
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <PlaceholderText>
                      No hay tareas en esta columna
                    </PlaceholderText>
                  )}
                  {provided.placeholder}
                  
                  {column.id !== 'Completado' && (
                    <AddTaskButton 
                      onClick={() => handleAddTask(column.id)}
                      title="Agregar nueva tarea"
                    >
                      <FaPlus size={12} />
                      Agregar tarea
                    </AddTaskButton>
                  )}
                </TasksContainer>
              )}
            </Droppable>
          </Column>
        ))}
      </BoardContainer>
    </DragDropContext>
  );
};

export default KanbanBoard;