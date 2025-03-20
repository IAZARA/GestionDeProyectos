import React from 'react';
import styled, { css } from 'styled-components';

const ButtonBase = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  ${props => props.$primary && css`
    background-color: #1E40AF;
    color: white;
    &:hover {
      background-color: #1E3A8A;
    }
  `}

  ${props => props.$secondary && css`
    background-color: #E2E8F0;
    color: #334155;
    &:hover {
      background-color: #CBD5E1;
    }
  `}

  ${props => props.$success && css`
    background-color: #10B981;
    color: white;
    &:hover {
      background-color: #059669;
    }
  `}

  ${props => props.$danger && css`
    background-color: #EF4444;
    color: white;
    &:hover {
      background-color: #DC2626;
    }
  `}

  ${props => props.$outline && css`
    background-color: transparent;
    border: 1px solid;
    
    ${props.$primary && css`
      border-color: #1E40AF;
      color: #1E40AF;
      &:hover {
        background-color: rgba(30, 64, 175, 0.1);
      }
    `}
    
    ${props.$secondary && css`
      border-color: #64748B;
      color: #64748B;
      &:hover {
        background-color: rgba(100, 116, 139, 0.1);
      }
    `}
    
    ${props.$success && css`
      border-color: #10B981;
      color: #10B981;
      &:hover {
        background-color: rgba(16, 185, 129, 0.1);
      }
    `}
    
    ${props.$danger && css`
      border-color: #EF4444;
      color: #EF4444;
      &:hover {
        background-color: rgba(239, 68, 68, 0.1);
      }
    `}
  `}

  ${props => props.$size === 'sm' && css`
    padding: 6px 12px;
    font-size: 12px;
  `}

  ${props => props.$size === 'lg' && css`
    padding: 12px 20px;
    font-size: 16px;
  `}

  ${props => props.$fullWidth && css`
    width: 100%;
  `}
`;

const Button = ({ 
  children, 
  primary, 
  secondary, 
  success, 
  danger, 
  outline, 
  size, 
  fullWidth, 
  ...props 
}) => {
  return (
    <ButtonBase 
      $primary={primary} 
      $secondary={secondary} 
      $success={success} 
      $danger={danger} 
      $outline={outline} 
      $size={size} 
      $fullWidth={fullWidth} 
      {...props}
    >
      {children}
    </ButtonBase>
  );
};

export default Button;
