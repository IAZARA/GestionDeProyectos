import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Alert, Image, Spinner, Nav } from 'react-bootstrap';
import styled from 'styled-components';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaUserTie, 
  FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaEdit,
  FaSave, FaKey, FaLock, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ImageUploader from '../../components/common/ImageUploader';

const PageContainer = styled(Container)`
  padding: 1.5rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  color: #1a237e;
  font-weight: 700;
  position: relative;
  padding-bottom: 12px;
  font-size: 2.2rem;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 70px;
    height: 4px;
    background: linear-gradient(90deg, #3949ab, #5c6bc0);
    border-radius: 2px;
  }
`;

const ProfileCard = styled(Card)`
  margin-bottom: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionCard = styled(Card)`
  margin-bottom: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    padding: 1rem;
    text-align: center;
  }
  
  .card-body {
    padding: 2rem;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2rem;
  border-bottom: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileImageContainer = styled.div`
  margin-right: 2rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
  margin-right: 1.5rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1.5rem;
    width: 100%;
  }
`;

const ProfileName = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 0.3rem;
`;

const ProfileRole = styled.div`
  font-size: 1.2rem;
  color: #5c6bc0;
  margin-bottom: 0.8rem;
  font-weight: 500;
`;

const ProfileMeta = styled.div`
  display: flex;
  align-items: center;
  color: #616161;
  font-size: 1rem;
`;

const StyledNav = styled(Nav)`
  margin-bottom: 1rem;
  border-bottom: none;
  
  .nav-link {
    color: #5c6bc0;
    border: none;
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(92, 107, 192, 0.1);
    }
    
    &.active {
      color: #3949ab;
      font-weight: 600;
      background-color: rgba(92, 107, 192, 0.1);
      border-bottom: 2px solid #3949ab;
    }
  }
`;

const ActionButton = styled(Button)`
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, #3949ab, #5c6bc0);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #303f9f, #3949ab);
    }
  }
`;

const SaveButton = styled(ActionButton)`
  margin-top: 2rem;
  min-width: 220px;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
`;

const FormSectionTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a237e;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InputGroup = styled(Form.Group)`
  margin-bottom: 2rem;
  padding: 0 1.5rem;
  
  label {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    font-weight: 500;
    color: #424242;
    font-size: 1.05rem;
  }
  
  input, select, textarea {
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    padding: 1rem;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: ${props => props.disabled ? '#f5f5f5' : 'white'};
    
    &:focus {
      border-color: #3949ab;
      box-shadow: 0 0 0 0.2rem rgba(57, 73, 171, 0.25);
    }
    
    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
`;

const PasswordField = styled.div`
  position: relative;
  
  .form-control {
    padding-right: 40px;
  }
  
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #757575;
    cursor: pointer;
    
    &:hover {
      color: #3949ab;
    }
    
    &:focus {
      outline: none;
    }
  }
