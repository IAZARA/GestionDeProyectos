import React from 'react';
import styled from 'styled-components';
import { API_URL } from '../../config/constants';

const getSizeValue = size => {
  switch(size) {
    case 'xs':
      return '1.5rem';
    case 'sm':
      return '2rem';
    case 'md':
      return '2.5rem';
    case 'lg':
      return '3rem';
    case 'xl':
      return '4rem';
    default:
      return '2.5rem';
  }
};

const getFontSizeValue = size => {
  switch(size) {
    case 'xs':
      return '0.625rem';
    case 'sm':
      return '0.75rem';
    case 'md':
      return '0.875rem';
    case 'lg':
      return '1rem';
    case 'xl':
      return '1.25rem';
    default:
      return '0.875rem';
  }
};

const StyledAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  font-weight: 600;
  background-color: ${props => props.$bgColor || '#E5E7EB'};
  color: ${props => props.$textColor || '#374151'};
  width: ${props => getSizeValue(props.$size || 'md')};
  height: ${props => getSizeValue(props.$size || 'md')};
  font-size: ${props => getFontSizeValue(props.$size || 'md')};
`;

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  bgColor,
  textColor,
  ...props 
}) => {
  // Generate initials from name
  const getInitials = () => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(name);
  const defaultImage = '/assets/avatar.png';
  
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultImage;
  };

  const getImageSrc = () => {
    if (!src) return defaultImage;
    if (src.startsWith('http') || src.startsWith('/')) return src;
    return `${API_URL}${src}`;
  };
  
  return (
    <StyledAvatar $size={size} $bgColor={bgColor} $textColor={textColor} {...props}>
      <img 
        src={getImageSrc()}
        alt={alt || name || 'Avatar'} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={handleImageError}
      />
    </StyledAvatar>
  );
};

export default Avatar;
