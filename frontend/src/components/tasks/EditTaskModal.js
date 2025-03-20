import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormControl from '../common/FormControl';
import Spinner from '../common/Spinner';
import { updateTask, markTaskAsDeleted } from '../../services/task.service';
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

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  margin-top: 20px;
`;

const EditTaskModal = ({ open, onClose, task, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    status: 'Por_Hacer',
    prioridad: 'media',
    asignadoA: '',
    fechaLimite: ''
  });
  const [users, setUsers] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && task) {
      console.log('Tarea abierta para edición:', task);
      console.log('Asignados a la tarea:', task.assignedTo);
      
      // Mapear los estados del backend al frontend
      const statusMapFromBackend = {
        'To_Do': 'Por_Hacer',
        'In_Progress': 'En_Progreso',
        'In_Review': 'En_Revision',
        'Completed': 'Completado',
        'Deleted': 'Deleted'
      };

      // Mapear las prioridades del backend al frontend
      const priorityMapFromBackend = {
        'Low': 'baja',
        'Medium': 'media',
        'High': 'alta',
        'Urgent': 'urgente'
      };
      
      // Determinar el valor de asignadoA
      let assignedValue = '';
      if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
        // Si assignedTo es un array y tiene elementos, tomamos el primero
        assignedValue = typeof task.assignedTo[0] === 'object' ? task.assignedTo[0]._id : task.assignedTo[0];
      } else if (task.assignedTo && !Array.isArray(task.assignedTo)) {
        // Si assignedTo no es un array, usamos el valor directamente
        assignedValue = task.assignedTo;
      } else if (task.asignadoA) {
        // Si no hay assignedTo pero hay asignadoA, usamos ese valor
        assignedValue = task.asignadoA;
      }
      
      console.log('Valor asignado determinado:', assignedValue);
      
      // Cargar los datos de la tarea en el formulario
      setFormData({
        titulo: task.titulo || task.title || '',
        descripcion: task.descripcion || task.description || '',
        status: statusMapFromBackend[task.status] || task.status || 'Por_Hacer',
        prioridad: priorityMapFromBackend[task.priority] || task.prioridad || 'media',
        asignadoA: assignedValue,
        fechaLimite: task.dueDate ? task.dueDate.split('T')[0] : 
                    task.fechaLimite ? task.fechaLimite.split('T')[0] : ''
      });
      
      // Cargar usuarios para asignar la tarea
      const loadUsers = async () => {
        try {
          console.log('[EditTaskModal] Cargando usuarios...');
          setError('');
          
          // Obtener el proyecto actual del localStorage
          const currentProject = localStorage.getItem('currentProject');
          const projectId = currentProject ? JSON.parse(currentProject).id : null;
          
          let usersData = [];
          
          if (projectId) {
            // Intentar obtener los miembros del proyecto actual
            try {
              const projectMembers = await getProjectMembers(projectId);
              if (projectMembers && projectMembers.members) {
                // Extraer los usuarios de los miembros del proyecto
                usersData = projectMembers.members.map(member => member.user);
              }
            } catch (projectError) {
              console.error('Error al cargar miembros del proyecto:', projectError);
            }
          }
          
          // Si no hay miembros de proyecto o falló la carga, intentar con getUsers
          if (!usersData || usersData.length === 0) {
            try {
              usersData = await getUsers();
            } catch (usersError) {
              console.error('Error al cargar usuarios del sistema:', usersError);
            }
          }
          
          setUsers(usersData || []);
          console.log('[EditTaskModal] Usuarios cargados correctamente:', usersData?.length || 0);
        } catch (err) {
          console.error('Error al cargar usuarios:', err);
          setError('No se pudieron cargar los usuarios. Puedes continuar editando la tarea.');
        }
      };
      
      loadUsers();
    }
  }, [open, task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError('');
  };

  const handleUpdate = async () => {
    if (!formData.titulo.trim()) {
      setError('Por favor, ingresa un título para la tarea.');
      return;
    }

    if (!task || !task._id) {
      setError('Error: ID de la tarea no válido');
      return;
    }

    try {
      setUpdating(true);
      setError('');

      // Mapear los estados del frontend al backend
      const statusMap = {
        'Por_Hacer': 'To_Do',
        'En_Progreso': 'In_Progress',
        'En_Revision': 'In_Review',
        'Completado': 'Completed',
        'Deleted': 'Deleted'
      };

      // Mapear las prioridades del frontend al backend
      const priorityMap = {
        'baja': 'Low',
        'media': 'Medium',
        'alta': 'High',
        'urgente': 'Urgent'
      };

      // Asegurar que todos los campos requeridos estén presentes y formateados
      const taskData = {
        title: formData.titulo.trim(),
        description: formData.descripcion?.trim() || '',
        status: statusMap[formData.status] || formData.status,
        priority: priorityMap[formData.prioridad] || formData.prioridad,
        assignedTo: formData.asignadoA ? [formData.asignadoA] : [],
        dueDate: formData.fechaLimite || null
      };

      console.log('Datos de la tarea a actualizar:', taskData);
      const result = await updateTask(task._id, taskData);
      
      if (!result) {
        throw new Error('No se recibió respuesta del servidor');
      }

      setUpdating(false);
      if (onEditSuccess) {
        onEditSuccess(result);
      }
      handleClose();
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      const errorMessage = err.message || 'Error al actualizar la tarea. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      status: 'Por_Hacer',
      prioridad: 'media',
      asignadoA: '',
      fechaLimite: ''
    });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} size="md">
      <Modal.Header onClose={handleClose}>
        Editar tarea
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
            id="task-status"
            name="status"
            label="Estado"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Por_Hacer">Por Hacer</option>
            <option value="En_Progreso">En Progreso</option>
            <option value="En_Revision">En Revisión</option>
            <option value="Completado">Completado</option>
            <option value="Deleted">Eliminado</option>
          </FormControl.Select>
          
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
            <option value="urgente">Urgente</option>
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
              <option disabled>Cargando usuarios...</option>
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
        <ModalFooter>
          <div>
            <Button variant="text" onClick={handleClose} style={{ marginRight: 10 }}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating ? <Spinner size="sm" /> : 'Guardar cambios'}
            </Button>
          </div>
        </ModalFooter>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskModal;
