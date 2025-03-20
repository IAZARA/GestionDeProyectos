import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import API from '../../../services/api';
import { FaEdit, FaUserPlus, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../../components/common/Button';
import { deleteUser } from '../../../services/user.service';

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #303f9f;
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
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

const Select = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #303f9f;
    box-shadow: 0 0 0 2px rgba(48, 63, 159, 0.2);
  }
`;

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Agregar estilo para el botón de eliminar
const DeleteButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
  
  &:hover {
    background-color: #bd2130;
  }
`;

// Modal de confirmación de eliminación
const ConfirmationModal = styled(Modal)``;

const ConfirmationContent = styled(ModalContent)`
  max-width: 400px;
`;

const ConfirmationIcon = styled.div`
  font-size: 3.5rem;
  color: #dc3545;
  margin-bottom: 1rem;
  text-align: center;
`;

// Esquema de validación
const userSchema = Yup.object().shape({
  firstName: Yup.string().required('El nombre es requerido'),
  lastName: Yup.string().required('El apellido es requerido'),
  email: Yup.string().email('Correo electrónico inválido').required('El correo electrónico es requerido'),
  role: Yup.string().required('El rol es requerido'),
  expertiseArea: Yup.string().required('La especialidad es requerida')
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);
  // Agregar estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  // Estado de carga para la eliminación
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users');
      // Asegurarse de que response.data sea un array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // Si es un objeto con una propiedad que contiene el array de usuarios
        if (Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          console.error('La respuesta no contiene un array de usuarios:', response.data);
          setUsers([]);
        }
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        setUsers([]);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar los usuarios. Por favor, intenta nuevamente.');
      console.error(err);
      setUsers([]); // Establecer un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Asegurarse de que users sea un array antes de filtrar
  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  const handleOpenModal = (user = null) => {
    setCurrentUser(user);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
  };
  
  const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
    try {
      console.log("Valores originales:", values);
      
      // Asegurar que role y expertiseArea sean exactamente como los espera el backend
      const userData = {
        ...values,
        // Aseguramos que role sea uno de los valores permitidos
        role: values.role === 'admin' ? 'admin' : values.role === 'gestor' ? 'manager' : 'user',
        // Aseguramos que expertiseArea sea uno de los valores permitidos
        expertiseArea: values.expertiseArea
      };

      console.log('Enviando datos de usuario:', userData);

      if (currentUser) {
        // Actualizar usuario existente
        const response = await API.put(`/users/${currentUser._id}`, userData);
        console.log("Respuesta de actualización:", response.data);
        
        if (response.status === 200) {
          // Si la actualización es exitosa, actualizamos el usuario en la lista local
          // para reflejar los cambios inmediatamente sin tener que recargar todos
          const updatedUserData = response.data.user || response.data;
          console.log("Datos actualizados del usuario:", updatedUserData);
          
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user._id === currentUser._id ? {...user, ...updatedUserData} : user
            )
          );
          
          // Forzar una recarga de todos los usuarios para asegurar datos actualizados
          setTimeout(() => {
            fetchUsers();
          }, 500);
          
          setNotification({
            type: 'success',
            message: 'Usuario actualizado correctamente'
          });
        }
      } else {
        // Crear nuevo usuario (se usará la contraseña por defecto: Minseg2025-)
        const response = await API.post('/users', {
          ...userData,
          password: 'Minseg2025-'
        });
        if (response.status === 201 || response.status === 200) {
          // Si la creación es exitosa, recargamos todos los usuarios 
          // para asegurarnos de tener la lista actualizada
          await fetchUsers();
          
          setNotification({
            type: 'success',
            message: 'Usuario creado correctamente con contraseña: Minseg2025-'
          });
        }
      }
      
      handleCloseModal();
      resetForm();
    } catch (err) {
      console.error('Error al guardar el usuario:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        if (err.response.status === 400) {
          // Error de validación
          if (err.response.data.errors) {
            // Establecer errores de campo específicos
            Object.keys(err.response.data.errors).forEach(key => {
              setFieldError(key, err.response.data.errors[key]);
            });
          } else {
            setNotification({
              type: 'error',
              message: err.response.data.message || 'Error en los datos enviados'
            });
          }
        } else if (err.response.status === 401 || err.response.status === 403) {
          setNotification({
            type: 'error',
            message: 'No tienes permisos para realizar esta acción'
          });
        } else if (err.response.status === 409) {
          setNotification({
            type: 'error',
            message: 'El email o DNI ya está en uso'
          });
        } else {
          setNotification({
            type: 'error',
            message: err.response.data.message || 'Error al guardar el usuario'
          });
        }
      } else if (err.request) {
        // La solicitud se realizó pero no se recibió respuesta
        setNotification({
          type: 'error',
          message: 'No se pudo conectar con el servidor'
        });
      } else {
        // Error al configurar la solicitud
        setNotification({
          type: 'error',
          message: 'Error al procesar la solicitud'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Función para manejar el clic en el botón de eliminar
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  
  // Función para confirmar la eliminación
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteUser(userToDelete._id);
      
      // Actualizar la lista de usuarios
      setUsers(users.filter(user => user._id !== userToDelete._id));
      
      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: `Usuario "${userToDelete.firstName} ${userToDelete.lastName}" eliminado correctamente`
      });
      
      // Cerrar el modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error al eliminar el usuario:', err);
      
      // Mostrar notificación de error
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Error al eliminar el usuario'
      });
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Función para cancelar la eliminación
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };
  
  if (loading) {
    return <Container>Cargando usuarios...</Container>;
  }
  
  if (error) {
    return <Container>{error}</Container>;
  }
  
  return (
    <Container>
      <SectionTitle>Información de Usuarios</SectionTitle>
      
      <SearchBar>
        <SearchInput 
          type="text" 
          placeholder="Buscar por nombre, apellido, email o DNI" 
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button $primary onClick={() => handleOpenModal()}>
          <FaUserPlus /> Nuevo Usuario
        </Button>
      </SearchBar>
      
      <Table>
        <thead>
          <tr>
            <Th>Nombre</Th>
            <Th>Apellido</Th>
            <Th>Email</Th>
            <Th>Rol</Th>
            <Th>Especialidad</Th>
            <Th>DNI</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <tr key={user._id}>
                <Td>{user.firstName}</Td>
                <Td>{user.lastName}</Td>
                <Td>{user.email}</Td>
                <Td>
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'manager' ? 'Gestor' : 'Usuario'}
                </Td>
                <Td>
                  {user.expertiseArea === 'administrative' ? 'Administrativo' : 
                   user.expertiseArea === 'technical' ? 'Técnico' : 
                   user.expertiseArea === 'legal' ? 'Legal' : 'Desconocido'}
                </Td>
                <Td>{user.idNumber || '-'}</Td>
                <Td>
                  <Button $secondary size="small" onClick={() => handleOpenModal(user)}>
                    <FaEdit />
                  </Button>
                  <DeleteButton size="small" onClick={() => handleDeleteClick(user)}>
                    <FaTrash />
                  </DeleteButton>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan="7" style={{ textAlign: 'center' }}>
                No se encontraron usuarios
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      
      {showModal && (
        <Modal>
          <ModalContent>
            <Formik
              initialValues={currentUser ? {
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                role: currentUser.role === 'manager' ? 'gestor' : currentUser.role || 'user',
                expertiseArea: currentUser.expertiseArea || 'administrative'
              } : {
                firstName: '',
                lastName: '',
                email: '',
                role: 'user',
                expertiseArea: 'administrative'
              }}
              validationSchema={userSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form>
                  <ModalHeader>
                    <ModalTitle>
                      {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </ModalTitle>
                  </ModalHeader>
                  
                  <ModalBody>
                    <div style={{ display: 'none' }}>
                      <pre>{JSON.stringify(values, null, 2)}</pre>
                    </div>
                    
                    <FormRow>
                      <FormGroup>
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input type="text" id="firstName" name="firstName" />
                        <ErrorMessage name="firstName" component={ErrorText} />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input type="text" id="lastName" name="lastName" />
                        <ErrorMessage name="lastName" component={ErrorText} />
                      </FormGroup>
                    </FormRow>
                    
                    <FormGroup>
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input type="email" id="email" name="email" />
                      <ErrorMessage name="email" component={ErrorText} />
                    </FormGroup>
                    
                    <FormRow>
                      <FormGroup>
                        <Label htmlFor="role">Rol</Label>
                        <Select 
                          as="select" 
                          id="role" 
                          name="role"
                          onChange={(e) => {
                            console.log("Cambiando rol a:", e.target.value);
                            setFieldValue("role", e.target.value);
                          }}
                          value={values.role}
                        >
                          <option value="admin">Administrador</option>
                          <option value="gestor">Gestor</option>
                          <option value="user">Usuario</option>
                        </Select>
                        <ErrorMessage name="role" component={ErrorText} />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="expertiseArea">Especialidad</Label>
                        <Select 
                          as="select" 
                          id="expertiseArea" 
                          name="expertiseArea"
                          onChange={(e) => {
                            console.log("Cambiando especialidad a:", e.target.value);
                            setFieldValue("expertiseArea", e.target.value);
                          }}
                          value={values.expertiseArea}
                        >
                          <option value="administrative">Administrativo</option>
                          <option value="technical">Técnico</option>
                          <option value="legal">Legal</option>
                        </Select>
                        <ErrorMessage name="expertiseArea" component={ErrorText} />
                      </FormGroup>
                    </FormRow>
                    
                    {!currentUser && (
                      <div style={{
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '5px',
                        borderLeft: '4px solid #17a2b8'
                      }}>
                        <p style={{ margin: 0, color: '#17a2b8' }}>
                          <strong>Nota:</strong> La contraseña por defecto será <code>Minseg2025-</code>
                        </p>
                      </div>
                    )}
                  </ModalBody>
                  
                  <ModalFooter>
                    <Button type="button" $secondary onClick={handleCloseModal}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      $primary 
                      disabled={isSubmitting}
                      onClick={() => {
                        console.log("Valores al enviar:", values);
                      }}
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </ModalContent>
        </Modal>
      )}
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && userToDelete && (
        <ConfirmationModal>
          <ConfirmationContent>
            <ModalHeader>
              <ModalTitle>Confirmar eliminación</ModalTitle>
            </ModalHeader>
            
            <ModalBody>
              <div style={{ textAlign: 'center' }}>
                <ConfirmationIcon>
                  <FaExclamationTriangle />
                </ConfirmationIcon>
                
                <p>¿Estás seguro de que deseas eliminar al usuario?</p>
                
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  margin: '1rem 0'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    {userToDelete.firstName} {userToDelete.lastName}
                  </p>
                  <p style={{ margin: 0 }}>{userToDelete.email}</p>
                </div>
                
                <p style={{ color: '#dc3545' }}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                $secondary 
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button 
                $danger 
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </ModalFooter>
          </ConfirmationContent>
        </ConfirmationModal>
      )}
      
      {/* Notificación */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
            zIndex: 1100
          }}
        >
          {notification.message}
          <button 
            style={{ 
              marginLeft: '1rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
    </Container>
  );
};

export default UserManagement;
