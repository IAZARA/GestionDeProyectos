import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import API from '../../../services/api';
import { FaEdit, FaSearch, FaEye } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
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

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  min-width: 1200px;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-weight: 600;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  color: #303f9f;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #757575;
  
  &:hover {
    color: #303f9f;
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

const Input = styled(Field)`
  width: 100%;
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

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormCol = styled.div`
  flex: 1;
`;

const NoData = styled.div`
  text-align: center;
  padding: 2rem;
  color: #757575;
  font-style: italic;
`;

const PersonalInfoManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  // Esquema de validación para el formulario
  const personalInfoSchema = Yup.object().shape({
    firstName: Yup.string().required('El nombre es requerido'),
    lastName: Yup.string().required('El apellido es requerido'),
    email: Yup.string().email('Email inválido').required('El email es requerido'),
    dateOfBirth: Yup.date().nullable(),
    idNumber: Yup.string(),
    taxId: Yup.string(),
    address: Yup.object().shape({
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      postalCode: Yup.string(),
      country: Yup.string()
    }),
    primaryPhone: Yup.string(),
    alternatePhone: Yup.string(),
    department: Yup.string(),
    position: Yup.string(),
    workAddress: Yup.object().shape({
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      postalCode: Yup.string()
    }),
    workPhone: Yup.string(),
    drivingLicense: Yup.object().shape({
      number: Yup.string(),
      expiryDate: Yup.date().nullable(),
      class: Yup.string()
    }),
    bloodType: Yup.string()
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.idNumber && user.idNumber.includes(searchTerm)) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Función para obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/users');
      
      // Asegurarse de que response.data sea un array
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si es un objeto con una propiedad que contiene el array de usuarios
        if (Array.isArray(response.data.users)) {
          usersData = response.data.users;
        } else {
          console.error('La respuesta no contiene un array de usuarios:', response.data);
        }
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
      }
      
      setUsers(usersData);
      setFilteredUsers(usersData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error al cargar los usuarios:', err);
      setError('Error al cargar los usuarios. Por favor, intenta nuevamente.');
      setUsers([]);
      setFilteredUsers([]);
      setIsLoading(false);
    }
  };

  // Función para abrir el modal de edición
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setViewMode(false);
    setShowModal(true);
  };

  // Función para abrir el modal de visualización
  const handleViewUser = (user) => {
    setCurrentUser(user);
    setViewMode(true);
    setShowModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
  };

  // Función para actualizar la información de un usuario
  const handleUpdateUser = async (values) => {
    try {
      // Transformar los datos para que coincidan con la estructura esperada por el backend
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        idNumber: values.idNumber,
        taxId: values.taxId,
        address: values.address,
        primaryPhone: values.primaryPhone,
        alternatePhone: values.alternatePhone,
        department: values.department,
        position: values.position,
        workAddress: values.workAddress,
        workPhone: values.workPhone,
        drivingLicense: values.drivingLicense,
        bloodType: values.bloodType
      };

      await API.put(`/users/${currentUser._id}`, userData);
      fetchUsers(); // Recargar la lista de usuarios
      handleCloseModal();
    } catch (err) {
      console.error('Error al actualizar el usuario:', err);
      setError('Error al actualizar el usuario. Por favor, intenta nuevamente.');
    }
  };

  // Función para formatear la fecha
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return '';
    }
  };

  // Si está cargando, mostrar indicador de carga
  if (isLoading) {
    return (
      <Container>
        <SectionTitle>Información Personal</SectionTitle>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #303f9f', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem' }}>Cargando información...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </Container>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <Container>
        <SectionTitle>Información Personal</SectionTitle>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f' }}>
          <p>{error}</p>
          <Button $primary onClick={fetchUsers} style={{ margin: '1rem auto' }}>Reintentar</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle>Información Personal</SectionTitle>
      
      {/* Barra de búsqueda */}
      <SearchBar>
        <SearchInput 
          type="text" 
          placeholder="Buscar por nombre, apellido, email, DNI o dependencia..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button $secondary onClick={() => setSearchTerm('')}>
          <FaSearch /> Buscar
        </Button>
      </SearchBar>
      
      {/* Tabla de información personal */}
      {filteredUsers.length > 0 ? (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Nombre y Apellido</Th>
                <Th>Fecha de Nacimiento</Th>
                <Th>DNI/CUIT</Th>
                <Th>Domicilio</Th>
                <Th>Celular</Th>
                <Th>Tel. Alternativo</Th>
                <Th>Email</Th>
                <Th>Dependencia</Th>
                <Th>Tel. Dependencia</Th>
                <Th>Dir. Dependencia</Th>
                <Th>Registro Automotor</Th>
                <Th>Grupo Sanguíneo</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <Td>{`${user.firstName} ${user.lastName}`}</Td>
                  <Td>{formatDate(user.dateOfBirth)}</Td>
                  <Td>{user.idNumber || user.taxId || '-'}</Td>
                  <Td>
                    {user.address?.street 
                      ? `${user.address.street}, ${user.address.city || ''} ${user.address.state || ''}`
                      : '-'}
                  </Td>
                  <Td>{user.primaryPhone || '-'}</Td>
                  <Td>{user.alternatePhone || '-'}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.department || '-'}</Td>
                  <Td>{user.workPhone || '-'}</Td>
                  <Td>
                    {user.workAddress?.street 
                      ? `${user.workAddress.street}, ${user.workAddress.city || ''}`
                      : '-'}
                  </Td>
                  <Td>{user.drivingLicense?.number || '-'}</Td>
                  <Td>{user.bloodType || '-'}</Td>
                  <Td>
                    <Button size="small" $secondary onClick={() => handleViewUser(user)} title="Ver detalles">
                      <FaEye />
                    </Button>
                    <Button size="small" $secondary onClick={() => handleEditUser(user)} title="Editar" style={{ marginLeft: '0.5rem' }}>
                      <FaEdit />
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      ) : (
        <NoData>No se encontraron usuarios con la búsqueda actual.</NoData>
      )}
      
      {/* Modal para editar o ver información personal */}
      {showModal && currentUser && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {viewMode 
                  ? `Información de ${currentUser.firstName} ${currentUser.lastName}`
                  : `Editar información de ${currentUser.firstName} ${currentUser.lastName}`}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>
            
            <Formik
              initialValues={{
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
                idNumber: currentUser.idNumber || '',
                taxId: currentUser.taxId || '',
                address: {
                  street: currentUser.address?.street || '',
                  city: currentUser.address?.city || '',
                  state: currentUser.address?.state || '',
                  postalCode: currentUser.address?.postalCode || '',
                  country: currentUser.address?.country || ''
                },
                primaryPhone: currentUser.primaryPhone || '',
                alternatePhone: currentUser.alternatePhone || '',
                department: currentUser.department || '',
                position: currentUser.position || '',
                workAddress: {
                  street: currentUser.workAddress?.street || '',
                  city: currentUser.workAddress?.city || '',
                  state: currentUser.workAddress?.state || '',
                  postalCode: currentUser.workAddress?.postalCode || ''
                },
                workPhone: currentUser.workPhone || '',
                drivingLicense: {
                  number: currentUser.drivingLicense?.number || '',
                  expiryDate: currentUser.drivingLicense?.expiryDate 
                    ? new Date(currentUser.drivingLicense.expiryDate).toISOString().split('T')[0] 
                    : '',
                  class: currentUser.drivingLicense?.class || ''
                },
                bloodType: currentUser.bloodType || ''
              }}
              validationSchema={personalInfoSchema}
              onSubmit={handleUpdateUser}
            >
              {({ isSubmitting }) => (
                <Form>
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input 
                          type="text" 
                          id="firstName" 
                          name="firstName" 
                          disabled={viewMode}
                        />
                        <ErrorMessage name="firstName" component={ErrorText} />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input 
                          type="text" 
                          id="lastName" 
                          name="lastName" 
                          disabled={viewMode}
                        />
                        <ErrorMessage name="lastName" component={ErrorText} />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          type="email" 
                          id="email" 
                          name="email" 
                          disabled={viewMode}
                        />
                        <ErrorMessage name="email" component={ErrorText} />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                        <Input 
                          type="date" 
                          id="dateOfBirth" 
                          name="dateOfBirth" 
                          disabled={viewMode}
                        />
                        <ErrorMessage name="dateOfBirth" component={ErrorText} />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="idNumber">DNI</Label>
                        <Input 
                          type="text" 
                          id="idNumber" 
                          name="idNumber" 
                          disabled={viewMode}
                        />
                        <ErrorMessage name="idNumber" component={ErrorText} />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="taxId">CUIT</Label>
                        <Input 
                          type="text" 
                          id="taxId" 
                          name="taxId" 
                          disabled={viewMode}
                        />
                        <ErrorMessage name="taxId" component={ErrorText} />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  <SectionTitle>Información de Contacto</SectionTitle>
                  
                  <FormGroup>
                    <Label htmlFor="address.street">Domicilio</Label>
                    <Input 
                      type="text" 
                      id="address.street" 
                      name="address.street" 
                      placeholder="Calle y número" 
                      disabled={viewMode}
                    />
                  </FormGroup>
                  
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="address.city">Ciudad</Label>
                        <Input 
                          type="text" 
                          id="address.city" 
                          name="address.city" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="address.state">Provincia</Label>
                        <Input 
                          type="text" 
                          id="address.state" 
                          name="address.state" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="address.postalCode">Código Postal</Label>
                        <Input 
                          type="text" 
                          id="address.postalCode" 
                          name="address.postalCode" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="primaryPhone">Celular</Label>
                        <Input 
                          type="text" 
                          id="primaryPhone" 
                          name="primaryPhone" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="alternatePhone">Teléfono Alternativo</Label>
                        <Input 
                          type="text" 
                          id="alternatePhone" 
                          name="alternatePhone" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  <SectionTitle>Información Laboral</SectionTitle>
                  
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="department">Dependencia</Label>
                        <Input 
                          type="text" 
                          id="department" 
                          name="department" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="position">Cargo</Label>
                        <Input 
                          type="text" 
                          id="position" 
                          name="position" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  <FormGroup>
                    <Label htmlFor="workAddress.street">Dirección de Dependencia</Label>
                    <Input 
                      type="text" 
                      id="workAddress.street" 
                      name="workAddress.street" 
                      placeholder="Calle y número" 
                      disabled={viewMode}
                    />
                  </FormGroup>
                  
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="workAddress.city">Ciudad</Label>
                        <Input 
                          type="text" 
                          id="workAddress.city" 
                          name="workAddress.city" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="workPhone">Teléfono de Dependencia</Label>
                        <Input 
                          type="text" 
                          id="workPhone" 
                          name="workPhone" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  <SectionTitle>Información Adicional</SectionTitle>
                  
                  <FormRow>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="drivingLicense.number">Número de Registro Automotor</Label>
                        <Input 
                          type="text" 
                          id="drivingLicense.number" 
                          name="drivingLicense.number" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                    <FormCol>
                      <FormGroup>
                        <Label htmlFor="bloodType">Grupo Sanguíneo</Label>
                        <Input 
                          type="text" 
                          id="bloodType" 
                          name="bloodType" 
                          disabled={viewMode}
                        />
                      </FormGroup>
                    </FormCol>
                  </FormRow>
                  
                  {!viewMode && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                      <Button type="button" $secondary onClick={handleCloseModal}>
                        Cancelar
                      </Button>
                      <Button type="submit" $primary disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  )}
                  
                  {viewMode && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                      <Button type="button" $primary onClick={handleCloseModal}>
                        Cerrar
                      </Button>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PersonalInfoManagement;
