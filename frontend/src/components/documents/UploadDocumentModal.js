import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import FormControl from '../../components/common/FormControl';
import Spinner from '../../components/common/Spinner';
import { uploadDocument } from '../../services/document.service';
import API from '../../services/api';

const ModalContent = styled.div`
  min-width: 500px;
  padding: 20px 0;
`;

const FileUploadArea = styled.div`
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 30px;
  text-align: center;
  margin: 20px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #2196f3;
    background-color: rgba(33, 150, 243, 0.05);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileName = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 8px;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 10px;
`;

const UploadDocumentModal = ({ open, onClose, projectId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      setUploadStatus('');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError('');
      setUploadStatus('');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo para subir.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadStatus('Iniciando subida...');
      setUploadProgress(0);

      const fileWithCustomName = fileName !== file.name 
        ? new File([file], fileName, { type: file.type }) 
        : file;

      // Verificación del tamaño del archivo (limite a 20MB)
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
      if (fileWithCustomName.size > MAX_FILE_SIZE) {
        setError(`El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        setUploading(false);
        return;
      }

      // Verificación de tipo de archivo
      const allowedExtensions = ['pdf', 'docx', 'xlsx', 'jpg', 'jpeg', 'png'];
      const fileExtension = fileWithCustomName.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        setError(`Tipo de archivo no permitido. Los formatos permitidos son: ${allowedExtensions.join(', ')}`);
        setUploading(false);
        return;
      }

      setUploadStatus('Subiendo documento...');
      
      if (retryCount > 0) {
        setUploadStatus(`Reintentando subida (intento ${retryCount + 1})...`);
        await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
      }

      // Definir una función para supervisar el progreso de la carga
      const onProgress = (progress) => {
        setUploadProgress(progress);
        setUploadStatus(`Subiendo... ${progress}%`);
      };

      // Crear una copia personalizada de uploadDocument para monitorear el progreso
      const customUploadDocument = async () => {
        const formData = new FormData();
        formData.append('file', fileWithCustomName);
        formData.append('name', fileName);
        formData.append('description', description);
        if (projectId) {
          formData.append('project', projectId);
        }
        
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000,
          onUploadProgress: progressEvent => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        };
        
        try {
          // Intentar primero con la ruta específica del proyecto
          const endpoint = projectId 
            ? `/projects/${projectId}/documents` 
            : `/documents`;
          
          const response = await API.post(endpoint, formData, config);
          return response.data.document;
        } catch (error) {
          // Si falla con la ruta específica, intentar con la ruta general
          if (projectId && error.response && error.response.status === 404) {
            const fallbackResponse = await API.post('/documents', formData, config);
            return fallbackResponse.data.document;
          }
          throw error;
        }
      };

      const result = await customUploadDocument();
      
      setUploading(false);
      setUploadStatus('¡Documento subido con éxito!');
      onUploadSuccess(result);
      handleClose();
    } catch (err) {
      console.error('Error al subir documento:', err);
      
      if (err.response && err.response.status === 429) {
        setError('Demasiadas solicitudes. El sistema intentará reintentarlo automáticamente.');
        setUploadStatus('Esperando para reintentar...');
        setRetryCount(prev => prev + 1);
        
        if (retryCount < 3) {
          setTimeout(() => {
            setUploadStatus('Reintentando...');
            handleUpload();
          }, 5000);
        } else {
          setError('Se ha excedido el número máximo de reintentos. Por favor, inténtalo más tarde.');
          setUploading(false);
        }
      } else if (err.response && err.response.status === 500) {
        setError('Error interno del servidor. Por favor, contacta al administrador o inténtalo más tarde.');
        setUploading(false);
      } else if (err.response && err.response.status === 404) {
        setError('La ruta de carga no está disponible. Por favor, contacta al administrador.');
        setUploading(false);
      } else if (err.message && err.message.includes('timeout')) {
        setError('La solicitud ha excedido el tiempo de espera. Inténtalo con un archivo más pequeño o verifica tu conexión a internet.');
        setUploading(false);
      } else {
        setError(`Error al subir el documento: ${err.message || 'Error desconocido'}. Por favor, inténtalo de nuevo.`);
        setUploading(false);
      }
      setUploadStatus('');
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileName('');
    setDescription('');
    setError('');
    setUploadStatus('');
    setRetryCount(0);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} size="md">
      <Modal.Header onClose={handleClose}>Subir nuevo documento</Modal.Header>
      <Modal.Body>
        <ModalContent>
          <FormControl.Input
            id="document-name"
            label="Nombre del documento"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          
          <FormControl.Textarea
            id="document-description"
            label="Descripción (opcional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agrega una descripción para este documento"
          />
        
        <FileUploadArea
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput').click()}
          style={{ borderColor: file ? '#2196f3' : '#ccc' }}
        >
          <HiddenInput
            id="fileInput"
            type="file"
            onChange={handleFileChange}
          />
          
          {!file ? (
            <>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 14.9861C11 15.5384 11.4477 15.9861 12 15.9861C12.5523 15.9861 13 15.5384 13 14.9861V7.82831L16.2428 11.0711L17.657 9.65685L12.0001 4L6.34326 9.65685L7.75748 11.0711L11 7.82854V14.9861Z" fill="#2196f3" />
                <path d="M4 14H6V18H18V14H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V14Z" fill="#2196f3" />
              </svg>
              <p>Arrastra y suelta tu archivo aquí o haz clic para seleccionarlo</p>
            </>
          ) : (
            <FileName>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18H17V16H7V18Z" fill="#555" />
                <path d="M17 14H7V12H17V14Z" fill="#555" />
                <path d="M7 10H11V8H7V10Z" fill="#555" />
                <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="#555" />
              </svg>
              {file.name}
            </FileName>
          )}
        </FileUploadArea>
        
        {uploadStatus && (
          <div style={{ textAlign: 'center', margin: '10px 0', color: '#2196f3' }}>
            {uploadStatus}
            {uploading && uploadProgress > 0 && (
              <div style={{ 
                height: '8px', 
                width: '100%', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '4px',
                marginTop: '8px' 
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${uploadProgress}%`, 
                  backgroundColor: '#2196f3', 
                  borderRadius: '4px',
                  transition: 'width 0.3s ease' 
                }} />
              </div>
            )}
          </div>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        </ModalContent>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleUpload} 
          disabled={uploading || !file}
        >
          {uploading ? <Spinner size="sm" /> : 'Subir documento'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadDocumentModal;
