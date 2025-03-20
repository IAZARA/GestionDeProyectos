import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  padding: 25px;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Navbar />
      <MainContentWrapper>
        {children}
      </MainContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;