import API from './api';

const calendarService = {
  async getEvents(filters = {}) {
    try {
      // Obtener eventos regulares del calendario
      const eventsResponse = await API.get('/calendar/my-events', { params: filters });
      const regularEvents = eventsResponse.data.events || [];

      // Obtener licencias como eventos
      const licensesResponse = await API.get('/licenses/calendar');
      const licenseEvents = licensesResponse.data || [];

      // Combinar ambos tipos de eventos
      return [...regularEvents, ...licenseEvents];
    } catch (error) {
      console.error('Error al obtener eventos del calendario:', error);
      return [];
    }
  },

  async getMyEvents(filters = {}) {
    try {
      // Intentar primero con la ruta específica
      try {
        const response = await API.get('/calendar/my-events', { params: filters });
        return response.data.events || [];
      } catch (error) {
        // Si falla, intentar con la ruta general
        console.log('Error en la primera ruta, intentando ruta alternativa');
        const response = await API.get('/calendar', { params: filters });
        return response.data.events || [];
      }
    } catch (error) {
      console.error('Error al obtener mis eventos:', error);
      return [];
    }
  },

  async createEvent(eventData) {
    try {
      // Ajustar formato de datos para el backend
      const formattedData = formatEventForBackend(eventData);
      
      // Crear evento en el servidor
      const response = await API.post('/calendar', formattedData);
      return response.data.event;
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  },

  async updateEvent(eventId, eventData) {
    try {
      const formattedData = formatEventForBackend(eventData);
      const response = await API.put(`/calendar/${eventId}`, formattedData);
      return response.data.event;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  },

  async deleteEvent(eventId) {
    try {
      await API.delete(`/calendar/${eventId}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }
};

// Función auxiliar para formatear eventos al formato esperado por el backend
function formatEventForBackend(eventData) {
  return {
    title: eventData.title,
    description: eventData.description,
    startDate: eventData.start,
    endDate: eventData.end,
    allDay: eventData.allDay || false,
    location: eventData.location,
    color: eventData.color,
    project: eventData.project,
    type: eventData.type,
    attendees: eventData.participants ? eventData.participants.map(name => ({ name })) : []
  };
}

export const getEvents = calendarService.getEvents.bind(calendarService);
export const getMyEvents = calendarService.getMyEvents.bind(calendarService);
export const createEvent = calendarService.createEvent.bind(calendarService);
export const updateEvent = calendarService.updateEvent.bind(calendarService);
export const deleteEvent = calendarService.deleteEvent.bind(calendarService);

export default calendarService;
