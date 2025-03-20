import React from 'react';
import styled, { css } from 'styled-components';

const StyledCard = styled.div`
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  width: 100%;
  
  ${props => props.$hover && css`
    transition: box-shadow 0.3s, transform 0.3s;
    &:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.$clickable && css`
    cursor: pointer;
  `}
`;

const CardHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Card = ({ children, hover = false, clickable = false, ...props }) => {
  return (
    <StyledCard $hover={hover} $clickable={clickable} {...props}>
      {children}
    </StyledCard>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
