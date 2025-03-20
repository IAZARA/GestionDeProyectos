import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Button, Form, Row, Col, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaSave, FaBuilding, FaUsers, FaShieldAlt, FaBell, FaEnvelope } from 'react-icons/fa';

const StyledCard = styled(Card)`
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h5`
  display: flex;
  align-items: center;
  color: #3949ab;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
  color: #5c6bc0;
`;

const FormLabel = styled(Form.Label)`
  font-weight: 600;
  color: #3949ab;
`;

const TabContent = styled.div`
  padding: 1.5rem 0;
`;

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('organization');
  
  // Configuración de la organización
  const [orgSettings, setOrgSettings] = useState({
    companyName: 'Mi Empresa S.A.',
    taxId: '30-12345678-9',
    address: 'Av. Corrientes 1234, CABA',
    phone: '+54 11 1234-5678',
    email: 'info@miempresa.com',
    website: 'www.miempresa.com',
    logo: '',
    fiscalYear: '01-01'
  });
  
  // Configuración de usuarios
  const [userSettings, setUserSettings] = useState({
    defaultRole: 'Usuario',
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });
  
  // Configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemNotifications: true,
    dailyDigest: false,
    notifyOnNewUser: true,
    notifyOnLicenseRequest: true,
    notifyOnDocumentUpload: false
  });
  
  useEffect(() => {
    // Simular carga de configuración
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleOrgInputChange = (e) => {
    const { name, value } = e.target;
    setOrgSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordPolicyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserSettings(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  const handleUserSettingsChange = (e) => {
    const { name, value } = e.target;
    setUserSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular guardado
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Configuración guardada correctamente'
      });
      setLoading(false);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }, 1000);
  };
  
  if (loading && !orgSettings.companyName) {
    return <Spinner animation="border" variant="primary" />;
  }
  
  return (
    <div>
      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab 
          eventKey="organization" 
          title={
            <span>
              <IconWrapper><FaBuilding /></IconWrapper>
              Organización
            </span>
          }
        >
          <TabContent>
            <Form onSubmit={handleSubmit}>
              <StyledCard>
                <Card.Body>
                  <CardTitle>
                    <IconWrapper><FaBuilding /></IconWrapper>
                    Información de la Empresa
                  </CardTitle>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Nombre de la Empresa</FormLabel>
                        <Form.Control
                          type="text"
                          name="companyName"
                          value={orgSettings.companyName}
                          onChange={handleOrgInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>CUIT/RUT</FormLabel>
                        <Form.Control
                          type="text"
                          name="taxId"
                          value={orgSettings.taxId}
                          onChange={handleOrgInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Dirección</FormLabel>
                    <Form.Control
                      type="text"
                      name="address"
                      value={orgSettings.address}
                      onChange={handleOrgInputChange}
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Teléfono</FormLabel>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={orgSettings.phone}
                          onChange={handleOrgInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Email</FormLabel>
                        <Form.Control
                          type="email"
                          name="email"
                          value={orgSettings.email}
                          onChange={handleOrgInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Sitio Web</FormLabel>
                        <Form.Control
                          type="text"
                          name="website"
                          value={orgSettings.website}
                          onChange={handleOrgInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Inicio Año Fiscal (DD-MM)</FormLabel>
                        <Form.Control
                          type="text"
                          name="fiscalYear"
                          value={orgSettings.fiscalYear}
                          onChange={handleOrgInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Logo de la Empresa</FormLabel>
                    <Form.Control
                      type="file"
                      name="logo"
                      onChange={(e) => console.log(e.target.files[0])}
                    />
                    <Form.Text className="text-muted">
                      Formatos aceptados: JPG, PNG. Tamaño máximo: 2MB
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </StyledCard>
              
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <IconWrapper><FaSave /></IconWrapper>
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </TabContent>
        </Tab>
        
        <Tab 
          eventKey="users" 
          title={
            <span>
              <IconWrapper><FaUsers /></IconWrapper>
              Usuarios
            </span>
          }
        >
          <TabContent>
            <Form onSubmit={handleSubmit}>
              <StyledCard>
                <Card.Body>
                  <CardTitle>
                    <IconWrapper><FaUsers /></IconWrapper>
                    Configuración de Usuarios
                  </CardTitle>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Rol Predeterminado para Nuevos Usuarios</FormLabel>
                    <Form.Select
                      name="defaultRole"
                      value={userSettings.defaultRole}
                      onChange={handleUserSettingsChange}
                    >
                      <option value="Usuario">Usuario</option>
                      <option value="Editor">Editor</option>
                      <option value="Administrador">Administrador</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Tiempo de Inactividad para Cierre de Sesión (minutos)</FormLabel>
                    <Form.Control
                      type="number"
                      name="sessionTimeout"
                      value={userSettings.sessionTimeout}
                      onChange={handleUserSettingsChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Intentos Máximos de Inicio de Sesión</FormLabel>
                    <Form.Control
                      type="number"
                      name="maxLoginAttempts"
                      value={userSettings.maxLoginAttempts}
                      onChange={handleUserSettingsChange}
                    />
                  </Form.Group>
                </Card.Body>
              </StyledCard>
              
              <StyledCard>
                <Card.Body>
                  <CardTitle>
                    <IconWrapper><FaShieldAlt /></IconWrapper>
                    Política de Contraseñas
                  </CardTitle>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Longitud Mínima</FormLabel>
                    <Form.Control
                      type="number"
                      name="minLength"
                      value={userSettings.passwordPolicy.minLength}
                      onChange={handlePasswordPolicyChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Expiración de Contraseña (días)</FormLabel>
                    <Form.Control
                      type="number"
                      name="expirationDays"
                      value={userSettings.passwordPolicy.expirationDays}
                      onChange={handlePasswordPolicyChange}
                    />
                    <Form.Text className="text-muted">
                      0 = Sin expiración
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Requerir letras mayúsculas"
                      name="requireUppercase"
                      checked={userSettings.passwordPolicy.requireUppercase}
                      onChange={handlePasswordPolicyChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Requerir letras minúsculas"
                      name="requireLowercase"
                      checked={userSettings.passwordPolicy.requireLowercase}
                      onChange={handlePasswordPolicyChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Requerir números"
                      name="requireNumbers"
                      checked={userSettings.passwordPolicy.requireNumbers}
                      onChange={handlePasswordPolicyChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Requerir caracteres especiales"
                      name="requireSpecialChars"
                      checked={userSettings.passwordPolicy.requireSpecialChars}
                      onChange={handlePasswordPolicyChange}
                    />
                  </Form.Group>
                </Card.Body>
              </StyledCard>
              
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <IconWrapper><FaSave /></IconWrapper>
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </TabContent>
        </Tab>
        
        <Tab 
          eventKey="notifications" 
          title={
            <span>
              <IconWrapper><FaBell /></IconWrapper>
              Notificaciones
            </span>
          }
        >
          <TabContent>
            <Form onSubmit={handleSubmit}>
              <StyledCard>
                <Card.Body>
                  <CardTitle>
                    <IconWrapper><FaBell /></IconWrapper>
                    Configuración de Notificaciones
                  </CardTitle>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Habilitar notificaciones por email"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Habilitar notificaciones del sistema"
                      name="systemNotifications"
                      checked={notificationSettings.systemNotifications}
                      onChange={handleNotificationChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Enviar resumen diario"
                      name="dailyDigest"
                      checked={notificationSettings.dailyDigest}
                      onChange={handleNotificationChange}
                    />
                  </Form.Group>
                </Card.Body>
              </StyledCard>
              
              <StyledCard>
                <Card.Body>
                  <CardTitle>
                    <IconWrapper><FaEnvelope /></IconWrapper>
                    Eventos de Notificación
                  </CardTitle>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Notificar cuando se registra un nuevo usuario"
                      name="notifyOnNewUser"
                      checked={notificationSettings.notifyOnNewUser}
                      onChange={handleNotificationChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Notificar sobre solicitudes de licencia"
                      name="notifyOnLicenseRequest"
                      checked={notificationSettings.notifyOnLicenseRequest}
                      onChange={handleNotificationChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Notificar cuando se sube un documento"
                      name="notifyOnDocumentUpload"
                      checked={notificationSettings.notifyOnDocumentUpload}
                      onChange={handleNotificationChange}
                    />
                  </Form.Group>
                </Card.Body>
              </StyledCard>
              
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <IconWrapper><FaSave /></IconWrapper>
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </TabContent>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
