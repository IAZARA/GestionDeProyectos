import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaBell, FaUser, FaSignOutAlt, FaCog, 
  FaTachometerAlt, FaProjectDiagram, FaTasks, FaCalendarAlt, 
  FaFolder, FaBook, FaChevronDown, FaEnvelope, FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { Navbar as BootstrapNavbar, Container, Button } from 'react-bootstrap';
import { API_URL } from '../../config/constants';

const StyledNavbar = styled(BootstrapNavbar)`
  background-color: #1a237e;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: static;
  width: 100%;
  z-index: 1030;
  height: 65px;
`;

const BrandLogo = styled(BootstrapNavbar.Brand)`
  color: white !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  
  img {
    height: 40px;
    margin-right: 0.75rem;
  }
  
  @media (max-width: 992px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const NavContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

const NavbarRight = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const UserMenu = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    margin-right: 0.75rem;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }
  
  span {
    margin-right: 0.5rem;
    font-weight: 500;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const NotificationButton = styled(Button)`
  background: none;
  border: none;
  color: white;
  position: relative;
  padding: 0.5rem;
  margin-right: 1rem;
  
  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    box-shadow: none;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 3px;
  right: 3px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const UserDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 0;
  min-width: 220px;
  z-index: 1050;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  
  svg {
    margin-right: 0.75rem;
    color: #1a237e;
    font-size: 1rem;
  }
  
  &:hover, &:active, &:focus {
    background-color: #f0f4ff;
    color: #1a237e;
  }
`;

const DropdownDivider = styled.div`
  margin: 0.25rem 0;
  border-color: #e0e0e0;
  border-style: solid;
  border-width: 1px 0 0;
`;

const Navbar = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  
  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar menú de usuario si se hace clic fuera
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      
      // Cerrar notificaciones si se hace clic fuera
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    // Cerrar el otro menú si está abierto
    if (userMenuOpen) setUserMenuOpen(false);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    // Cerrar el otro menú si está abierto
    if (notificationsOpen) setNotificationsOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <StyledNavbar expand="lg" variant="dark">
      <NavContainer fluid>
        <BrandLogo as={Link} to="/dashboard">
          <img src="/assets/escudo.png" alt="Logo" />
          Dirección Nacional Gestión de Bases de Datos de Seguridad
        </BrandLogo>
        
        {currentUser && (
          <NavbarRight>
            <div ref={notificationRef}>
              <NotificationButton onClick={toggleNotifications}>
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <NotificationBadge>{unreadCount}</NotificationBadge>
                )}
              </NotificationButton>
              
              {notificationsOpen && <NotificationDropdown />}
            </div>
            
            <UserMenu ref={userMenuRef}>
              <UserAvatar onClick={toggleUserMenu}>
                <img 
                  src={currentUser.profileImage || '/assets/avatar.png'} 
                  alt={`${currentUser.firstName} ${currentUser.lastName}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/avatar.png';
                  }}
                />
                <span>{currentUser.firstName} {currentUser.lastName}</span>
                <FaChevronDown size={12} />
              </UserAvatar>
              
              {userMenuOpen && (
                <UserDropdownMenu>
                  <DropdownItem as={Link} to="/dashboard">
                    <FaTachometerAlt /> Dashboard
                  </DropdownItem>
                  <DropdownItem as={Link} to="/projects">
                    <FaProjectDiagram /> Proyectos
                  </DropdownItem>
                  <DropdownItem as={Link} to="/tasks">
                    <FaTasks /> Tareas
                  </DropdownItem>
                  <DropdownItem as={Link} to="/calendar">
                    <FaCalendarAlt /> Calendario
                  </DropdownItem>
                  <DropdownItem as={Link} to="/documents">
                    <FaFolder /> Documentos
                  </DropdownItem>
                  <DropdownItem as={Link} to="/wiki">
                    <FaBook /> Wiki
                  </DropdownItem>
                  <DropdownItem as="a" href="https://owa.minseg.gob.ar/" target="_blank" rel="noopener noreferrer">
                    <FaEnvelope /> Mail
                  </DropdownItem>
                  <DropdownItem as="a" href="https://cas.gde.gob.ar/acceso/login/" target="_blank" rel="noopener noreferrer">
                    <FaFileAlt /> GDE
                  </DropdownItem>
                  
                  {(currentUser.role === 'admin' || 
                    currentUser.expertiseArea === 'administrative') && (
                    <>
                      <DropdownDivider />
                      <DropdownItem as={Link} to="/admin">
                        <FaCog /> Administración
                      </DropdownItem>
                    </>
                  )}
                  
                  <DropdownDivider />
                  <DropdownItem as={Link} to="/profile">
                    <FaUser /> Mi Perfil
                  </DropdownItem>
                  <DropdownItem onClick={handleLogout}>
                    <FaSignOutAlt /> Cerrar Sesión
                  </DropdownItem>
                </UserDropdownMenu>
              )}
            </UserMenu>
          </NavbarRight>
        )}
      </NavContainer>
    </StyledNavbar>
  );
};

export default Navbar;