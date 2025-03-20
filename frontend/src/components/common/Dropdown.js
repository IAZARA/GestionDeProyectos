import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: white;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #F9FAFB;
  }
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  margin-top: 0.25rem;
  min-width: 10rem;
  padding: 0.5rem 0;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #E5E7EB;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  
  ${props => props.right && `
    left: auto;
    right: 0;
  `}
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #1F2937;
  background-color: transparent;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #F3F4F6;
  }
  
  &:focus {
    outline: none;
    background-color: #F3F4F6;
  }
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
    }
  `}
  
  ${props => props.danger && `
    color: #DC2626;
    &:hover {
      background-color: #FEE2E2;
    }
  `}
`;

const MenuDivider = styled.div`
  margin: 0.5rem 0;
  border-top: 1px solid #E5E7EB;
`;

const MenuHeader = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
`;

const Dropdown = ({ 
  trigger, 
  children,
  align = 'left',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownContainer ref={dropdownRef} {...props}>
      {React.cloneElement(trigger, { onClick: handleToggle })}
      <DropdownMenu isOpen={isOpen} right={align === 'right'}>
        {children}
      </DropdownMenu>
    </DropdownContainer>
  );
};

Dropdown.Button = DropdownButton;

Dropdown.Item = ({ children, onClick, disabled, danger, ...props }) => {
  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
  };

  return (
    <MenuItem 
      onClick={handleClick} 
      disabled={disabled} 
      danger={danger}
      {...props}
    >
      {children}
    </MenuItem>
  );
};

Dropdown.Divider = MenuDivider;
Dropdown.Header = MenuHeader;

export default Dropdown;
