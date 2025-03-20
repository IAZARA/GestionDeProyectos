import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaTachometerAlt, FaProjectDiagram, FaTasks, FaCalendarAlt, 
         FaUsers, FaFolder, FaBook, FaChevronLeft, FaChevronRight,
         FaCog, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const SidebarContainer = styled.div`
  background-color: #f5f5f5;
  width: ${props => (props.$collapsed ? '70px' : '250px')};
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 60px; /* Altura del navbar */
  bottom: 0;
  box-shadow: 1px 0 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  z-index: 100;
  overflow-x: hidden;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: ${props => (props.$collapsed ? 'center' : 'space-between')};
  align-items: center;
  border-bottom: 1px solid #ddd;
`;

const SidebarTitle = styled.h3`
  margin: 0;
  display: ${props => (props.$collapsed ? 'none' : 'block')};
  font-size: 1.1rem;
  color: #333;
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarMenuItem = styled.li`
  margin: 0.5rem 0;
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #333;
  font-weight: ${props => (props.$active ? 'bold' : 'normal')};
  background-color: ${props => (props.$active ? '#e3f2fd' : 'transparent')};
  border-left: ${props => (props.$active ? '4px solid #1a237e' : '4px solid transparent')};
  
  &:hover {
    background-color: #e3f2fd;
  }
  
  svg {
    margin-right: ${props => (props.$collapsed ? '0' : '0.75rem')};
    font-size: 1.2rem;
  }
`;

const LinkText = styled.span`
  display: ${props => (props.$collapsed ? 'none' : 'block')};
`;

const SidebarSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
`;

const SectionTitle = styled.h4`
  padding: 0 1.5rem;
  margin: 0.5rem 0;
  color: #757575;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: ${props => (props.$collapsed ? 'none' : 'block')};
`;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isAdminArea = currentUser?.expertiseArea === 'administrative';
  
  const hasAdminAccess = isAdmin || isAdminArea;
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <SidebarContainer $collapsed={collapsed}>
      <SidebarHeader $collapsed={collapsed}>
        <SidebarTitle $collapsed={collapsed}>Menú Principal</SidebarTitle>
        <CollapseButton onClick={toggleCollapse}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </CollapseButton>
      </SidebarHeader>
      
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarLink to="/dashboard" $active={isActive('/dashboard')} $collapsed={collapsed}>
            <FaTachometerAlt />
            <LinkText $collapsed={collapsed}>Dashboard</LinkText>
          </SidebarLink>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarLink to="/projects" $active={isActive('/projects')} $collapsed={collapsed}>
            <FaProjectDiagram />
            <LinkText $collapsed={collapsed}>Proyectos</LinkText>
          </SidebarLink>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarLink to="/tasks" active={isActive('/tasks')} collapsed={collapsed}>
            <FaTasks />
            <LinkText collapsed={collapsed}>Tareas</LinkText>
          </SidebarLink>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarLink to="/calendar" active={isActive('/calendar')} collapsed={collapsed}>
            <FaCalendarAlt />
            <LinkText collapsed={collapsed}>Calendario</LinkText>
          </SidebarLink>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarLink to="/documents" active={isActive('/documents')} collapsed={collapsed}>
            <FaFolder />
            <LinkText collapsed={collapsed}>Documentos</LinkText>
          </SidebarLink>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarLink to="/wiki" active={isActive('/wiki')} collapsed={collapsed}>
            <FaBook />
            <LinkText collapsed={collapsed}>Wiki</LinkText>
          </SidebarLink>
        </SidebarMenuItem>
        
        {/* Sección de Administración - Solo visible para Admins y Gestores con área Administrativa */}
        {(isAdmin || (isManager && isAdminArea)) && (
          <SidebarSection>
            <SectionTitle collapsed={collapsed}>Administración</SectionTitle>
            
            <SidebarMenuItem>
              <SidebarLink to="/admin/users" active={isActive('/admin/users')} collapsed={collapsed}>
                <FaUsers />
                <LinkText collapsed={collapsed}>Usuarios</LinkText>
              </SidebarLink>
            </SidebarMenuItem>
            
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarLink to="/admin/roles" active={isActive('/admin/roles')} collapsed={collapsed}>
                  <FaUserShield />
                  <LinkText collapsed={collapsed}>Roles y Permisos</LinkText>
                </SidebarLink>
              </SidebarMenuItem>
            )}
            
            <SidebarMenuItem>
              <SidebarLink to="/admin/leaves" active={isActive('/admin/leaves')} collapsed={collapsed}>
                <FaCalendarAlt />
                <LinkText collapsed={collapsed}>Licencias</LinkText>
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarSection>
        )}
      </SidebarMenu>
    </SidebarContainer>
  );
};

export default Sidebar;