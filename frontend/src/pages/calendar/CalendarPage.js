import React, { useState, useEffect } from 'react';
import { Container as BootstrapContainer, Form, Alert, Spinner } from 'react-bootstrap';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { FaPlus, FaCalendarAlt, FaClock, FaProjectDiagram, FaTag, FaMapMarkerAlt, FaUsers, FaFileAlt, FaTrash, FaEdit } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/es';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import API from '../../services/api';
import { deleteEvent, getEvents, createEvent, updateEvent } from '../../services/calendar.service';

// Configurar el localizador para el calendario
moment.locale('es');
const localizer = momentLocalizer(moment);

const Container = styled(BootstrapContainer)`
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  color: #1a237e;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Subtitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #3949ab;
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.9;
`;

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const SidebarCard = styled.div`
  height: fit-content;
  margin-bottom: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  overflow: hidden;
`;

const CardHeader = styled.div`
  background-color: #1a237e;
  color: white;
  padding: 0.75rem 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const CardBody = styled.div`
  padding: 1rem;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background-color: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ViewSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  
  .btn {
    border-radius: 20px;
    font-size: 0.9rem;
    padding: 0.4rem 1rem;
    
    &.active {
      background-color: #1a237e;
      border-color: #1a237e;
    }
    
    &:not(.active) {
      background-color: transparent;
      color: #1a237e;
      border-color: #d0d0d0;
      
      &:hover {
        background-color: #f0f4ff;
      }
    }
  }
`;

const AddEventButton = styled(Button)`
  background-color: #4caf50;
  border-color: #4caf50;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #388e3c;
    border-color: #388e3c;
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const EventList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const EventItem = styled.li`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const EventTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  span {
    font-size: 0.75rem;
  }
`;

const EventDate = styled.div`
  font-size: 0.8rem;
  color: #757575;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    font-size: 0.75rem;
  }
`;

const StyledCalendar = styled(Calendar)`
  height: 700px;
  
  .rbc-toolbar {
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    
    .rbc-toolbar-label {
      font-weight: 600;
      color: #1a237e;
      font-size: 1.2rem;
    }
    
    .rbc-btn-group {
      button {
        color: #333;
        border-color: #d0d0d0;
        
        &.rbc-active {
          background-color: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        &:hover:not(.rbc-active) {
          background-color: #f0f4ff;
        }
      }
    }
  }
  
  .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
    border-radius: 10px;
    border-color: #e0e0e0;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .rbc-header {
    padding: 0.75rem 0;
    font-weight: 600;
    color: #1a237e;
  }
  
  .rbc-time-view {
    .rbc-time-header {
      border-color: #e0e0e0;
    }
    
    .rbc-time-content {
      border-color: #e0e0e0;
    }
    
    .rbc-time-slot {
      border-color: #f0f0f0;
    }
    
    .rbc-timeslot-group {
      border-color: #e0e0e0;
    }
    
    .rbc-allday-cell {
      height: auto;
      max-height: 50px;
    }
  }
  
  .rbc-time-header-content {
    border-color: #e0e0e0;
  }
  
  .rbc-today {
    background-color: #f3f8ff;
  }
  
  .rbc-event {
    background-color: ${props => props.eventColor || '#5c6bc0'};
    border-radius: 4px;
    color: white;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 1px 3px;
    padding: 2px 5px;
    
    &.meeting {
      background-color: #5c6bc0;
    }
    
    &.task {
      background-color: #66bb6a;
    }
    
    &.deadline {
      background-color: #ef5350;
    }
    
    &.rbc-selected {
      background-color: #3949ab;
    }
  }
`;

const FormContainer = styled.div`
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled(Form.Label)`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
`;

const FormControl = styled(Form.Control)`
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  padding: 0.6rem 0.8rem;
  transition: border-color 0.2s ease-in-out;
  
  &:focus {
    border-color: #5c6bc0;
    box-shadow: 0 0 0 0.2rem rgba(92, 107, 192, 0.25);
  }
`;

const FormSelect = styled(Form.Select)`
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  padding: 0.6rem 0.8rem;
  transition: border-color 0.2s ease-in-out;
  
  &:focus {
    border-color: #5c6bc0;
    box-shadow: 0 0 0 0.2rem rgba(92, 107, 192, 0.25);
  }
