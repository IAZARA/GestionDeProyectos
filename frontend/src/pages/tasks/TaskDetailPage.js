import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getTaskById, updateTaskStatus, assignTask, addComment } from '../../services/task.service';
import { getUsers } from '../../services/user.service';
import { getTaskFiles, downloadFile } from '../../services/file.service';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import FormControl from '../../components/common/FormControl';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const TaskDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const TaskInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const TaskDescription = styled.div`
  margin: 1rem 0;
  line-height: 1.6;
  color: #4B5563;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4B5563;
  background-color: #F3F4F6;
  border-radius: 0.25rem;
`;

const Dates = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  color: #4B5563;
`;

const DateItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #6B7280;
  }
  
  span {
    font-weight: 500;
  }
`;

const StatusActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 1.5rem 0 1rem;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 1rem;
`;

const CommentAvatar = styled.div`
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #F9FAFB;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.div`
  font-weight: 500;
  color: #111827;
`;

const CommentTime = styled.div`
  font-size: 0.75rem;
  color: #6B7280;
`;

const CommentText = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  color: #4B5563;
`;

const CommentForm = styled.form`
  margin-top: 1rem;
`;

const AttachmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  background-color: #F9FAFB;
`;

const AttachmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AttachmentName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const AttachmentSize = styled.div`
  font-size: 0.75rem;
  color: #6B7280;
