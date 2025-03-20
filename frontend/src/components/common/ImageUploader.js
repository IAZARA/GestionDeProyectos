import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaCamera, FaTrash } from 'react-icons/fa';

const ImageUploaderContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ImageContainer = styled.div`
  position: relative;
  width: ${props => props.size || '120px'};
  height: ${props => props.size || '120px'};
  border-radius: ${props => props.rounded ? '50%' : '8px'};
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;

const OverlayButtons = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  padding: 8px 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ImageContainer}:hover & {
    opacity: 1;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  margin: 0 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.2);
  }
  
  &:focus {
    outline: none;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImageUploader = ({ 
  currentImage, 
  onImageChange, 
  size = '120px', 
  rounded = true,
  defaultImage = 'https://via.placeholder.com/150'
}) => {
  const [previewImage, setPreviewImage] = useState(currentImage || defaultImage);
  const fileInputRef = useRef(null);
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        if (onImageChange) {
          onImageChange(file, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(defaultImage);
    if (onImageChange) {
      onImageChange(null, defaultImage);
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <ImageUploaderContainer>
      <ImageContainer size={size} rounded={rounded}>
        <Image src={previewImage} alt="Profile" />
        <OverlayButtons>
          <IconButton onClick={handleImageClick} title="Subir imagen">
            <FaCamera />
          </IconButton>
          {previewImage !== defaultImage && (
            <IconButton onClick={handleRemoveImage} title="Eliminar imagen">
              <FaTrash />
            </IconButton>
          )}
        </OverlayButtons>
      </ImageContainer>
      <HiddenInput
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
      />
    </ImageUploaderContainer>
  );
};

export default ImageUploader;
