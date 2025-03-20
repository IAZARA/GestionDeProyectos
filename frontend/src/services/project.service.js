import API from './api';
import wikiService from './wiki.service';

const projectService = {
  async getProjects() {
    try {
      console.log('Solicitando proyectos con includeMembers=true');
      // Solicitar que se incluyan los detalles de los miembros
      const response = await API.get('/projects?includeMembers=true');
      console.log('Respuesta del servidor para getProjects:', response.status, response.statusText);
      
      // Verificar diferentes formatos de respuesta
      if (response.data && Array.isArray(response.data.projects)) {
        console.log('Estructura de datos: response.data.projects', {
          projectCount: response.data.projects.length,
          sampleProject: response.data.projects[0] ? {
            id: response.data.projects[0]._id,
            name: response.data.projects[0].name,
            membersCount: response.data.projects[0].members ? response.data.projects[0].members.length : 0,
            hasPopulatedUsers: !!response.data.projects[0]._populated_users,
            hasAllMembers: !!response.data.projects[0]._all_members
          } : null
        });
        return response.data.projects;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Estructura de datos: response.data (array)', {
          projectCount: response.data.length,
          sampleProject: response.data[0] ? {
            id: response.data[0]._id,
            name: response.data[0].name,
            membersCount: response.data[0].members ? response.data[0].members.length : 0,
            hasPopulatedUsers: !!response.data[0]._populated_users,
            hasAllMembers: !!response.data[0]._all_members
          } : null
        });
        return response.data;
      } else {
        console.warn('Formato de respuesta inesperado en getProjects:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      return [];
    }
  },

  async getProjectById(projectId) {
    try {
      const response = await API.get(`/projects/${projectId}`);
      return response.data.project;
    } catch (error) {
      console.error('Error al obtener proyecto:', error);
      throw error;
    }
  },

  async createProject(projectData) {
    try {
      // Validar campos obligatorios
      if (!projectData.nombre) {
        throw new Error('El nombre del proyecto es obligatorio');
      }
      
      if (!projectData.fechaInicio) {
        throw new Error('La fecha de inicio es obligatoria');
      }
      
      // Asegurar que fechaFin tenga un valor si está vacío
      const fechaFin = projectData.fechaFin || projectData.fechaInicio;
      
      // Procesar los miembros para adaptarlos al formato esperado por el backend
      let processedMembers = [];
      if (Array.isArray(projectData.miembros) && projectData.miembros.length > 0) {
        processedMembers = projectData.miembros.map(member => {
          // Convertir el formato de miembro que viene del frontend al formato del backend
          return {
            user: member.usuario,   // ID del usuario
            role: member.rol || 'user'  // Rol del usuario (convertir 'miembro' a 'user' si es necesario)
          };
        });
        
        console.log('Miembros procesados para enviar al backend:', processedMembers);
      }
      
      // Mapear los campos del español al inglés para el backend
      const mappedData = {
        name: projectData.nombre.trim(),
        description: (projectData.descripcion || '').trim(),
        startDate: projectData.fechaInicio,
        endDate: fechaFin,
        status: projectData.estado || 'active',
        area: projectData.area || '',
        members: processedMembers
      };
      
      console.log('Datos mapeados para el backend:', mappedData);
      
      const response = await API.post('/projects', mappedData);
      const project = response.data.project;
      
      // Crear la wiki inicial del proyecto
      try {
        await wikiService.createInitialWikiPage(project._id);
      } catch (wikiError) {
        console.error('Error al crear la wiki inicial:', wikiError);
        // No interrumpir el flujo si falla la creación de la wiki
      }
      
      return { project };
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      
      // Mejorar el mensaje de error para el usuario
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.message || error.response.data.error || 'Error del servidor';
        throw new Error(`Error al crear el proyecto: ${errorMsg}`);
      }
      
      throw error;
    }
  },

  async updateProject(projectId, projectData) {
    try {
      const response = await API.put(`/projects/${projectId}`, projectData);
      return response.data.project;
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      throw error;
    }
  },

  async deleteProject(projectId) {
    try {
      const response = await API.delete(`/projects/${projectId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      // Crear un objeto de error más informativo
      const errorInfo = {
        success: false,
        message: error.message || 'Error desconocido al eliminar el proyecto',
        status: error.response?.status || 0,
        details: error.response?.data || {}
      };
      throw errorInfo;
    }
  },

  async updateProjectStatus(projectId, status) {
    try {
      const response = await API.patch(`/projects/${projectId}/status`, { status });
      return response.data.project;
    } catch (error) {
      console.error('Error al actualizar estado del proyecto:', error);
      throw error;
    }
  },

  async getProjectStats(projectId) {
    try {
      if (!projectId) {
        throw new Error('ID de proyecto requerido para obtener estadísticas');
      }
      
      // Añadir un parámetro de consulta con marca de tiempo para evitar la caché
      const timestamp = new Date().getTime();
      
      // Configurar encabezados para evitar la caché
      const config = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'If-Modified-Since': '0'
        }
      };
      
      // Intentar hasta 3 veces con un retraso entre intentos
      let attempts = 0;
      let lastError = null;
      
      while (attempts < 3) {
        try {
          const currentAttempt = attempts; // Capturar el valor actual en una constante
          const response = await API.get(`/projects/${projectId}/stats?t=${timestamp}&attempt=${currentAttempt}`, config);
          console.log(`Estadísticas obtenidas del servidor (intento ${currentAttempt + 1}):`, response.data.stats);
          return response.data.stats;
        } catch (err) {
          lastError = err;
          attempts++;
          if (attempts < 3) {
            // Esperar un tiempo antes de reintentar (300ms, 600ms)
            const delayTime = 300 * attempts;
            await new Promise(resolve => setTimeout(resolve, delayTime));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      throw lastError || new Error('No se pudieron obtener las estadísticas después de múltiples intentos');
    } catch (error) {
      console.error('Error al obtener estadísticas del proyecto:', error);
      return null;
    }
  },

  async getProjectActivity(projectId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Añadir parámetros de paginación y filtrado
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.actions) queryParams.append('actions', params.actions);
      if (params.entityTypes) queryParams.append('entityTypes', params.entityTypes);
      
      // Construir URL con parámetros
      const url = `/projects/${projectId}/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividad del proyecto:', error);
      return { activities: [], total: 0, page: 1, limit: 10 };
    }
  },

  async getProjectMembers(projectId) {
    try {
      const response = await API.get(`/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener miembros del proyecto:', error);
      return { members: [], owner: null };
    }
  },

  async addProjectMember(projectId, userId, role = 'user') {
    try {
      const response = await API.post(`/projects/${projectId}/members`, { 
        userId,
        role
      });
      return response.data;
    } catch (error) {
      console.error('Error al añadir miembro al proyecto:', error);
      throw error;
    }
  },

  async removeProjectMember(projectId, userId) {
    try {
      const response = await API.delete(`/projects/${projectId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar miembro del proyecto:', error);
      throw error;
    }
  },

  async updateMemberRole(projectId, userId, role) {
    try {
      const response = await API.put(`/projects/${projectId}/members/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar rol del miembro:', error);
      throw error;
    }
  },

  async getMyProjects() {
    try {
      // Intentar primero con la ruta específica
      try {
        const response = await API.get('/projects/my-projects');
        return response.data.projects || [];
      } catch (error) {
        // Si falla, intentar con la ruta general
        console.log('Error en la primera ruta, intentando ruta alternativa');
        const response = await API.get('/projects');
        return response.data.projects || [];
      }
    } catch (error) {
      console.error('Error al obtener proyectos del usuario:', error);
      return [];
    }
  }
};

// Exportar funciones individuales para mantener compatibilidad
export const getProjects = projectService.getProjects.bind(projectService);
export const getProjectById = projectService.getProjectById.bind(projectService);
export const createProject = projectService.createProject.bind(projectService);
export const updateProject = projectService.updateProject.bind(projectService);
export const deleteProject = projectService.deleteProject.bind(projectService);
export const updateProjectStatus = projectService.updateProjectStatus.bind(projectService);
export const getProjectStats = projectService.getProjectStats.bind(projectService);
export const getProjectActivity = projectService.getProjectActivity.bind(projectService);
export const getProjectMembers = projectService.getProjectMembers.bind(projectService);
export const addProjectMember = projectService.addProjectMember.bind(projectService);
export const removeProjectMember = projectService.removeProjectMember.bind(projectService);
export const updateMemberRole = projectService.updateMemberRole.bind(projectService);
export const getMyProjects = projectService.getMyProjects.bind(projectService);

export default projectService;