`;

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedUser, setAssignedUser] = useState('');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const [taskData, filesData, usersData] = await Promise.all([
          getTaskById(taskId),
          getTaskFiles(taskId),
          getUsers()
        ]);
        
        setTask(taskData);
        setFiles(filesData);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar la tarea:', err);
        setError('No se pudo cargar la información de la tarea. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId]);

  const handleEditTask = () => {
    navigate(`/tasks/${taskId}/edit`);
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    try {
      await updateTaskStatus(taskId, newStatus);
      setTask(prev => ({ ...prev, estado: newStatus }));
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error('Error al cambiar el estado:', err);
      setError('No se pudo cambiar el estado de la tarea. Por favor, inténtelo de nuevo.');
    }
  };

  const handleAssignTask = async () => {
    if (!assignedUser) return;
    
    try {
      await assignTask(taskId, assignedUser);
      
      // Encontrar el usuario para actualizar la interfaz
      const userObj = users.find(user => user._id === assignedUser);
      setTask(prev => ({ ...prev, asignadoA: userObj }));
      
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error('Error al asignar la tarea:', err);
      setError('No se pudo asignar la tarea. Por favor, inténtelo de nuevo.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      const newComment = await addComment(taskId, comment);
      setTask(prev => ({ 
        ...prev, 
        comentarios: [...(prev.comentarios || []), newComment]
      }));
      setComment('');
    } catch (err) {
      console.error('Error al añadir comentario:', err);
      setError('No se pudo añadir el comentario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDownloadFile = async (fileId) => {
    try {
      const fileBlob = await downloadFile(fileId);
      
      // Encontrar el archivo para obtener su nombre
      const file = files.find(f => f._id === fileId);
      if (!file) return;
      
      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.nombre);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar el archivo:', err);
      setError('No se pudo descargar el archivo. Por favor, inténtelo de nuevo.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completado':
        return 'success';
      case 'en_progreso':
        return 'info';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'danger';
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
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
      default:
        return priority;
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
        <Button onClick={() => navigate('/tasks')}>Volver a Tareas</Button>
      </div>
    );
  }

  if (!task) {
    return (
      <div>
        <h2>Tarea no encontrada</h2>
        <Button onClick={() => navigate('/tasks')}>Volver a Tareas</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader>
        <PageTitle>{task.titulo}</PageTitle>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            onClick={handleEditTask}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97228 16.8756 4.21807C16.9762 4.46386 17.0268 4.72722 17.0245 4.99278C17.0222 5.25835 16.967 5.52078 16.8622 5.76479C16.7574 6.0088 16.605 6.22949 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" fill="currentColor"/>
              </svg>
            }
          >
            Editar
          </Button>
        </div>
      </PageHeader>

      <TaskDetailGrid>
        <div>
          <TaskInfo>
            <Badge variant={getStatusBadgeVariant(task.estado)}>
              {getStatusLabel(task.estado)}
            </Badge>
            
            <TaskDescription>
              {task.descripcion}
            </TaskDescription>
            
            {task.etiquetas && task.etiquetas.length > 0 && (
              <TagsContainer>
                {task.etiquetas.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagsContainer>
            )}
            
            <Dates>
              <DateItem>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 2C5.44772 2 5 2.44772 5 3V4H4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V6C18 4.89543 17.1046 4 16 4H15V3C15 2.44772 14.5523 2 14 2C13.4477 2 13 2.44772 13 3V4H7V3C7 2.44772 6.55228 2 6 2ZM16 6H4V16H16V6Z" fill="currentColor"/>
                </svg>
                <span>Creada:</span> {new Date(task.createdAt).toLocaleDateString()}
              </DateItem>
              
              {task.fechaLimite && (
                <DateItem>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM11 6C11 5.44772 10.5523 5 10 5C9.44771 5 9 5.44772 9 6V10C9 10.2652 9.10536 10.5196 9.29289 10.7071L12.1213 13.5355C12.5118 13.9261 13.145 13.9261 13.5355 13.5355C13.9261 13.145 13.9261 12.5118 13.5355 12.1213L11 9.58579V6Z" fill="currentColor"/>
                  </svg>
                  <span>Fecha límite:</span> {new Date(task.fechaLimite).toLocaleDateString()}
                </DateItem>
              )}
            </Dates>
            
            <StatusActions>
              <Button 
                onClick={() => {
                  setNewStatus(task.estado);
                  setIsStatusModalOpen(true);
                }}
              >
                Cambiar Estado
              </Button>
              
              <Button 
                onClick={() => {
                  setAssignedUser(task.asignadoA?._id || '');
                  setIsAssignModalOpen(true);
                }}
                variant="outline"
              >
                {task.asignadoA ? 'Reasignar' : 'Asignar'}
              </Button>
            </StatusActions>
          </TaskInfo>
          
          <SectionTitle>Comentarios</SectionTitle>
          <Card>
            <Card.Body>
              <CommentsList>
                {task.comentarios && task.comentarios.length > 0 ? (
                  task.comentarios.map((comment, index) => (
                    <CommentItem key={index}>
                      <CommentAvatar>
                        <Avatar 
                          name={comment.autor.nombre} 
                          src={comment.autor.avatar}
                        />
                      </CommentAvatar>
                      <CommentContent>
                        <CommentHeader>
                          <CommentAuthor>{comment.autor.nombre}</CommentAuthor>
                          <CommentTime>{new Date(comment.fecha).toLocaleString()}</CommentTime>
                        </CommentHeader>
                        <CommentText>{comment.contenido}</CommentText>
                      </CommentContent>
                    </CommentItem>
                  ))
                ) : (
                  <p>No hay comentarios en esta tarea.</p>
                )}
              </CommentsList>
              
              <CommentForm onSubmit={handleAddComment}>
                <FormControl.Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <Button type="submit" disabled={!comment.trim()}>
                    Comentar
                  </Button>
                </div>
              </CommentForm>
            </Card.Body>
          </Card>
        </div>
        
        <div>
          <Card>
            <Card.Header>
              <h3>Detalles</h3>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong>Proyecto:</strong> {
                    task.proyecto ? (
                      <Link to={`/projects/${task.proyecto._id}`}>
                        {task.proyecto.nombre}
                      </Link>
                    ) : 'Sin proyecto'
                  }
                </div>
                <div>
                  <strong>Prioridad:</strong> {getPriorityLabel(task.prioridad)}
                </div>
                <div>
                  <strong>Asignado a:</strong> {
                    task.asignadoA ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                        <Avatar 
                          name={task.asignadoA.nombre} 
                          src={task.asignadoA.avatar} 
                          size="sm" 
                        />
                        <span>{task.asignadoA.nombre}</span>
                      </div>
                    ) : 'Sin asignar'
                  }
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="mt-4">
            <Card.Header>
              <h3>Archivos Adjuntos</h3>
            </Card.Header>
            <Card.Body>
              {files && files.length > 0 ? (
                <AttachmentsList>
                  {files.map((file, index) => (
                    <AttachmentItem key={index}>
                      <AttachmentInfo>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3C6.44772 3 6 3.44772 6 4V16C6 16.5523 6.44772 17 7 17H13C13.5523 17 14 16.5523 14 16V7.41421C14 7.149 13.8946 6.89464 13.7071 6.70711L10.2929 3.29289C10.1054 3.10536 9.851 3 9.58579 3H7Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <AttachmentName>{file.nombre}</AttachmentName>
                          <AttachmentSize>
                            {(file.tamano / 1024).toFixed(2)} KB
                          </AttachmentSize>
                        </div>
                      </AttachmentInfo>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadFile(file._id)}
                      >
                        Descargar
                      </Button>
                    </AttachmentItem>
                  ))}
                </AttachmentsList>
              ) : (
                <p>No hay archivos adjuntos.</p>
              )}
            </Card.Body>
          </Card>
        </div>
      </TaskDetailGrid>

      {/* Modal para cambiar estado */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)}
        size="sm"
      >
        <Modal.Header onClose={() => setIsStatusModalOpen(false)}>
          Cambiar Estado
        </Modal.Header>
        <Modal.Body>
          <FormControl.Select
            id="newStatus"
            label="Estado"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </FormControl.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleStatusChange}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para asignar tarea */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        size="sm"
      >
        <Modal.Header onClose={() => setIsAssignModalOpen(false)}>
          {task.asignadoA ? 'Reasignar Tarea' : 'Asignar Tarea'}
        </Modal.Header>
        <Modal.Body>
          <FormControl.Select
            id="assignedUser"
            label="Usuario"
            value={assignedUser}
            onChange={(e) => setAssignedUser(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.nombre}
              </option>
            ))}
          </FormControl.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAssignTask}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskDetailPage;
