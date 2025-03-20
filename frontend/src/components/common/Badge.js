import React from 'react';
import styled, { css } from 'styled-components';

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 9999px;
  
  ${props => {
    switch(props.$variant) {
      case 'primary':
        return css`
          background-color: #E0E7FF;
          color: #4F46E5;
        `;
      case 'secondary':
        return css`
          background-color: #E5E7EB;
          color: #4B5563;
        `;
      case 'success':
        return css`
          background-color: #D1FAE5;
          color: #047857;
        `;
      case 'danger':
        return css`
          background-color: #FEE2E2;
          color: #B91C1C;
        `;
      case 'warning':
        return css`
          background-color: #FEF3C7;
          color: #B45309;
        `;
      case 'info':
        return css`
          background-color: #DBEAFE;
          color: #1D4ED8;
        `;
      default:
        return css`
          background-color: #E5E7EB;
          color: #4B5563;
        `;
    }
  }};
`;

const Badge = ({ children, variant = 'secondary', ...props }) => {
  return (
    <StyledBadge $variant={variant} {...props}>
      {children}
    </StyledBadge>
  );
};

export default Badge;
