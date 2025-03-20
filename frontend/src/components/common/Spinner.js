import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const StyledSpinner = styled.div`
  display: inline-block;
  width: ${props => props.$size};
  height: ${props => props.$size};
  
  &:after {
    content: " ";
    display: block;
    width: ${props => props.$size};
    height: ${props => props.$size};
    border-radius: 50%;
    border: ${props => props.$thickness} solid ${props => props.$color};
    border-color: ${props => props.$color} transparent ${props => props.$color} transparent;
    animation: ${spin} 1.2s linear infinite;
  }
`;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${props => props.$fullPage ? '0' : '2rem'};
  height: ${props => props.$fullPage ? '100vh' : 'auto'};
`;
const Spinner = ({
  size = '2rem',
  color = '#3B82F6',
  thickness = '4px',
  fullPage = false,
  centered = false,
  ...props
}) => {
  const spinner = (
    <StyledSpinner
      $size={size}
      $color={color}
      $thickness={thickness}
      {...props}
    />
  );

  if (fullPage || centered) {
    return <Wrapper $fullPage={fullPage}>{spinner}</Wrapper>;
  }

  return spinner;
};

export default Spinner;
