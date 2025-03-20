import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createProject } from '../../services/project.service';
import { getUsers } from '../../services/user.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormControl from '../../components/common/FormControl';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const MembersList = styled.div`
  margin-top: 1rem;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MemberName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const MemberEmail = styled.div`
  font-size: 0.875rem;
  color: #6B7280;
`;

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { canManageProjects } = useAuth();
  
  // Redireccionar si el usuario no tiene permisos
  useEffect(() => {
    if (!canManageProjects()) {
      navigate('/projects');
    }
  }, [canManageProjects, navigate]);
  
  // Obtener la fecha actual en formato YYYY-MM-DD para el valor predeterminado
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: formattedDate, // Establecer la fecha actual como valor predeterminado
    fechaFin: '',
    estado: 'pendiente',
    area: 'general',
    miembros: []
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        
        // Verificar que usersData sea un array
        if (usersData && usersData.users && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
        } else if (Array.isArray(usersData)) {
          setUsers(usersData);
        } else {
          console.error('La respuesta de getUsers no tiene el formato esperado:', usersData);
          setUsers([]);
          setError('El formato de los datos de usuarios no es válido.');
        }
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios. Por favor, inténtelo de nuevo.');
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del proyecto es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es obligatoria';
    }
    
    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (formData.fechaInicio && formData.fechaFin) {
      const start = new Date(formData.fechaInicio);
      const end = new Date(formData.fechaFin);
      
      if (end < start) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = () => {
    if (!selectedUser) return;
    
    // Verificar si el usuario ya está en la lista
    const userExists = formData.miembros.some(member => member.usuario === selectedUser);
    
    if (userExists) {
      setErrors({ ...errors, miembros: 'Este usuario ya ha sido añadido al proyecto' });
      return;
    }
    
    const newMember = {
      usuario: selectedUser,
      rol: selectedRole
    };
    
    console.log('Añadiendo miembro al proyecto:', newMember);
    
    setFormData({
      ...formData,
      miembros: [...formData.miembros, newMember]
    });
    
    setSelectedUser('');
    setSelectedRole('user');
    setErrors({ ...errors, miembros: null });
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = [...formData.miembros];
    updatedMembers.splice(index, 1);
    setFormData({ ...formData, miembros: updatedMembers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Asegurar que fechaFin tenga un valor si está vacío
      const dataToSubmit = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || formData.fechaInicio,
        estado: formData.estado || 'active',
        area: formData.area || '',
        miembros: formData.miembros || []
      };
      
      console.log('Datos a enviar:', dataToSubmit);
      console.log('Miembros a enviar:', dataToSubmit.miembros);
      
      // Validaciones adicionales antes de enviar
      if (!dataToSubmit.nombre) {
        throw new Error('El nombre del proyecto es obligatorio');
      }
      
      if (!dataToSubmit.fechaInicio) {
        throw new Error('La fecha de inicio es obligatoria');
      }
      
      const response = await createProject(dataToSubmit);
      
      if (response && response.project && response.project._id) {
        // Redireccionar al detalle del proyecto creado
        navigate(`/projects/${response.project._id}`);
      } else {
        throw new Error('No se recibió una respuesta válida del servidor');
      }
    } catch (err) {
      console.error('Error al crear el proyecto:', err);
      
      // Mostrar mensaje de error más descriptivo
      let errorMessage = 'Ocurrió un error al crear el proyecto. Por favor, inténtelo de nuevo.';
      
      if (err.message) {
        // Si el error tiene un mensaje, mostrarlo
        errorMessage = err.message;
      } else if (err.response && err.response.data) {
        // Si es un error de API con datos, extraer el mensaje
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const findUserName = (userId) => {
    if (!Array.isArray(users)) return 'Usuario';
    const user = users.find(u => u && u._id === userId);
    return user ? (user.nombre || user.name || user.firstName || 'Usuario') : 'Usuario';
  };

  const findUserEmail = (userId) => {
    if (!Array.isArray(users)) return '';
    const user = users.find(u => u && u._id === userId);
    return user ? (user.email || '') : '';
  };

  return (
    <div>
      <PageHeader>
        <PageTitle>Crear Nuevo Proyecto</PageTitle>
      </PageHeader>

      {error && (
        <Alert 
          type="error" 
          title="Error" 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <FormControl.Input 
                  id="nombre"
                  name="nombre"
                  label="Nombre del Proyecto *"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={errors.nombre}
                  placeholder="Ingrese el nombre del proyecto"
                  required
                />
                
                <FormControl.Textarea 
                  id="descripcion"
                  name="descripcion"
                  label="Descripción *"
                  value={formData.descripcion}
                  onChange={handleChange}
                  error={errors.descripcion}
                  placeholder="Describe el propósito y objetivos del proyecto"
                  required
                  rows={4}
                />
                
                <FormControl.Select
                  id="area"
                  name="area"
                  label="Área"
                  value={formData.area}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="administrativa">Administrativa</option>
                  <option value="tecnica">Técnica</option>
                  <option value="legal">Legal</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="desarrollo">Desarrollo</option>
                </FormControl.Select>
                
                <FormControl.Select
                  id="estado"
                  name="estado"
                  label="Estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="en_pausa">En Pausa</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </FormControl.Select>
              </div>
              
              <div>
                <FormControl.Input
                  id="fechaInicio"
                  name="fechaInicio"
                  label="Fecha de Inicio *"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  error={errors.fechaInicio}
                  helperText="Seleccione la fecha de inicio del proyecto"
                  required
                />
                
                <FormControl.Input
                  id="fechaFin"
                  name="fechaFin"
                  label="Fecha de Finalización"
                  type="date"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  error={errors.fechaFin}
                  min={formData.fechaInicio}
                  placeholder="dd/mm/aaaa"
                />
                
                <div>
                  <h3>Miembros del Proyecto</h3>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <FormControl.Select
                      id="selectedUser"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      error={errors.miembros}
                    >
                      <option value="">Seleccionar usuario</option>
                      {Array.isArray(users) && users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.nombre || user.name || user.firstName || 'Usuario sin nombre'}
                        </option>
                      ))}
                    </FormControl.Select>
                    
                    <FormControl.Select
                      id="selectedRole"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="user">Miembro</option>
                      <option value="manager">Responsable</option>
                    </FormControl.Select>
                    
                    <Button 
                      type="button" 
                      onClick={handleAddMember}
                      disabled={!selectedUser}
                    >
                      Añadir
                    </Button>
                  </div>
                  
                  <MembersList>
                    {formData.miembros.length > 0 ? (
                      formData.miembros.map((member, index) => (
                        <MemberItem key={index}>
                          <MemberInfo>
                            <MemberName>{findUserName(member.usuario)}</MemberName>
                            <MemberEmail>{findUserEmail(member.usuario)}</MemberEmail>
                          </MemberInfo>
                          <div>
                            <Button 
                              type="button" 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleRemoveMember(index)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </MemberItem>
                      ))
                    ) : (
                      <p>No hay miembros añadidos al proyecto</p>
                    )}
                  </MembersList>
                </div>
              </div>
            </FormGrid>
            
            <FormActions>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/projects')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
              </Button>
            </FormActions>
            
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem', textAlign: 'center' }}>
              Los campos marcados con * son obligatorios
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateProjectPage;
