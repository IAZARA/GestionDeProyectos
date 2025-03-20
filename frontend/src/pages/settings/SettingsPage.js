import React, { useState } from 'react';
import { Container, Form, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const StyledContainer = styled(Container)`
  padding: 2rem;
  background-color: #F5F7FA;
  min-height: 100vh;
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  color: #1E3A8A;
  font-weight: 600;
  font-size: 2rem;
`;

const Subtitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #64748B;
  font-size: 1.1rem;
  font-weight: 400;
`;

const SettingsCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 1.5rem;
`;

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('es');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar la configuración
    setSuccessMessage('Configuración guardada exitosamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <StyledContainer>
      <Title>Configuración</Title>
      <Subtitle>Personaliza tu experiencia en la plataforma</Subtitle>

      <Form onSubmit={handleSaveSettings}>
        <SettingsCard>
          <h3 className="mb-4">Notificaciones</h3>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="notifications-switch"
              label="Habilitar notificaciones"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="email-notifications-switch"
              label="Recibir notificaciones por correo"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
          </Form.Group>
        </SettingsCard>

        <SettingsCard>
          <h3 className="mb-4">Apariencia</h3>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="dark-mode-switch"
              label="Modo oscuro"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
          </Form.Group>
        </SettingsCard>

        <SettingsCard>
          <h3 className="mb-4">Idioma</h3>
          <Form.Group className="mb-3">
            <Form.Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </Form.Select>
          </Form.Group>
        </SettingsCard>

        {successMessage && (
          <Alert variant="success" className="mb-3">
            {successMessage}
          </Alert>
        )}

        <Button primary type="submit">
          Guardar Cambios
        </Button>
      </Form>
    </StyledContainer>
  );
};

export default SettingsPage; 