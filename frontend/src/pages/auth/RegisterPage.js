import React from 'react';
import styled from 'styled-components';

const RegisterPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
`;

const RegisterHeader = styled.div`
  background-color: #1a237e;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  
  img {
    height: 40px;
    margin-right: 0.5rem;
  }
`;

const RegisterPageContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const RegisterWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const RegisterTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const RegisterPage = () => {
  return (
    <RegisterPageContainer>
      <RegisterHeader>
        <Logo>
          <img src="/assets/escudo.png" alt="Ministerio de Seguridad Nacional" />
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span>Ministerio de Seguridad Nacional</span>
            <span style={{fontSize: '1rem'}}>Dirección Nacional Gestión de Bases de Datos de Seguridad</span>
          </div>
        </Logo>
      </RegisterHeader>
      
      <RegisterPageContent>
        <RegisterWrapper>
          <RegisterTitle>Registro de usuario</RegisterTitle>
          <p>Esta página requiere implementación adicional.</p>
        </RegisterWrapper>
      </RegisterPageContent>
    </RegisterPageContainer>
  );
};

export default RegisterPage;