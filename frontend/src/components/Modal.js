import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: ${props => {
    switch (props.size) {
      case 'sm': return '400px';
      case 'md': return '600px';
      case 'lg': return '800px';
      default: return '500px';
    }
  }};
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #757575;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #333;
  }
`;

const Body = styled.div`
  padding: 1.5rem;
`;

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'outline':
        return `
          background: white;
          border: 1px solid #1a237e;
          color: #1a237e;
          &:hover {
            background: #f5f5f5;
          }
        `;
      case 'danger':
        return `
          background: #d32f2f;
          border: 1px solid #d32f2f;
          color: white;
          &:hover {
            background: #b71c1c;
          }
        `;
      default:
        return `
          background: #1a237e;
          border: 1px solid #1a237e;
          color: white;
          &:hover {
            background: #151c60;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormControl = styled.div`
  margin-bottom: 1rem;
`;

FormControl.Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
`;

FormControl.Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.error ? '#d32f2f' : '#ddd'};
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

FormControl.Error = styled.span`
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
`;

const Modal = ({ isOpen, onClose, children, size }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent size={size} onClick={e => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

Modal.Header = ({ children, onClose }) => (
  <Header>
    <Title>{children}</Title>
    {onClose && <CloseButton onClick={onClose}>&times;</CloseButton>}
  </Header>
);

Modal.Body = ({ children }) => <Body>{children}</Body>;
Modal.Footer = ({ children }) => <Footer>{children}</Footer>;
Modal.Button = Button;
Modal.FormControl = FormControl;

export { Modal, Button, FormControl }; 