`;

const FormCheck = styled(Form.Check)`
  margin-top: 1rem;
  
  .form-check-input:checked {
    background-color: #5c6bc0;
    border-color: #5c6bc0;
  }
`;

const EventComponent = ({ event }) => (
  <div className="rbc-event-content">
    {event.title}
  </div>
);

const EventDetailCard = styled.div`
  border-left: 4px solid ${props => {
    switch (props.eventType) {
      case 'meeting': return '#5c6bc0';
      case 'task': return '#66bb6a';
      case 'deadline': return '#ef5350';
      case 'training': return '#ab47bc';
      case 'license': return '#03a9f4';
      default: return '#5c6bc0';
    }
  }};
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1rem;
`;

const EventDetailHeader = styled.div`
  padding: 1.25rem;
  background-color: ${props => {
    switch (props.eventType) {
      case 'meeting': return '#e8eaf6';
      case 'task': return '#e8f5e9';
      case 'deadline': return '#ffebee';
      case 'training': return '#f3e5f5';
      case 'license': return '#b2e6f5';
      default: return '#e8eaf6';
    }
  }};
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EventDetailTitle = styled.h4`
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 1.25rem;
`;

const EventTypeBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background-color: ${props => {
    switch (props.eventType) {
      case 'meeting': return '#5c6bc0';
      case 'task': return '#66bb6a';
      case 'deadline': return '#ef5350';
      case 'training': return '#ab47bc';
      case 'license': return '#03a9f4';
      default: return '#5c6bc0';
    }
  }};
`;

const EventDetailBody = styled.div`
  padding: 1.25rem;
`;

const EventDetailSection = styled.div`
  margin-bottom: 1.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const EventDetailLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => {
      switch (props.eventType) {
        case 'meeting': return '#5c6bc0';
        case 'task': return '#66bb6a';
        case 'deadline': return '#ef5350';
        case 'training': return '#ab47bc';
        case 'license': return '#03a9f4';
        default: return '#5c6bc0';
      }
    }};
  }
`;

const EventDetailValue = styled.div`
  color: #333;
  padding-left: 1.75rem;
  line-height: 1.5;
`;

const EventDetailDescription = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 0.5rem;
  margin-left: 1.75rem;
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
`;

const ParticipantsList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin: 0.5rem 0 0 1.75rem;
  
  li {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    
    &:before {
      content: "•";
      color: ${props => {
        switch (props.eventType) {
          case 'meeting': return '#5c6bc0';
          case 'task': return '#66bb6a';
          case 'deadline': return '#ef5350';
          case 'training': return '#ab47bc';
          case 'license': return '#03a9f4';
          default: return '#5c6bc0';
        }
      }};
      font-weight: bold;
      margin-right: 0.5rem;
    }
  }
