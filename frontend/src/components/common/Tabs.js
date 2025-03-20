import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
  width: 100%;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #E5E7EB;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => (props.active ? '#3B82F6' : '#6B7280')};
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  
  &:hover {
    color: ${props => (props.active ? '#3B82F6' : '#1F2937')};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => (props.active ? '#3B82F6' : 'transparent')};
    transition: background-color 0.2s ease-in-out;
  }
  
  &:focus {
    outline: none;
  }
`;

const TabPanels = styled.div`
  margin-top: 1rem;
`;

const TabPanel = styled.div`
  display: ${props => (props.active ? 'block' : 'none')};
`;

const Tabs = ({ children, defaultIndex = 0, onChange }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  
  useEffect(() => {
    if (onChange) {
      onChange(activeIndex);
    }
  }, [activeIndex, onChange]);
  
  // Organize the children into tabs and panels
  const tabs = [];
  const panels = [];
  
  React.Children.forEach(children, (child) => {
    if (child.type === Tab) {
      tabs.push(child);
    } else if (child.type === TabPanel) {
      panels.push(child);
    }
  });
  
  const handleTabClick = (index) => {
    setActiveIndex(index);
  };
  
  return (
    <TabsContainer>
      <TabList>
        {tabs.map((tab, index) => (
          React.cloneElement(tab, {
            key: index,
            active: index === activeIndex,
            onClick: () => handleTabClick(index),
          })
        ))}
      </TabList>
      <TabPanels>
        {panels.map((panel, index) => (
          React.cloneElement(panel, {
            key: index,
            active: index === activeIndex,
          })
        ))}
      </TabPanels>
    </TabsContainer>
  );
};

const Tab = ({ active, onClick, children }) => {
  return (
    <TabButton active={active} onClick={onClick}>
      {children}
    </TabButton>
  );
};

Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;
