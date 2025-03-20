import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Row, Col, Nav, Tab, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './components/UserManagement';
import LicenseManagement from './components/LicenseManagement';
import PersonalInfoManagement from './components/PersonalInfoManagement';

const AdminContainer = styled(Container)`
  padding: 2rem 0;
`;

const AdminHeader = styled.div`
  margin-bottom: 2rem;
`;

const AdminTitle = styled.h1`
  font-size: 2rem;
  color: #303f9f;
  margin-bottom: 0.5rem;
`;

const AdminDescription = styled.p`
  color: #757575;
  font-size: 1rem;
`;

const StyledNav = styled(Nav)`
  margin-bottom: 2rem;
  border-bottom: 2px solid #3f51b5;
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 800px;
  
  .nav-link {
    color: #757575;
    font-weight: 500;
    padding: 1rem 1.5rem;
    border: none;
    text-align: center;
    transition: all 0.3s ease;
    
    &.active {
      color: #fff;
      border-bottom: none;
      background-color: #3f51b5;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    &:hover:not(.active) {
      color: #3f51b5;
      border-bottom: none;
      background-color: #e8eaf6;
    }
  }
`;

const StyledNavItem = styled(Nav.Item)`
  margin-right: 5px;
  flex: 1;
  text-align: center;
  
  .nav-link {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border: 1px solid #e0e0e0;
    border-bottom: none;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
`;

const TabContentWrapper = styled.div`
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const NoAccessMessage = styled(Alert)`
  margin-top: 2rem;
`;

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { currentUser, isLoading } = useAuth();
  
  // Definir permisos basados en el rol y área de expertise
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isAdministrative = currentUser?.expertiseArea === 'administrative';
  
  // Permisos específicos para cada pestaña
  const canAccessUserManagement = isAdmin || isManager || isAdministrative;
  const canAccessPersonalInfo = isAdmin || isManager || isAdministrative;
  const canAccessLicenseManagement = true; // Todos pueden ver, pero solo algunos pueden editar
  
  // Verificar si el usuario puede editar licencias
  const canEditLicenses = isAdmin || isManager || isAdministrative;
  
  // Si el usuario no tiene acceso a ninguna pestaña, mostrar mensaje de no acceso
  const hasAnyAccess = canAccessUserManagement || canAccessPersonalInfo || canAccessLicenseManagement;
  
  // Gestionar cambios de pestaña cuando el usuario no tiene permisos
  useEffect(() => {
    if (activeTab === 'users' && !canAccessUserManagement) {
      if (canAccessPersonalInfo) {
        setActiveTab('personal-info');
      } else if (canAccessLicenseManagement) {
        setActiveTab('licenses');
      }
    } else if (activeTab === 'personal-info' && !canAccessPersonalInfo) {
      if (canAccessUserManagement) {
        setActiveTab('users');
      } else if (canAccessLicenseManagement) {
        setActiveTab('licenses');
      }
    }
  }, [activeTab, canAccessUserManagement, canAccessPersonalInfo, canAccessLicenseManagement]);
  
  // Determinar la pestaña inicial basada en permisos
  useEffect(() => {
    if (!canAccessUserManagement && activeTab === 'users') {
      if (canAccessPersonalInfo) {
        setActiveTab('personal-info');
      } else if (canAccessLicenseManagement) {
        setActiveTab('licenses');
      }
    }
  }, [activeTab, canAccessUserManagement, canAccessPersonalInfo, canAccessLicenseManagement]);
  
  // Si está cargando, mostrar nada
  if (isLoading) return null;
  
  if (!hasAnyAccess) {
    return (
      <AdminContainer fluid>
        <AdminHeader>
          <AdminTitle>Panel de Administración</AdminTitle>
          <AdminDescription>
            Gestione usuarios, información personal y licencias del sistema
          </AdminDescription>
        </AdminHeader>
        <NoAccessMessage variant="danger">
          No tienes permisos para acceder a esta sección.
        </NoAccessMessage>
      </AdminContainer>
    );
  }
  
  return (
    <AdminContainer fluid>
      <AdminHeader>
        <AdminTitle>Panel de Administración</AdminTitle>
        <AdminDescription>
          Gestione usuarios, información personal y licencias del sistema
        </AdminDescription>
      </AdminHeader>
      
      <Tab.Container id="admin-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col>
            <StyledNav variant="tabs">
              {canAccessUserManagement && (
                <StyledNavItem>
                  <Nav.Link eventKey="users">Gestión de Usuarios</Nav.Link>
                </StyledNavItem>
              )}
              {canAccessPersonalInfo && (
                <StyledNavItem>
                  <Nav.Link eventKey="personal-info">Información del Personal</Nav.Link>
                </StyledNavItem>
              )}
              {canAccessLicenseManagement && (
                <StyledNavItem>
                  <Nav.Link eventKey="licenses">Gestión de Licencias</Nav.Link>
                </StyledNavItem>
              )}
            </StyledNav>
          </Col>
        </Row>
        <Row>
          <Col>
            <TabContentWrapper>
              <Tab.Content>
                {activeTab === 'users' && (
                  canAccessUserManagement ? (
                    <UserManagement />
                  ) : (
                    <NoAccessMessage variant="warning">
                      No tienes permisos para ver esta página.
                    </NoAccessMessage>
                  )
                )}
                
                {activeTab === 'personal-info' && (
                  canAccessPersonalInfo ? (
                    <PersonalInfoManagement />
                  ) : (
                    <NoAccessMessage variant="warning">
                      No tienes permisos para ver esta página.
                    </NoAccessMessage>
                  )
                )}
                
                {activeTab === 'licenses' && (
                  <LicenseManagement canEdit={canEditLicenses} />
                )}
              </Tab.Content>
            </TabContentWrapper>
          </Col>
        </Row>
      </Tab.Container>
    </AdminContainer>
  );
};

export default AdminPage;
