import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 1.5rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: ${props => props.size === 'lg' ? '800px' : props.size === 'sm' ? '400px' : '600px'};
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: auto;
  animation: modalFadeIn 0.3s ease-out forwards;
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  
  &:hover {
    color: #1F2937;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #E5E7EB;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
`;

const Modal = ({ isOpen, onClose, size = 'md', children }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Permitir el scroll en el body pero con un indicador visual de que hay un modal
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '15px'; // Compensar por la barra de scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <Overlay>
      <ModalContainer ref={modalRef} size={size}>
        {children}
      </ModalContainer>
    </Overlay>,
    document.body
  );
};

Modal.Header = ({ children, onClose }) => (
  <ModalHeader>
    <h3>{children}</h3>
    {onClose && (
      <CloseButton onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </CloseButton>
    )}
  </ModalHeader>
);

Modal.Body = ({ children }) => <ModalBody>{children}</ModalBody>;

Modal.Footer = ({ children }) => <ModalFooter>{children}</ModalFooter>;

export default Modal;
