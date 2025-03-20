import React from 'react';
import styled, { css } from 'styled-components';

const StyledAlert = styled.div`
  position: relative;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  display: flex;
  align-items: flex-start;
  
  ${props => {
    switch(props.$type) {
      case 'success':
        return css`
          color: #03543F;
          background-color: #DEF7EC;
          border-color: #C6F6E5;
        `;
      case 'info':
        return css`
          color: #1E429F;
          background-color: #E1EFFE;
          border-color: #C3DDFD;
        `;
      case 'warning':
        return css`
          color: #92400E;
          background-color: #FEF3C7;
          border-color: #FDE68A;
        `;
      case 'error':
        return css`
          color: #9B1C1C;
          background-color: #FEE2E2;
          border-color: #FECACA;
        `;
      default:
        return css`
          color: #1F2937;
          background-color: #F3F4F6;
          border-color: #E5E7EB;
        `;
    }
  }}
`;

const IconWrapper = styled.div`
  margin-right: 0.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Title = styled.div`
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
`;

const Message = styled.div`
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.75rem;
  color: currentColor;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
  }
`;

const Alert = ({
  title,
  children,
  type = 'info',
  icon,
  onClose,
  ...props
}) => {
  return (
    <StyledAlert $type={type} {...props}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <ContentWrapper>
        {title && <Title>{title}</Title>}
        <Message>{children}</Message>
      </ContentWrapper>
      {onClose && (
        <CloseButton onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CloseButton>
      )}
    </StyledAlert>
  );
};

export default Alert;
