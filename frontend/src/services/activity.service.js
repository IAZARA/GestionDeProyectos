import API from './api';

const activityService = {
  async getActivities(filters = {}) {
    try {
      const response = await API.get('/activities', { params: filters });
      return response.data.activities || [];
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      return [];
    }
  },

  async getRecentActivity(limit = 10) {
    try {
      // Intentar primero con la ruta específica
      try {
        const response = await API.get('/activities/recent', { params: { limit } });
        return response.data.activities || [];
      } catch (error) {
        // Si falla, intentar con ruta alternativa
        console.log('Error en la primera ruta, intentando ruta alternativa');
        const response = await API.get('/activity', { params: { limit } });
        return response.data.activities || response.data || [];
      }
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      return [];
    }
  },

  async getProjectActivity(projectId, filters = {}) {
    try {
      const response = await API.get(`/projects/${projectId}/activity`, { params: filters });
      return response.data.activities || [];
    } catch (error) {
      console.error(`Error al obtener actividad del proyecto ${projectId}:`, error);
      return [];
    }
  },

  async getUserActivity(userId, filters = {}) {
    try {
      const response = await API.get(`/users/${userId}/activity`, { params: filters });
      return response.data.activities || [];
    } catch (error) {
      console.error(`Error al obtener actividad del usuario ${userId}:`, error);
      return [];
    }
  }
};

export const getActivities = activityService.getActivities.bind(activityService);
export const getRecentActivity = activityService.getRecentActivity.bind(activityService);
export const getProjectActivity = activityService.getProjectActivity.bind(activityService);
export const getUserActivity = activityService.getUserActivity.bind(activityService);

export default activityService; 