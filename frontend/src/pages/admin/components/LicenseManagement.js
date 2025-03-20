import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import API from '../../../services/api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Formik, Field, ErrorMessage, FieldArray, Form } from 'formik';
import * as Yup from 'yup';
import { format, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from '../../../components/common/Button';

const Container = styled.div`
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: #424242;
  margin-bottom: 1.5rem;
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #303f9f;
    box-shadow: 0 0 0 2px rgba(48, 63, 159, 0.2);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #303f9f;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #757575;
  
  &:hover {
    color: #424242;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #424242;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 0 1.5rem 1.5rem;
`;

const licenseSchema = Yup.object().shape({
  userId: Yup.string().required('El usuario es requerido'),
  area: Yup.string().required('El área es requerida'),
  totalDays: Yup.number().required('La cantidad de días es requerida').positive('Debe ser un número positivo'),
  fractions: Yup.array().of(
    Yup.object().shape({
      startDate: Yup.date().required('La fecha de inicio es requerida'),
      endDate: Yup.date().required('La fecha de fin es requerida'),
      days: Yup.number().required('La cantidad de días es requerida').positive('Debe ser un número positivo')
    })
  ).min(1, 'Debe haber al menos una fracción de licencia')
});

const LicenseManagement = ({ canEdit = false }) => {
  const [licenses, setLicenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentLicense, setCurrentLicense] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [licensesResponse, usersResponse] = await Promise.all([
        API.get('/licenses'),
        API.get('/users')
      ]);
      
      // Asegurarse de que las respuestas sean arrays
      let licensesData = [];
      let usersData = [];
      
      // Procesar datos de licencias
      if (Array.isArray(licensesResponse.data)) {
        licensesData = licensesResponse.data;
      } else if (licensesResponse.data && typeof licensesResponse.data === 'object') {
        if (Array.isArray(licensesResponse.data.licenses)) {
          licensesData = licensesResponse.data.licenses;
        } else {
          console.error('La respuesta no contiene un array de licencias:', licensesResponse.data);
        }
      } else {
        console.error('Formato de respuesta inesperado para licencias:', licensesResponse.data);
      }
      
      // Procesar datos de usuarios
      if (Array.isArray(usersResponse.data)) {
        usersData = usersResponse.data;
      } else if (usersResponse.data && typeof usersResponse.data === 'object') {
        if (Array.isArray(usersResponse.data.users)) {
          usersData = usersResponse.data.users;
        } else {
          console.error('La respuesta no contiene un array de usuarios:', usersResponse.data);
        }
      } else {
        console.error('Formato de respuesta inesperado para usuarios:', usersResponse.data);
      }
      
      setLicenses(licensesData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      console.error(err);
      setLicenses([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredLicenses = licenses.filter(license => {
    // Verificar que license tenga una propiedad userId válida
    if (!license || !license.userId) return false;
    
    const user = users.find(u => u && u._id === license.userId);
    
    // Si no se encuentra el usuario o license.area es undefined, excluir esta licencia
    if (!user) return false;
    if (!license.area) return false;
    
    return (
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      license.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const getUserFullName = (userId) => {
    if (!userId) return 'Usuario desconocido';
    
    const user = users.find(u => u && u._id === userId);
    return user ? `${user.name || ''} ${user.lastName || ''}`.trim() : 'Usuario desconocido';
  };
  
  const calculateRemainingDays = (license) => {
    if (!license || !license.fractions || !Array.isArray(license.fractions)) {
      return license?.totalDays || 0;
    }
    
    const usedDays = license.fractions.reduce((total, fraction) => 
      total + (fraction?.days || 0), 0);
    
    return (license.totalDays || 0) - usedDays;
  };
  
  const handleOpenModal = (license = null) => {
    setCurrentLicense(license);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentLicense(null);
  };
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (currentLicense) {
        // Actualizar licencia existente
        await API.put(`/licenses/${currentLicense._id}`, values);
      } else {
        // Crear nueva licencia
        await API.post('/licenses', values);
      }
      
      fetchData();
      handleCloseModal();
      resetForm();
    } catch (err) {
      console.error('Error al guardar la licencia:', err);
      setError('Error al guardar la licencia. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (licenseId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta licencia?')) {
      try {
        // Eliminar la licencia de la base de datos
        const response = await API.delete(`/licenses/${licenseId}`);
        
        // Si la eliminación fue exitosa, actualizar la interfaz
        if (response.status === 200) {
          // Notificar al usuario
          alert('Licencia eliminada correctamente');
          
          // Recargar los datos para actualizar la lista de licencias
          fetchData();
          
          // Forzar una actualización del calendario si está disponible
          // Esto asegura que la licencia también se elimine del calendario
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('calendarUpdate', { detail: { action: 'delete', licenseId } }));
          }
        }
      } catch (err) {
        console.error('Error al eliminar la licencia:', err);
        setError('Error al eliminar la licencia. Por favor, intenta nuevamente.');
        alert('Error al eliminar la licencia. Por favor, intenta nuevamente.');
      }
    }
  };
  
  // Función para calcular automáticamente los días entre fechas
  const calculateDaysBetweenDates = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Añadir 1 para incluir el día final
    return differenceInCalendarDays(end, start) + 1;
  };
  
  if (loading) return <div>Cargando licencias...</div>;
  
  if (error) return <div>{error}</div>;
  
  return (
    <Container>
      <SectionTitle>Gestión de Licencias</SectionTitle>
      
      <SearchBar>
        <SearchInput 
          type="text" 
          placeholder="Buscar por nombre, apellido o área..." 
          value={searchTerm}
          onChange={handleSearch}
        />
        {canEdit && (
          <Button $primary onClick={() => handleOpenModal(null)}>
            <FaPlus /> Nueva Licencia
          </Button>
        )}
      </SearchBar>
      
      <div>
        {filteredLicenses.map(license => (
          <div key={license._id}>
            <h3>{getUserFullName(license.userId)}</h3>
            {canEdit && (
              <div>
                <Button $secondary onClick={() => handleOpenModal(license)}>
                  <FaEdit /> Editar
                </Button>
                <Button $secondary $danger onClick={() => handleDelete(license._id)} style={{ marginLeft: '0.5rem' }}>
                  <FaTrash /> Eliminar
                </Button>
              </div>
            )}
            
            <div>
              <strong>Área:</strong> {license.area}
            </div>
            <div>
              <strong>Días Totales:</strong> {license.totalDays}
            </div>
            <div>
              <strong>Días Utilizados:</strong> {license.totalDays - calculateRemainingDays(license)}
            </div>
            <div>
              <strong>Días Restantes:</strong> {calculateRemainingDays(license)}
            </div>
            
            <div>
              <strong>Fracciones de Licencia:</strong>
              {license.fractions.map((fraction, idx) => (
                <div key={idx}>
                  <strong>Período:</strong> {format(new Date(fraction.startDate), 'dd/MM/yyyy', { locale: es })} - {format(new Date(fraction.endDate), 'dd/MM/yyyy', { locale: es })}
                  <br />
                  <strong>Días:</strong> {fraction.days}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredLicenses.length === 0 && (
          <div>
            No se encontraron licencias. Intenta con otra búsqueda o crea una nueva licencia.
          </div>
        )}
      </div>
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{currentLicense ? 'Editar Licencia' : 'Nueva Licencia'}</ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>
            
            <Formik
              initialValues={
                currentLicense ? 
                {
                  userId: currentLicense.userId,
                  area: currentLicense.area,
                  totalDays: currentLicense.totalDays,
                  fractions: currentLicense.fractions.map(f => ({
                    ...f,
                    startDate: f.startDate ? f.startDate.split('T')[0] : '',
                    endDate: f.endDate ? f.endDate.split('T')[0] : '',
                  }))
                } : 
                {
                  userId: '',
                  area: '',
                  totalDays: 0,
                  fractions: [{ startDate: '', endDate: '', days: 0 }]
                }
              }
              validationSchema={licenseSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  <div style={{ padding: '1.5rem' }}>
                    <FormGroup>
                      <Label htmlFor="userId">Usuario</Label>
                      <Field as="select" name="userId" id="userId">
                        <option value="">Seleccionar Usuario</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>
                            {`${user.firstName} ${user.lastName}`}
                          </option>
                        ))}
                      </Field>
                      <div>
                        <ErrorMessage name="userId" component="div" />
                      </div>
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="area">Área</Label>
                      <Field type="text" name="area" id="area" />
                      <div>
                        <ErrorMessage name="area" component="div" />
                      </div>
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="totalDays">Días Totales</Label>
                      <Field type="number" name="totalDays" id="totalDays" min="1" />
                      <div>
                        <ErrorMessage name="totalDays" component="div" />
                      </div>
                    </FormGroup>
                    
                    <FieldArray name="fractions">
                      {({ push, remove }) => (
                        <div>
                          <Label>Fracciones de Licencia</Label>
                          
                          {values.fractions.map((fraction, index) => (
                            <div key={index}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>Fracción {index + 1}</strong>
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#f44336',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                              
                              <FormGroup>
                                <Label htmlFor={`fractions.${index}.startDate`}>Fecha de Inicio</Label>
                                <Field
                                  type="date"
                                  name={`fractions.${index}.startDate`}
                                  id={`fractions.${index}.startDate`}
                                  onChange={(e) => {
                                    setFieldValue(`fractions.${index}.startDate`, e.target.value);
                                    if (values.fractions[index].endDate) {
                                      const days = calculateDaysBetweenDates(
                                        e.target.value,
                                        values.fractions[index].endDate
                                      );
                                      setFieldValue(`fractions.${index}.days`, days);
                                    }
                                  }}
                                />
                                <div>
                                  <ErrorMessage name={`fractions.${index}.startDate`} component="div" />
                                </div>
                              </FormGroup>
                              
                              <FormGroup>
                                <Label htmlFor={`fractions.${index}.endDate`}>Fecha de Fin</Label>
                                <Field
                                  type="date"
                                  name={`fractions.${index}.endDate`}
                                  id={`fractions.${index}.endDate`}
                                  onChange={(e) => {
                                    setFieldValue(`fractions.${index}.endDate`, e.target.value);
                                    if (values.fractions[index].startDate) {
                                      const days = calculateDaysBetweenDates(
                                        values.fractions[index].startDate,
                                        e.target.value
                                      );
                                      setFieldValue(`fractions.${index}.days`, days);
                                    }
                                  }}
                                />
                                <div>
                                  <ErrorMessage name={`fractions.${index}.endDate`} component="div" />
                                </div>
                              </FormGroup>
                              
                              <FormGroup>
                                <Label htmlFor={`fractions.${index}.days`}>Días</Label>
                                <Field
                                  type="number"
                                  name={`fractions.${index}.days`}
                                  id={`fractions.${index}.days`}
                                  min="1"
                                  readOnly
                                />
                                <div>
                                  <ErrorMessage name={`fractions.${index}.days`} component="div" />
                                </div>
                              </FormGroup>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            onClick={() => push({ startDate: '', endDate: '', days: 0 })}
                          >
                            <FaPlus /> Agregar Fracción
                          </Button>
                        </div>
                      )}
                    </FieldArray>
                    
                    <ButtonGroup>
                      <Button type="button" $secondary onClick={handleCloseModal}>
                        Cancelar
                      </Button>
                      <Button type="submit" $primary>
                        {currentLicense ? 'Actualizar' : 'Crear'} Licencia
                      </Button>
                    </ButtonGroup>
                  </div>
                </Form>
              )}
            </Formik>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default LicenseManagement;