`;

const EventDetailFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const CalendarPage = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    allDay: false,
    description: '',
    location: '',
    type: 'meeting',
    project: '',
    participants: [],
    color: '#5c6bc0' // Default color
  });

  // Cargar eventos desde la API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener eventos del calendario a través del servicio
        const calendarEvents = await getEvents();
        
        // Cargar eventos personalizados guardados en localStorage
        const savedEvents = JSON.parse(localStorage.getItem('customEvents') || '[]');
        
        // Combinar eventos del servidor con eventos personalizados guardados
        let allEvents = [...calendarEvents, ...savedEvents];
        
        setEvents(allEvents);
        
        // Filtrar eventos próximos (próxima semana)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const upcoming = allEvents.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= today && eventDate <= nextWeek;
        }).sort((a, b) => new Date(a.start) - new Date(b.start));
        
        setUpcomingEvents(upcoming);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
        setError('No se pudieron cargar los eventos. Por favor, intente de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Función para recargar los eventos
  const reloadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener eventos actualizados del servicio
      const calendarEvents = await getEvents();
      
      // Cargar eventos personalizados guardados en localStorage
      const savedEvents = JSON.parse(localStorage.getItem('customEvents') || '[]');
      
      // Combinar eventos del servidor con eventos personalizados guardados
      let allEvents = [...calendarEvents, ...savedEvents];
      
      setEvents(allEvents);
      
      // Actualizar eventos próximos
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcoming = allEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= today && eventDate <= nextWeek;
      }).sort((a, b) => new Date(a.start) - new Date(b.start));
      
      setUpcomingEvents(upcoming);
      setLoading(false);
    } catch (error) {
      console.error('Error al recargar eventos:', error);
      setError('No se pudieron cargar los eventos. Por favor, intente de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Escuchar eventos de actualización del calendario (eliminación de licencias)
  useEffect(() => {
    // Función para manejar la actualización del calendario
    const handleCalendarUpdate = (event) => {
      console.log('Evento de actualización del calendario recibido:', event.detail);
      if (event.detail && event.detail.action === 'delete') {
        // Recargar los datos del calendario
        reloadEvents();
      }
    };
    
    // Agregar el event listener
    window.addEventListener('calendarUpdate', handleCalendarUpdate);
    
    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('calendarUpdate', handleCalendarUpdate);
    };
  }, []);
  
  // Formatear fecha del evento
  const formatEventDate = (start, end, allDay) => {
    if (allDay) {
      return moment(start).format('DD MMM YYYY');
    }
    
    if (moment(start).isSame(end, 'day')) {
      return `${moment(start).format('DD MMM YYYY')} · ${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
    }
    
    return `${moment(start).format('DD MMM YYYY HH:mm')} - ${moment(end).format('DD MMM YYYY HH:mm')}`;
  };
  
  // Obtener estilo según tipo de evento
  const getEventStyle = (event) => {
    const styles = {
      style: {}
    };
    
    // Use custom color if available, otherwise use default color based on type
    if (event.color) {
      styles.style.backgroundColor = event.color;
    } else {
      switch (event.type) {
        case 'meeting':
          styles.style.backgroundColor = '#5c6bc0';
          break;
        case 'task':
          styles.style.backgroundColor = '#66bb6a';
          break;
        case 'deadline':
          styles.style.backgroundColor = '#ef5350';
          break;
        case 'training':
          styles.style.backgroundColor = '#ab47bc';
          break;
        case 'license':
          styles.style.backgroundColor = '#03a9f4';
          break;
        default:
          styles.style.backgroundColor = '#5c6bc0';
      }
    }
    
    return styles;
  };
  
  // Obtener nombre del tipo de evento
  const getEventTypeName = (type) => {
    switch (type) {
      case 'meeting':
        return 'Reunión';
      case 'task':
        return 'Tarea';
      case 'deadline':
        return 'Fecha Límite';
      case 'training':
        return 'Capacitación';
      case 'license':
        return 'Licencia';
      default:
        return 'Evento';
    }
  };
  
  // Manejar selección de evento
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };
  
  // Manejar edición de evento desde modal de detalles
  const handleEditFromDetails = () => {
    setIsEditing(true);
    
    setEventForm({
      title: selectedEvent.title,
      start: new Date(selectedEvent.start),
      end: new Date(selectedEvent.end),
      allDay: selectedEvent.allDay || false,
      description: selectedEvent.description || '',
      location: selectedEvent.location || '',
      type: selectedEvent.type || 'meeting',
      project: selectedEvent.project || '',
      participants: selectedEvent.participants || [],
      color: selectedEvent.color || getDefaultColorForType(selectedEvent.type)
    });
    
    setShowDetailsModal(false);
    setShowEventModal(true);
  };
  
  // Manejar selección de slot (para crear nuevo evento)
  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setIsEditing(false);
    
    // Establecer hora de fin predeterminada a 1 hora después del inicio
    const endTime = new Date(start);
    endTime.setHours(endTime.getHours() + 1);
    
    setEventForm({
      title: '',
      start: new Date(start),
      end: new Date(end || endTime),
      allDay: false,
      description: '',
      location: '',
      type: 'meeting',
      project: '',
      participants: [],
      color: '#5c6bc0' // Default color for meetings
    });
    
    setShowEventModal(true);
  };
  
  // Manejar cambio en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar cambio en checkbox
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Manejar cambio de fecha
  const handleDateChange = (name, value) => {
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar guardado de evento
  const handleSaveEvent = async () => {
    try {
      // Preparar datos del evento
      let newEvent = {
        ...eventForm,
        id: isEditing ? selectedEvent.id : Date.now().toString(),
        createdBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Usuario',
      };
      
      // Variable para el evento actualizado que viene del servidor (con su ID)
      let savedEvent = null;
      
      // Intentar guardar en el servidor primero
      try {
        if (isEditing) {
          // Si estamos editando, actualizar en el servidor
          savedEvent = await updateEvent(selectedEvent.id, newEvent);
          console.log('Evento actualizado en el servidor:', savedEvent);
        } else {
          // Si es nuevo, crear en el servidor
          savedEvent = await createEvent(newEvent);
          console.log('Evento creado en el servidor:', savedEvent);
        }
        
        // Si se guardó correctamente en el servidor, usar ese evento con el ID asignado por el servidor
        if (savedEvent) {
          newEvent = savedEvent;
        }
      } catch (error) {
        // Si falla la operación en el servidor, guardar localmente
        console.error('Error al guardar evento en el servidor:', error);
        
        // Marcar como evento personalizado para guardarlo en localStorage
        newEvent.isCustom = true;
      }
      
      // Actualizar la UI con el evento actualizado (ya sea del servidor o local)
      let updatedEvents;
      
      if (isEditing) {
        // Actualizar evento existente
        updatedEvents = events.map(event => 
          event.id === selectedEvent.id ? newEvent : event
        );
        
        // Actualizar eventos próximos
        const updatedUpcoming = upcomingEvents.map(event => 
          event.id === selectedEvent.id ? newEvent : event
        );
        setUpcomingEvents(updatedUpcoming);
      } else {
        // Crear nuevo evento
        updatedEvents = [...events, newEvent];
        
        // Verificar si es un evento próximo
        const eventDate = new Date(newEvent.start);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        if (eventDate >= today && eventDate <= nextWeek) {
          const updatedUpcoming = [...upcomingEvents, newEvent].sort((a, b) => 
            new Date(a.start) - new Date(b.start)
          );
          setUpcomingEvents(updatedUpcoming);
        }
      }
      
      setEvents(updatedEvents);
      
      // Guardar eventos personalizados en localStorage para persistencia local
      const customEvents = updatedEvents.filter(event => event.isCustom);
      localStorage.setItem('customEvents', JSON.stringify(customEvents));
      
      setShowEventModal(false);
    } catch (error) {
      console.error('Error general al guardar evento:', error);
      alert('Hubo un problema al guardar el evento. El evento se guardará localmente.');
      
      // Implementar un fallback para asegurar que al menos se guarde localmente
      const newEvent = {
        ...eventForm,
        id: isEditing ? selectedEvent.id : Date.now().toString(),
        createdBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Usuario',
        isCustom: true
      };
      
      let updatedEvents;
      
      if (isEditing) {
        updatedEvents = events.map(event => event.id === selectedEvent.id ? newEvent : event);
      } else {
        updatedEvents = [...events, newEvent];
      }
      
      setEvents(updatedEvents);
      
      // Guardar en localStorage
      const customEvents = updatedEvents.filter(event => event.isCustom);
      localStorage.setItem('customEvents', JSON.stringify(customEvents));
      
      setShowEventModal(false);
    }
  };
  
  // Manejar eliminación de evento
  const handleDeleteEvent = async () => {
    try {
      if (selectedEvent && selectedEvent.id) {
        // Verificar si es un evento personalizado guardado en localStorage
        const isCustomEvent = selectedEvent.isCustom === true;
        
        // Si no es un evento personalizado, intentar eliminarlo del servidor
        if (!isCustomEvent) {
          try {
            await deleteEvent(selectedEvent.id);
            console.log('Evento eliminado correctamente en el servidor');
          } catch (error) {
            console.error('Error al eliminar evento en el servidor:', error);
            // Continuar con la eliminación local aunque falle en el servidor
          }
        }
        
        // Si es un evento personalizado, actualizarlo en localStorage
        if (isCustomEvent) {
          const customEvents = JSON.parse(localStorage.getItem('customEvents') || '[]');
          const updatedCustomEvents = customEvents.filter(event => event.id !== selectedEvent.id);
          localStorage.setItem('customEvents', JSON.stringify(updatedCustomEvents));
        }
        
        // Actualizar la UI
        const updatedEvents = events.filter(event => event.id !== selectedEvent.id);
        setEvents(updatedEvents);
        
        // Actualizar eventos próximos
        const updatedUpcoming = upcomingEvents.filter(event => event.id !== selectedEvent.id);
        setUpcomingEvents(updatedUpcoming);
        
        setShowDeleteModal(false);
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      alert('No se pudo eliminar el evento. Por favor, intente de nuevo más tarde.');
    }
  };
  
  // Manejar cambio de vista
  const handleViewChange = (newView) => {
    setView(newView);
  };
  
  // Obtener color predeterminado según tipo de evento
  const getDefaultColorForType = (type) => {
    switch (type) {
      case 'meeting':
        return '#5c6bc0';
      case 'task':
        return '#66bb6a';
      case 'deadline':
        return '#ef5350';
      case 'training':
        return '#ab47bc';
      case 'license':
        return '#03a9f4';
      default:
        return '#5c6bc0';
    }
  };

  // Renderizar vista del calendario
  return (
    <Container>
      <Title>Calendario</Title>
      <Subtitle>Gestiona tus eventos y reuniones</Subtitle>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <ActionBar>
        <ViewSelector>
          <Button 
            variant={view === 'month' ? 'primary' : 'outline-primary'} 
            onClick={() => handleViewChange('month')}
            className={view === 'month' ? 'active' : ''}
          >
            Mes
          </Button>
          <Button 
            variant={view === 'week' ? 'primary' : 'outline-primary'} 
            onClick={() => handleViewChange('week')}
            className={view === 'week' ? 'active' : ''}
          >
            Semana
          </Button>
          <Button 
            variant={view === 'day' ? 'primary' : 'outline-primary'} 
            onClick={() => handleViewChange('day')}
            className={view === 'day' ? 'active' : ''}
          >
            Día
          </Button>
        </ViewSelector>
        
        <AddEventButton onClick={() => handleSelectSlot({ start: new Date() })}>
          <FaPlus /> Nuevo Evento
        </AddEventButton>
      </ActionBar>
      
      <CalendarContainer>
        <div>
          {loading ? (
            <LoadingContainer>
              <Spinner animation="border" variant="primary" />
            </LoadingContainer>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <StyledCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              views={['month', 'week', 'day']}
              view={view}
              date={date}
              onNavigate={date => setDate(date)}
              onView={handleViewChange}
              selectable
              popup
              step={30}
              timeslots={2}
              min={moment().startOf('day').toDate()}
              max={moment().endOf('day').toDate()}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={getEventStyle}
              components={{
                event: EventComponent
              }}
              messages={{
                today: 'Hoy',
                previous: 'Anterior',
                next: 'Siguiente',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay eventos en este período'
              }}
            />
          )}
        </div>
        
        <div>
          <SidebarCard>
            <CardHeader>
              <FaCalendarAlt size={18} />
              Próximos Eventos
            </CardHeader>
            <CardBody>
              {upcomingEvents.length > 0 ? (
                <EventList>
                  {upcomingEvents.map(event => (
                    <EventItem key={event.id} onClick={() => handleSelectEvent(event)}>
                      <EventTitle>
                        {event.title}
                      </EventTitle>
                      <EventDate>
                        <FaClock size={12} />
                        {formatEventDate(event.start, event.end, event.allDay)}
                      </EventDate>
                      {event.project && (
                        <small className="d-block text-muted mt-1">
                          <FaProjectDiagram size={12} className="me-1" />
                          {event.project}
                        </small>
                      )}
                    </EventItem>
                  ))}
                </EventList>
              ) : (
                <p className="text-muted">No hay eventos próximos</p>
              )}
            </CardBody>
          </SidebarCard>
          
          <SidebarCard>
            <CardHeader>
              <FaTag size={18} />
              Leyenda
            </CardHeader>
            <CardBody>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  <span className="d-inline-block me-2" style={{ width: '15px', height: '15px', backgroundColor: '#5c6bc0', borderRadius: '3px' }}></span>
                  <span>Reunión</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="d-inline-block me-2" style={{ width: '15px', height: '15px', backgroundColor: '#66bb6a', borderRadius: '3px' }}></span>
                  <span>Tarea</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="d-inline-block me-2" style={{ width: '15px', height: '15px', backgroundColor: '#ef5350', borderRadius: '3px' }}></span>
                  <span>Fecha Límite</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="d-inline-block me-2" style={{ width: '15px', height: '15px', backgroundColor: '#ab47bc', borderRadius: '3px' }}></span>
                  <span>Capacitación</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="d-inline-block me-2" style={{ width: '15px', height: '15px', backgroundColor: '#03a9f4', borderRadius: '3px' }}></span>
                  <span>Licencia</span>
                </div>
              </div>
            </CardBody>
          </SidebarCard>
        </div>
      </CalendarContainer>
      
      {/* Modal para crear/editar eventos */}
      {showEventModal && (
        <Modal 
          isOpen={showEventModal} 
          onClose={() => setShowEventModal(false)} 
          size="lg"
        >
          <Modal.Header onClose={() => setShowEventModal(false)}>
            {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
          </Modal.Header>
          <Modal.Body>
            <FormContainer>
              <FormSection>
                <FormLabel>Título</FormLabel>
                <FormControl
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleFormChange}
                  placeholder="Título del evento"
                  required
                />
              </FormSection>
              
              <FormSection>
                <FormLabel>Fecha de inicio</FormLabel>
                <FormControl
                  type="datetime-local"
                  name="start"
                  value={moment(eventForm.start).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => handleDateChange('start', new Date(e.target.value))}
                  required
                />
              </FormSection>
              
              <FormSection>
                <FormLabel>Fecha de fin</FormLabel>
                <FormControl
                  type="datetime-local"
                  name="end"
                  value={moment(eventForm.end).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => handleDateChange('end', new Date(e.target.value))}
                  required
                />
              </FormSection>
              
              <FormSection>
                <FormCheck
                  type="checkbox"
                  label="Todo el día"
                  name="allDay"
                  checked={eventForm.allDay}
                  onChange={handleCheckboxChange}
                />
              </FormSection>
              
              <FormSection>
                <FormLabel>Tipo de evento</FormLabel>
                <FormSelect
                  name="type"
                  value={eventForm.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setEventForm(prev => ({
                      ...prev,
                      type: newType,
                      color: getDefaultColorForType(newType)
                    }));
                  }}
                >
                  <option value="meeting">Reunión</option>
                  <option value="task">Tarea</option>
                  <option value="deadline">Fecha Límite</option>
                  <option value="training">Capacitación</option>
                  <option value="license">Licencia</option>
                </FormSelect>
              </FormSection>
              
              <FormSection>
                <FormLabel>Color del evento</FormLabel>
                <div className="d-flex align-items-center">
                  <input
                    type="color"
                    name="color"
                    value={eventForm.color}
                    onChange={handleFormChange}
                    style={{ width: '50px', height: '38px', padding: '0', marginRight: '10px' }}
                  />
                  <FormControl
                    type="text"
                    name="color"
                    value={eventForm.color}
                    onChange={handleFormChange}
                    placeholder="#5c6bc0"
                  />
                </div>
              </FormSection>
              
              <FormSection>
                <FormLabel>Descripción</FormLabel>
                <FormControl
                  as="textarea"
                  rows={3}
                  name="description"
                  value={eventForm.description}
                  onChange={handleFormChange}
                  placeholder="Descripción del evento"
                />
              </FormSection>
              
              <FormSection>
                <FormLabel>Ubicación</FormLabel>
                <FormControl
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleFormChange}
                  placeholder="Ubicación del evento"
                />
              </FormSection>
              
              <FormSection>
                <FormLabel>Proyecto</FormLabel>
                <FormControl
                  type="text"
                  name="project"
                  value={eventForm.project}
                  onChange={handleFormChange}
                  placeholder="Proyecto relacionado"
                />
              </FormSection>
              
              <FormSection>
                <FormLabel>Participantes</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Ingrese nombres separados por comas"
                  value={eventForm.participants.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const participants = value.split(',').map(p => p.trim()).filter(p => p !== '');
                    setEventForm(prev => ({
                      ...prev,
                      participants
                    }));
                  }}
                />
                <Form.Text className="text-muted">
                  Ingrese los nombres separados por comas
                </Form.Text>
              </FormSection>
            </FormContainer>
          </Modal.Body>
          <Modal.Footer>
            {isEditing && (
              <Button 
                variant="danger" 
                outline 
                className="me-auto"
                onClick={() => {
                  setShowEventModal(false);
                  setShowDeleteModal(true);
                }}
              >
                Eliminar
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowEventModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveEvent}
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      
      {/* Modal para confirmar eliminación */}
      {showDeleteModal && (
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          size="sm"
        >
          <Modal.Header onClose={() => setShowDeleteModal(false)}>
            Confirmar Eliminación
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-4">
              <div className="d-inline-flex justify-content-center align-items-center bg-danger bg-opacity-10 p-3 rounded-circle mb-3">
                <FaCalendarAlt size={24} className="text-danger" />
              </div>
              <h5>¿Está seguro de que desea eliminar el evento?</h5>
              <p className="text-muted">"{selectedEvent?.title}"</p>
              <p className="text-danger small">Esta acción no se puede deshacer.</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteEvent}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      
      {/* Modal para detalles de eventos */}
      {showDetailsModal && (
        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          size="lg"
        >
          <Modal.Header onClose={() => setShowDetailsModal(false)}>
            Detalles del evento
          </Modal.Header>
          <Modal.Body>
            {selectedEvent && (
              <EventDetailCard eventType={selectedEvent.type}>
                <EventDetailHeader eventType={selectedEvent.type}>
                  <EventDetailTitle>
                    {selectedEvent.title}
                  </EventDetailTitle>
                  <EventTypeBadge eventType={selectedEvent.type}>
                    {getEventTypeName(selectedEvent.type)}
                  </EventTypeBadge>
                </EventDetailHeader>
                <EventDetailBody>
                  <EventDetailSection>
                    <EventDetailLabel eventType={selectedEvent.type}>
                      <FaCalendarAlt size={16} />
                      Fecha
                    </EventDetailLabel>
                    <EventDetailValue>
                      {formatEventDate(selectedEvent.start, selectedEvent.end, selectedEvent.allDay)}
                    </EventDetailValue>
                  </EventDetailSection>
                  
                  {selectedEvent.location && (
                    <EventDetailSection>
                      <EventDetailLabel eventType={selectedEvent.type}>
                        <FaMapMarkerAlt size={16} />
                        Ubicación
                      </EventDetailLabel>
                      <EventDetailValue>
                        {selectedEvent.location}
                      </EventDetailValue>
                    </EventDetailSection>
                  )}
                  
                  {selectedEvent.project && (
                    <EventDetailSection>
                      <EventDetailLabel eventType={selectedEvent.type}>
                        <FaProjectDiagram size={16} />
                        Proyecto
                      </EventDetailLabel>
                      <EventDetailValue>
                        {selectedEvent.project}
                      </EventDetailValue>
                    </EventDetailSection>
                  )}
                  
                  {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                    <EventDetailSection>
                      <EventDetailLabel eventType={selectedEvent.type}>
                        <FaUsers size={16} />
                        Participantes
                      </EventDetailLabel>
                      <ParticipantsList eventType={selectedEvent.type}>
                        {selectedEvent.participants.map((participant, index) => (
                          <li key={index}>{participant}</li>
                        ))}
                      </ParticipantsList>
                    </EventDetailSection>
                  )}
                  
                  {selectedEvent.description && (
                    <EventDetailSection>
                      <EventDetailLabel eventType={selectedEvent.type}>
                        <FaFileAlt size={16} />
                        Descripción
                      </EventDetailLabel>
                      <EventDetailDescription>
                        {selectedEvent.description}
                      </EventDetailDescription>
                    </EventDetailSection>
                  )}
                </EventDetailBody>
                <EventDetailFooter>
                  <Button 
                    variant="danger" 
                    outline 
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDeleteModal(true);
                    }}
                  >
                    Eliminar
                  </Button>
                  <Button variant="primary" onClick={handleEditFromDetails}>
                    Editar Evento
                  </Button>
                </EventDetailFooter>
              </EventDetailCard>
            )}
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default CalendarPage;