`;

const defaultProfileImage = 'https://via.placeholder.com/150';

const ProfilePage = () => {
  const { currentUser, updateProfileImage } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
    birthDate: '',
    address: '',
    position: '',
    department: '',
    location: '',
    hireDate: '',
    profileImage: defaultProfileImage
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    const loadProfileData = () => {
      setLoading(true);
      setTimeout(() => {
        setProfileData({
          firstName: currentUser?.firstName || 'Usuario',
          lastName: currentUser?.lastName || '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          document: currentUser?.document || '',
          birthDate: currentUser?.birthDate || '',
          address: currentUser?.address || '',
          position: currentUser?.position || 'Usuario',
          department: currentUser?.department || 'General',
          location: currentUser?.location || 'Sede Principal',
          hireDate: currentUser?.hireDate || '',
          profileImage: currentUser?.profileImage || defaultProfileImage
        });
        setLoading(false);
      }, 500);
    };
    
    loadProfileData();
  }, [currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de actualización del perfil
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente'
      });
      setEditMode(false);
      setLoading(false);
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }, 1000);
  };
  
  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({
        type: 'danger',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Contraseña actualizada correctamente'
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }, 1000);
  };
  
  const handleProfileImageChange = async (file, preview) => {
    setProfileData(prev => ({
      ...prev,
      profileImage: preview
    }));
    
    if (preview) {
      try {
        setLoading(true);
        const result = await updateProfileImage(preview);
        setLoading(false);
        
        if (result.success) {
          setMessage({
            type: 'success',
            text: 'Imagen de perfil actualizada correctamente'
          });
        } else {
          setMessage({
            type: 'danger',
            text: 'Error al actualizar la imagen de perfil'
          });
        }
      } catch (error) {
        setLoading(false);
        console.error('Error al actualizar imagen:', error);
        setMessage({
          type: 'danger',
          text: 'Error al actualizar la imagen de perfil'
        });
      }
    }
    
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    // Limpiar cualquier mensaje al cambiar el modo de edición
    setMessage({ type: '', text: '' });
  };
  
  if (loading && !profileData.firstName) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  
  return (
    <PageContainer>
      <Title>Mi Perfil</Title>
      
      {message.text && (
        <Alert 
          variant={message.type} 
          className="mb-4"
          dismissible
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}
      
      <ProfileCard>
        <Card.Body>
          <ProfileHeader>
            <ProfileImageContainer>
              <ImageUploader 
                currentImage={profileData.profileImage}
                onImageChange={handleProfileImageChange}
                size="150px"
              />
            </ProfileImageContainer>
            
            <ProfileInfo>
              <ProfileName>{`${profileData.firstName} ${profileData.lastName}`}</ProfileName>
              <ProfileRole>{profileData.position}</ProfileRole>
              <ProfileMeta>
                <IconWrapper><FaBuilding /></IconWrapper>
                {profileData.department} | 
                <IconWrapper style={{marginLeft: '8px'}}><FaMapMarkerAlt /></IconWrapper>
                {profileData.location}
              </ProfileMeta>
            </ProfileInfo>
            
            <div>
              {!editMode ? (
                <Button 
                  primary
                  onClick={toggleEditMode}
                >
                  <IconWrapper><FaEdit /></IconWrapper>
                  Editar Perfil
                </Button>
              ) : (
                <Button 
                  secondary
                  onClick={toggleEditMode}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </ProfileHeader>
        </Card.Body>
      </ProfileCard>
      
      <Form onSubmit={handleProfileUpdate}>
        <Row>
          <Col md={6}>
            <SectionCard>
              <Card.Header>
                <FormSectionTitle>
                  <IconWrapper><FaUser /></IconWrapper>
                  Información Personal
                </FormSectionTitle>
              </Card.Header>
              <Card.Body>
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaUser /></IconWrapper>
                    Nombre
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaUser /></IconWrapper>
                    Apellido
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaEnvelope /></IconWrapper>
                    Correo Electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaPhone /></IconWrapper>
                    Teléfono
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
              </Card.Body>
            </SectionCard>
          </Col>
          
          <Col md={6}>
            <SectionCard>
              <Card.Header>
                <FormSectionTitle>
                  <IconWrapper><FaIdCard /></IconWrapper>
                  Información Adicional
                </FormSectionTitle>
              </Card.Header>
              <Card.Body>
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaIdCard /></IconWrapper>
                    DNI/Documento
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="document"
                    value={profileData.document}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaCalendarAlt /></IconWrapper>
                    Fecha de Nacimiento
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaMapMarkerAlt /></IconWrapper>
                    Dirección
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
              </Card.Body>
            </SectionCard>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <SectionCard>
              <Card.Header>
                <FormSectionTitle>
                  <IconWrapper><FaUserTie /></IconWrapper>
                  Información Laboral
                </FormSectionTitle>
              </Card.Header>
              <Card.Body>
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaUserTie /></IconWrapper>
                    Cargo
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaBuilding /></IconWrapper>
                    Departamento
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaMapMarkerAlt /></IconWrapper>
                    Ubicación
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
                
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaCalendarAlt /></IconWrapper>
                    Fecha de Ingreso
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="hireDate"
                    value={profileData.hireDate}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </InputGroup>
              </Card.Body>
            </SectionCard>
          </Col>
        </Row>
        
        {editMode && (
          <div className="d-flex justify-content-center mt-4 mb-4">
            <SaveButton 
              primary
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <IconWrapper><FaSave /></IconWrapper>
                  Guardar Todos los Cambios
                </>
              )}
            </SaveButton>
          </div>
        )}
      </Form>
      
      <SectionCard>
        <Card.Header>
          <FormSectionTitle>
            <IconWrapper><FaKey /></IconWrapper>
            Seguridad
          </FormSectionTitle>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handlePasswordUpdate}>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaLock /></IconWrapper>
                    Contraseña Actual
                  </Form.Label>
                  <PasswordField>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <button 
                      type="button" 
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </PasswordField>
                </InputGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaLock /></IconWrapper>
                    Nueva Contraseña
                  </Form.Label>
                  <PasswordField>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </PasswordField>
                </InputGroup>
              </Col>
              
              <Col md={6}>
                <InputGroup>
                  <Form.Label>
                    <IconWrapper><FaLock /></IconWrapper>
                    Confirmar Nueva Contraseña
                  </Form.Label>
                  <PasswordField>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </PasswordField>
                </InputGroup>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-center mt-4">
              <ActionButton 
                primary
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Actualizando contraseña...
                  </>
                ) : (
                  <>
                    <IconWrapper><FaKey /></IconWrapper>
                    Cambiar Contraseña
                  </>
                )}
              </ActionButton>
            </div>
          </Form>
        </Card.Body>
      </SectionCard>
    </PageContainer>
  );
};

export default ProfilePage;