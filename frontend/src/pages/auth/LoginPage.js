import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LoginForm from '../../components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  
  img {
    width: 120px;
    height: auto;
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  color: #303f9f;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const Subtitle = styled.h2`
  color: #303f9f;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: normal;
`;

const LoginFormWrapper = styled.div`
  width: 100%;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  margin-bottom: 1rem;
  text-align: center;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { error: authError } = useAuth();
  const [error, setError] = useState('');

  // Sincronizar errores del contexto de autenticación
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  return (
    <LoginPageContainer>
      <LoginCard>
        <Logo>
          <img src="/escudo HD.png" alt="Escudo" />
        </Logo>
        <Title>Dirección Nacional de Gestión de Bases de Datos de Seguridad</Title>
        <Subtitle>Ministerio de Seguridad Nacional</Subtitle>
        <LoginFormWrapper>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <LoginForm />
        </LoginFormWrapper>
      </LoginCard>
    </LoginPageContainer>
  );
};

export default LoginPage;