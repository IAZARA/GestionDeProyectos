import API from './api';

const taskService = {
  async getTasks() {
    try {
      const response = await API.get('/tasks');
      return response.data.tasks;
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      throw error;
    }
  },

  async getMyTasks() {
    try {
      // Intentar obtener las tareas asignadas al usuario actual
      try {
        const response = await API.get('/tasks/my-tasks');
        if (response.data && response.data.tasks) {
          console.log('Tareas obtenidas del servidor:', response.data.tasks);
          return response.data.tasks;
        }
        return [];
      } catch (error) {
        // Si hay un error con la primera ruta, registrar el error y probar con una alternativa
        console.error('Error al obtener tareas de /tasks/my-tasks:', error);
        
        // Intentar con la ruta alternativa
        try {
          // Obtener el ID del usuario actual del token
          const token = localStorage.getItem('token');
          let userId = null;
          
          if (token) {
            // Decodificar el token para obtener el ID del usuario
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const decoded = JSON.parse(jsonPayload);
            userId = decoded.id;
          }
          
          if (userId) {
            const userTasksResponse = await API.get(`/users/${userId}/tasks`);
            if (userTasksResponse.data && userTasksResponse.data.tasks) {
              return userTasksResponse.data.tasks;
            }
          }
          
          // Si no podemos obtener el ID del usuario, intentar con la ruta general
          const allTasksResponse = await API.get('/tasks');
          if (allTasksResponse.data && allTasksResponse.data.tasks) {
            // Filtrar tareas por el usuario actual (podría no ser eficiente pero es una solución alternativa)
            // Idealmente esto debería hacerse en el backend
            return allTasksResponse.data.tasks;
          }
          
          return [];
        } catch (fallbackError) {
          console.error('Error en fallback para obtener tareas:', fallbackError);
          return [];
        }
      }
    } catch (error) {
      console.error('Error en getMyTasks:', error);
      return [];
    }
  },

  async getTaskById(taskId) {
    try {
      const response = await API.get(`/tasks/${taskId}`);
      return response.data.task;
    } catch (error) {
      console.error('Error al obtener tarea:', error);
      throw error;
    }
  },

  async getProjectTasks(projectId) {
    try {
      const response = await API.get(`/projects/${projectId}/tasks`);
      return response.data.tasks;
    } catch (error) {
      console.error('Error al obtener tareas del proyecto:', error);
      return [];
    }
  },

  async createTask(projectId, taskData) {
    try {
      if (!projectId || !taskData.titulo) {
        throw new Error('El ID del proyecto y el título de la tarea son requeridos');
      }

      // Mapear los valores de status del español al inglés
      const statusMap = {
        'Por_Hacer': 'To_Do',
        'En_Progreso': 'In_Progress',
        'En_Revision': 'In_Review',
        'Completado': 'Completed'
      };

      // Mapear los valores de prioridad del español al inglés
      const priorityMap = {
        'baja': 'Low',
        'media': 'Medium',
        'alta': 'High',
        'urgente': 'Urgent'
      };

      // Preparar el campo assignedTo como array
      let assignedToArray = [];
      if (taskData.asignadoA) {
        if (Array.isArray(taskData.asignadoA)) {
          assignedToArray = taskData.asignadoA;
        } else if (taskData.asignadoA && taskData.asignadoA !== '') {
          assignedToArray = [taskData.asignadoA];
        }
      }

      // Mapear los datos al formato esperado por el backend
      const mappedData = {
        title: taskData.titulo,
        description: taskData.descripcion || 'Sin descripción',
        status: statusMap[taskData.status] || 'To_Do',
        priority: priorityMap[taskData.prioridad] || 'Medium',
        assignedTo: assignedToArray,
        dueDate: taskData.fechaLimite,
        projectId: projectId
      };

      console.log('Datos mapeados para el backend:', mappedData);

      const response = await API.post(`/projects/${projectId}/tasks`, mappedData);
      return response.data;
    } catch (error) {
      console.error('Error en createTask:', error.response || error);
      throw error.response?.data || error;
    }
  },

  async updateTask(taskId, taskData) {
    try {
      if (!taskId) {
        throw new Error('El ID de la tarea es requerido');
      }

      // Mapear los valores de status del español al inglés
      const statusMap = {
        'Por_Hacer': 'To_Do',
        'En_Progreso': 'In_Progress',
        'En_Revision': 'In_Review',
        'Completado': 'Completed'
      };

      // Mapear los valores de prioridad del español al inglés
      const priorityMap = {
        'baja': 'Low',
        'media': 'Medium',
        'alta': 'High',
        'urgente': 'Urgent'
      };

      // Mapear los datos al formato esperado por el backend
      const mappedData = {};
      
      // Solo incluir los campos que están presentes en taskData
      if (taskData.title || taskData.titulo) mappedData.title = taskData.title || taskData.titulo;
      if (taskData.description || taskData.descripcion) mappedData.description = taskData.description || taskData.descripcion;
      
      // Mapear el estado si está presente
      if (taskData.status) {
        mappedData.status = statusMap[taskData.status] || taskData.status;
      }
      
      // Mapear la prioridad si está presente
      if (taskData.priority || taskData.prioridad) {
        mappedData.priority = priorityMap[taskData.prioridad] || taskData.priority || 'Medium';
      }
      
      // Asignar otros campos si están presentes
      if (taskData.assignedTo || taskData.asignadoA) {
        // Asegurarnos de que assignedTo sea siempre un array
        const assignedValue = taskData.assignedTo || taskData.asignadoA;
        
        if (Array.isArray(assignedValue)) {
          mappedData.assignedTo = assignedValue;
        } else if (assignedValue && assignedValue !== '') {
          // Si es un valor único y no está vacío, convertirlo a array
          mappedData.assignedTo = [assignedValue];
        } else {
          // Si es un valor vacío, enviamos un array vacío
          mappedData.assignedTo = [];
        }
      }
      
      if (taskData.dueDate || taskData.fechaLimite) mappedData.dueDate = taskData.dueDate || taskData.fechaLimite;

      console.log('Datos mapeados para actualizar en el backend:', mappedData);

      const response = await API.put(`/tasks/${taskId}`, mappedData);
      return response.data.task;
    } catch (error) {
      console.error('Error al actualizar tarea:', error.response || error);
      throw error.response?.data || error;
    }
  },

  async deleteTask(taskId, projectId) {
    try {
      console.log(`Iniciando eliminación de tarea ${taskId} ${projectId ? `del proyecto ${projectId}` : 'sin proyecto asociado'}`);
      
      let response;
      // Si se proporciona projectId, usar la ruta del proyecto
      if (projectId) {
        console.log(`Usando ruta de proyecto para eliminar: /projects/${projectId}/tasks/${taskId}`);
        response = await API.delete(`/projects/${projectId}/tasks/${taskId}`);
      } else {
        // Usar la ruta general de tareas
        console.log(`Usando ruta general para eliminar: /tasks/${taskId}`);
        response = await API.delete(`/tasks/${taskId}`);
      }
      
      console.log('Respuesta de eliminación:', response.data);
      return response.data?.success || true;
    } catch (error) {
      console.error('Error detallado al eliminar tarea:', error);
      console.error('Código de error:', error.response?.status);
      console.error('Datos de error:', error.response?.data);
      throw error;
    }
  },

  async updateTaskStatus(taskId, status) {
    try {
      // Mapear los estados del frontend al backend si es necesario
      const statusMap = {
        'Por_Hacer': 'To_Do',
        'En_Progreso': 'In_Progress',
        'En_Revision': 'In_Review',
        'Completado': 'Completed',
        'Deleted': 'Deleted'
      };
      
      // Convertir el estado al formato esperado por el backend
      const backendStatus = statusMap[status] || status;
      
      console.log(`[updateTaskStatus] INICIANDO - Actualizando tarea ${taskId} a estado: ${backendStatus}`);
      console.log(`[updateTaskStatus] URL de la petición: /tasks/${taskId}/status`);
      console.log(`[updateTaskStatus] Datos enviados:`, { status: backendStatus });
      
      // Enviar la petición al servidor con timeout extendido para debugging
      const response = await API.put(`/tasks/${taskId}/status`, { status: backendStatus }, {
        timeout: 10000 // 10 segundos de timeout para dar tiempo a que responda
      });
      
      console.log(`[updateTaskStatus] Respuesta exitosa del servidor:`, response.data);
      return response.data;
    } catch (error) {
      // Logging detallado del error
      console.error('[updateTaskStatus] ❌ ERROR al actualizar estado de la tarea:', error.message);
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('[updateTaskStatus] Código de error:', error.response.status);
        console.error('[updateTaskStatus] Datos del error:', error.response.data);
        console.error('[updateTaskStatus] Headers de respuesta:', error.response.headers);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('[updateTaskStatus] No se recibió respuesta del servidor');
        console.error('[updateTaskStatus] Petición enviada:', error.request);
      } else {
        // Ocurrió un error al configurar la petición
        console.error('[updateTaskStatus] Error de configuración:', error.message);
      }
      
      throw error;
    }
  },

  async assignTask(taskId, userId) {
    try {
      const response = await API.patch(`/tasks/${taskId}/assign`, { assignedTo: userId });
      return response.data.task;
    } catch (error) {
      console.error('Error al asignar tarea:', error);
      throw error;
    }
  },

  async addComment(taskId, comment) {
    try {
      const response = await API.post(`/tasks/${taskId}/comments`, { content: comment });
      return response.data.comment;
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      throw error;
    }
  },

  async getTasksByUser(userId) {
    try {
      console.log(`Obteniendo tareas para el usuario ${userId}`);
      
      // Primero intentar con la ruta específica del usuario
      const response = await API.get(`/users/${userId}/tasks`);
      console.log('Tareas obtenidas por usuario:', response.data);
      
      if (response.data && response.data.tasks) {
        return response.data.tasks;
      }
      
      // Si no hay datos de tareas en la respuesta, intentar con otro enfoque
      console.log('No se encontraron tareas en la respuesta, intentando filtrar todas las tareas');
      
      // Obtener todas las tareas y filtrar manualmente
      const allTasksResponse = await API.get('/tasks');
      
      if (allTasksResponse.data && allTasksResponse.data.tasks) {
        const userTasks = allTasksResponse.data.tasks.filter(task => {
          // Verificar si el usuario está asignado a la tarea
          if (task.assignedTo && Array.isArray(task.assignedTo)) {
            return task.assignedTo.some(assignee => 
              (typeof assignee === 'object' && assignee._id === userId) || 
              assignee === userId
            );
          }
          return false;
        });
        
        console.log(`Se encontraron ${userTasks.length} tareas para el usuario mediante filtrado`);
        return userTasks;
      }
      
      return [];
    } catch (error) {
      console.error(`Error al obtener tareas del usuario ${userId}:`, error);
      return [];
    }
  },

  async markTaskAsDeleted(taskId, projectId) {
    try {
      console.log(`[markTaskAsDeleted] INICIANDO - Marcando tarea ${taskId} como eliminada`);
      console.log(`[markTaskAsDeleted] ID de proyecto utilizado: ${projectId}`);
      
      // Intentar obtener la tarea primero para verificar que existe
      try {
        const taskBeforeUpdate = await this.getTaskById(taskId);
        console.log('[markTaskAsDeleted] Tarea encontrada antes de eliminar:', 
          taskBeforeUpdate ? `ID: ${taskBeforeUpdate._id}, Status: ${taskBeforeUpdate.status}` : 'No encontrada');
      } catch (preVerifyError) {
        console.warn('[markTaskAsDeleted] No se pudo verificar la tarea antes de eliminar:', preVerifyError.message);
        // Continuamos aunque no podamos verificar la tarea
      }
      
      // ALTERNATIVA: Usar deleteTask en lugar de updateTaskStatus para tareas problemáticas
      try {
        console.log('[markTaskAsDeleted] Intentando marcar como eliminada usando updateTaskStatus...');
        const result = await this.updateTaskStatus(taskId, 'Deleted');
        console.log('[markTaskAsDeleted] Resultado de updateTaskStatus:', result);
        
        // Verificar resultado después de la actualización
        try {
          const taskAfterUpdate = await this.getTaskById(taskId);
          console.log('[markTaskAsDeleted] Estado después de updateTaskStatus:', 
            taskAfterUpdate ? `ID: ${taskAfterUpdate._id}, Status: ${taskAfterUpdate.status}` : 'No encontrada');
        } catch (verifyError) {
          console.log('[markTaskAsDeleted] No se pudo verificar la tarea después de actualizar:', verifyError.message);
        }
        
        return {
          ...result,
          taskId,
          status: 'Deleted'
        };
      } catch (updateError) {
        // Si updateTaskStatus falla, intentamos con deleteTask como alternativa
        console.warn('[markTaskAsDeleted] Error con updateTaskStatus, intentando deleteTask como alternativa:', updateError.message);
        
        try {
          console.log('[markTaskAsDeleted] Intentando deleteTask como fallback...');
          const deleteResult = await this.deleteTask(taskId, projectId);
          console.log('[markTaskAsDeleted] Resultado de deleteTask:', deleteResult);
          
          return {
            success: true,
            message: 'Tarea eliminada completamente del sistema',
            taskId,
            status: 'Deleted'
          };
        } catch (deleteError) {
          console.error('[markTaskAsDeleted] Ambos métodos de eliminación fallaron:', deleteError.message);
          throw deleteError;
        }
      }
    } catch (error) {
      console.error('[markTaskAsDeleted] ❌ ERROR CRÍTICO al marcar tarea como eliminada:', error.message);
      // Capturar más detalles del error para diagnóstico
      if (error.response) {
        console.error('[markTaskAsDeleted] Datos del error:', error.response.data);
        console.error('[markTaskAsDeleted] Código HTTP:', error.response.status);
      }
      throw error;
    }
  }
};

// Exportar todas las funciones necesarias
export const {
  getTasks,
  getMyTasks,
  getTaskById,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  markTaskAsDeleted,
  updateTaskStatus,
  assignTask,
  addComment,
  getTasksByUser
} = taskService;

export default taskService;
