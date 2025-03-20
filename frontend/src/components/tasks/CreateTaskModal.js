import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormControl from '../common/FormControl';
import Spinner from '../common/Spinner';
import { createTask } from '../../services/task.service';
import { getUsers } from '../../services/user.service';
import { getProjectMembers } from '../../services/project.service';

const ModalContent = styled.div`
  min-width: 500px;
  padding: 20px 0;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 10px;
`;

const CreateTaskModal = ({ open, onClose, projectId, initialStatus, onCreateSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    status: initialStatus || 'Por_Hacer',
    prioridad: 'media',
    asignadoA: '',
    fechaLimite: ''
  });
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Establecer el estado inicial basado en la columna donde se hizo clic
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7); // Por defecto, una semana desde hoy
      
      setFormData(prev => ({
        ...prev,
        status: initialStatus || 'Por_Hacer',
        fechaLimite: defaultDueDate.toISOString().split('T')[0]
      }));
      
      // Cargar usuarios para asignar la tarea
      const loadUsers = async () => {
        try {
          setLoading(true);
          
          // Intentar obtener miembros del proyecto actual
          if (projectId) {
            try {
              const projectMembers = await getProjectMembers(projectId);
              if (projectMembers && projectMembers.members && projectMembers.members.length > 0) {
                // Extraer los usuarios de los miembros del proyecto
                const usersData = projectMembers.members.map(member => member.user).filter(Boolean);
                
                if (usersData.length > 0) {
                  console.log('Usuarios obtenidos del proyecto:', usersData);
                  setUsers(usersData);
                  setLoading(false);
                  return;
                }
              }
            } catch (projectError) {
              console.error('Error al cargar miembros del proyecto:', projectError);
            }
          }
          
          // Si fallamos obteniendo miembros del proyecto, intentar obtener todos los usuarios
          try {
            const usersData = await getUsers();
            console.log('Usuarios obtenidos de getUsers:', usersData);
            setUsers(usersData || []);
          } catch (userError) {
            console.error('Error al cargar usuarios:', userError);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error en loadUsers:', err);
          setLoading(false);
        }
      };
      
      loadUsers();
    }
  }, [open, initialStatus, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError('');
  };

  const handleCreate = async () => {
    if (!formData.titulo.trim()) {
      setError('Por favor, ingresa un título para la tarea.');
      return;
    }

    if (!projectId) {
      setError('Error: ID del proyecto no válido');
      return;
    }

    try {
      setCreating(true);
      setError('');

      // Asegurar que todos los campos requeridos estén presentes y formateados
      const taskData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion?.trim() || '',
        status: formData.status || initialStatus || 'Por_Hacer',
        prioridad: formData.prioridad || 'media',
        asignadoA: formData.asignadoA || null,
        fechaLimite: formData.fechaLimite || new Date().toISOString().split('T')[0]
      };

      console.log('Datos de la tarea a crear:', taskData);
      const result = await createTask(projectId, taskData);
      
      if (!result) {
        throw new Error('No se recibió respuesta del servidor');
      }

      setCreating(false);
      if (onCreateSuccess) {
        onCreateSuccess(result);
      }
      handleClose();
    } catch (err) {
      console.error('Error al crear tarea:', err);
      const errorMessage = err.message || 'Error al crear la tarea. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
      setCreating(false);
    }
  };

  const handleClose = () => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);

    setFormData({
      titulo: '',
      descripcion: '',
      status: initialStatus || 'Por_Hacer',
      prioridad: 'media',
      asignadoA: '',
      fechaLimite: defaultDueDate.toISOString().split('T')[0]
    });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} size="md">
      <Modal.Header onClose={handleClose}>
        Crear nueva tarea
      </Modal.Header>
      <Modal.Body>
        <ModalContent>
          <FormControl.Input
            id="task-title"
            name="titulo"
            label="Título de la tarea"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Implementar funcionalidad de login"
          />
          
          <FormControl.Textarea
            id="task-description"
            name="descripcion"
            label="Descripción"
            rows={3}
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe la tarea detalladamente"
          />
          
          <FormControl.Select
            id="task-priority"
            name="prioridad"
            label="Prioridad"
            value={formData.prioridad}
            onChange={handleChange}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </FormControl.Select>
          
          <FormControl.Select
            id="task-assignee"
            name="asignadoA"
            label="Asignar a"
            value={formData.asignadoA}
            onChange={handleChange}
          >
            <option value="">Sin asignar</option>
            {users && users.length > 0 ? (
              users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.nombre || user.email || 'Usuario sin nombre')}
                </option>
              ))
            ) : (
              <option value="" disabled>Cargando usuarios...</option>
            )}
          </FormControl.Select>
          
          <FormControl.Input
            id="task-due-date"
            name="fechaLimite"
            label="Fecha límite (opcional)"
            type="date"
            value={formData.fechaLimite}
            onChange={handleChange}
          />
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ModalContent>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          variant="primary"
          onClick={handleCreate} 
          disabled={creating || loading}
        >
          {creating ? <Spinner size="sm" /> : 'Crear tarea'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTaskModal;
