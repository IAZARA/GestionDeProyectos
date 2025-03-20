import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaRegCommentAlt, FaPaperclip } from 'react-icons/fa';

const Card = styled.div`
  background-color: white;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 4px;
  box-shadow: ${props => props.$isDragging 
    ? '0 5px 10px rgba(0, 0, 0, 0.15)'
    : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  transition: box-shadow 0.2s, transform 0.1s;
  user-select: none;
  position: relative;
  border-left: 4px solid ${props => {
    switch (props.$priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  }};
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardDescription = styled.p`
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #757575;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9e9e9e;
  margin-top: 0.75rem;
`;

const MetaGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PriorityBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.$priority) {
      case 'high': return '#ffebee';
      case 'medium': return '#fff3e0';
      case 'low': return '#e8f5e9';
      default: return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.$priority) {
      case 'high': return '#c62828';
      case 'medium': return '#ef6c00';
      case 'low': return '#2e7d32';
      default: return '#0d47a1';
    }
  }};
  margin-right: 0.5rem;
`;

const AssigneeAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #616161;
  font-size: 0.7rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Función para obtener las iniciales de un nombre
const getInitials = (name) => {
  if (!name) return '';
  
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};

// Función para formatear fechas relativas
const formatDueDate = (dateString) => {
  const dueDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Compara solo la fecha (sin hora)
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  if (isSameDay(dueDate, today)) {
    return 'Hoy';
  } else if (isSameDay(dueDate, tomorrow)) {
    return 'Mañana';
  } else {
    // Formato corto DD/MM
    return `${dueDate.getDate()}/${dueDate.getMonth() + 1}`;
  }
};

// Traducción de prioridades
const translatePriority = (priority) => {
  const translations = {
    'high': 'Alta',
    'medium': 'Media',
    'low': 'Baja'
  };
  
  return translations[priority] || priority;
};

const KanbanTaskCard = ({ task, provided, snapshot, onClick }) => {
  // Normalizar los datos de la tarea para manejar diferentes formatos
  const normalizedTask = {
    title: task.title || task.nombre || 'Sin título',
    description: task.description || task.descripcion || '',
    priority: task.priority || task.prioridad || 'medium',
    dueDate: task.dueDate || task.fechaVencimiento || null,
    assignedTo: task.assignedTo || task.asignadoA || null,
    comments: task.comments || task.comentarios || [],
    attachments: task.attachments || task.adjuntos || []
  };
  
  // Normalizar la prioridad para el estilo
  let normalizedPriority = normalizedTask.priority;
  if (typeof normalizedPriority === 'string') {
    normalizedPriority = normalizedPriority.toLowerCase();
    // Mapear prioridades en español a inglés si es necesario
    if (normalizedPriority === 'alta') normalizedPriority = 'high';
    if (normalizedPriority === 'media') normalizedPriority = 'medium';
    if (normalizedPriority === 'baja') normalizedPriority = 'low';
  }
  
  // Normalizar los datos del usuario asignado
  const assignedUser = normalizedTask.assignedTo || {};
  const userName = assignedUser.nombre || assignedUser.name || '';
  const userAvatar = assignedUser.avatar || assignedUser.profilePic || null;
  
  return (
    <Card 
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      $isDragging={snapshot.isDragging}
      $priority={normalizedPriority}
      onClick={onClick}
    >
      <PriorityBadge $priority={normalizedPriority}>
        {translatePriority(normalizedPriority)}
      </PriorityBadge>
      
      <CardTitle>{normalizedTask.title}</CardTitle>
      
      {normalizedTask.description && (
        <CardDescription>{normalizedTask.description}</CardDescription>
      )}
      
      <CardMeta>
        <MetaGroup>
          {userName && (
            <MetaItem>
              <AssigneeAvatar>
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName} 
                  />
                ) : (
                  getInitials(userName)
                )}
              </AssigneeAvatar>
            </MetaItem>
          )}
          
          {normalizedTask.dueDate && (
            <MetaItem title={new Date(normalizedTask.dueDate).toLocaleDateString('es-ES')}>
              <FaCalendarAlt />
              {formatDueDate(normalizedTask.dueDate)}
            </MetaItem>
          )}
        </MetaGroup>
        
        <MetaGroup>
          {normalizedTask.comments?.length > 0 && (
            <MetaItem title={`${normalizedTask.comments.length} comentarios`}>
              <FaRegCommentAlt />
              {normalizedTask.comments.length}
            </MetaItem>
          )}
          
          {normalizedTask.attachments?.length > 0 && (
            <MetaItem title={`${normalizedTask.attachments.length} archivos adjuntos`}>
              <FaPaperclip />
              {normalizedTask.attachments.length}
            </MetaItem>
          )}
        </MetaGroup>
      </CardMeta>
    </Card>
  );
};

export default KanbanTaskCard;