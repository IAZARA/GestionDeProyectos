import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Alert, Spinner, Form } from 'react-bootstrap';
import { FaFileAlt, FaFileExcel, FaFilePdf, FaFileWord, 
  FaFileImage, FaDownload, FaTrash, FaSearch, FaFileUpload, FaExclamationTriangle, 
  FaUser, FaCalendarAlt } from 'react-icons/fa';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { getDocuments, uploadDocument, deleteDocument, downloadDocument } from '../../services/document.service';

// Estilo general del contenedor
const StyledContainer = styled(Container)`
  padding: 2rem;
  background-color: #F5F7FA;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

// Títulos con estilo mejorado
const Title = styled.h1`
  margin-bottom: 0.5rem;
  color: #1E3A8A;
  font-weight: 600;
  font-size: 2rem;
`;

const Subtitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #64748B;
  font-size: 1.1rem;
  font-weight: 400;
`;

// Contenedor principal simplificado
const MainContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
`;

// Header del contenedor principal
const ContainerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
`;

// Estadísticas de documentos
const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: #F8FAFC;
  border-radius: 8px;
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #64748B;
`;

// Barra de acciones simplificada
const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

// Botón con estilo mejorado
const StyledButton = styled(Button)`
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

// Estilo para la tabla de documentos
const DocumentTable = styled(Table)`
  margin-top: 1rem;
  width: 100%;
  table-layout: fixed;
  
  th {
    background-color: #F1F5F9;
    color: #334155;
    font-weight: 600;
    border-bottom: 2px solid #E2E8F0;
    padding: 1rem;
  }
  
  td {
    vertical-align: middle;
    padding: 1rem;
    border-bottom: 1px solid #E2E8F0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  tr:hover {
    background-color: #F8FAFC;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
`;

const FileIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
  display: inline-flex;
  align-items: center;
`;

const FileTypeTag = styled(Badge)`
  font-size: 0.7rem;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  margin-left: 0.75rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748B;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled(Form.Control)`
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  font-size: 1rem;
  height: auto;
  
  &:focus {
    box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.1);
    border-color: #2563EB;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  font-size: 1rem;
`;

const NoDocuments = styled.div`
  padding: 3rem;
  text-align: center;
  color: #64748B;
  background-color: #F8FAFC;
  border-radius: 12px;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 4rem;
    color: #CBD5E1;
    margin-bottom: 1.5rem;
  }
  
  h4 {
    color: #334155;
    margin-bottom: 1rem;
  }
  
  p {
    max-width: 500px;
    margin: 0 auto;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const DropZone = styled.div`
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  padding: 2.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  background-color: ${props => props.$isDragActive ? '#E8F0FE' : '#F8FAFC'};
  transition: all 0.3s ease;
`;

const UploadIcon = styled.div`
  font-size: 3.5rem;
  color: #2563EB;
  margin-bottom: 1rem;
`;

const PreviewContainer = styled.div`
  margin-top: 1.5rem;
  max-height: 500px;
  overflow: auto;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.5rem;
  background-color: #F8FAFC;
`;

const ActionButton = styled(Button)`
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  font-size: 18px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.download-btn {
    background-color: #2563eb;
    border-color: #2563eb;
    
    &:hover, &:focus {
      background-color: #1d4ed8;
      border-color: #1d4ed8;
    }
  }
  
  &.delete-btn {
    background-color: #dc2626;
    border-color: #dc2626;
    
    &:hover, &:focus {
      background-color: #b91c1c;
      border-color: #b91c1c;
    }
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

// Estilos para el modal de confirmación
const DeleteModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
`;

const DeleteModalIcon = styled.div`
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
`;

const DeleteModalFile = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0.5rem;
  width: 100%;
`;

// Componente principal
const DocumentsPage = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [allDocuments, setAllDocuments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({ loading: false, error: null, success: false });
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null, success: false });
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDocuments();
        
        // Asegurarnos de que la respuesta tenga la estructura correcta
        const docs = response.documents || [];
        
        // Normalizar los documentos para asegurarse de que todos los campos necesarios existan
        const normalizedDocs = docs.map(doc => ({
          id: doc.id || doc._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          name: doc.name || 'Sin nombre',
          size: doc.size || formatFileSize(doc.fileSize || 0),
          createdBy: doc.createdBy || 'Usuario',
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          type: doc.type || getFileType(doc.name || ''),
          description: doc.description || ''
        }));
        
        setAllDocuments(normalizedDocs);
        setDocuments(normalizedDocs);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar los documentos:', err);
        setError('Error al cargar los documentos');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar documentos según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDocuments(allDocuments);
    } else {
      const filtered = allDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDocuments(filtered);
    }
  }, [searchTerm, allDocuments]);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleUploadDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    setUploadFiles(Array.from(files));
  };

  const handleUploadChange = (e) => {
    const files = e.target.files;
    setUploadFiles(Array.from(files));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setUploadStatus({ loading: true, error: null, success: false });
      const uploadedDocuments = [];
      
      for (const file of uploadFiles) {
        try {
          const uploadedDoc = await uploadDocument(null, file);
          
          // Normalizar el documento subido
          const normalizedDoc = {
            id: uploadedDoc.id || uploadedDoc._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            name: uploadedDoc.name || file.name,
            size: uploadedDoc.size || formatFileSize(file.size),
            createdBy: uploadedDoc.createdBy || 'Usuario actual',
            createdAt: uploadedDoc.createdAt ? new Date(uploadedDoc.createdAt) : new Date(),
            type: uploadedDoc.type || getFileType(file.name),
            description: uploadedDoc.description || ''
          };
          
          uploadedDocuments.push(normalizedDoc);
        } catch (error) {
          console.error(`Error al subir el archivo ${file.name}:`, error);
          // Continuamos con el siguiente archivo
        }
      }
      
      // Solo actualizamos si al menos un documento se subió correctamente
      if (uploadedDocuments.length > 0) {
        const updatedDocuments = [...allDocuments, ...uploadedDocuments];
        setAllDocuments(updatedDocuments);
        setDocuments(updatedDocuments);
        setUploadStatus({ 
          loading: false, 
          error: null, 
          success: true,
          message: `${uploadedDocuments.length} documento${uploadedDocuments.length !== 1 ? 's' : ''} subido${uploadedDocuments.length !== 1 ? 's' : ''} con éxito`
        });
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setUploadStatus({ loading: false, error: null, success: false });
        }, 3000);
      } else {
        setUploadStatus({ 
          loading: false, 
          error: 'No se pudo subir ningún documento', 
          success: false 
        });
        
        // Limpiar mensaje de error después de 5 segundos
        setTimeout(() => {
          setUploadStatus({ loading: false, error: null, success: false });
        }, 5000);
      }
      
      setUploadFiles([]);
      setShowUploadModal(false);
      setLoading(false);
    } catch (error) {
      console.error('Error al subir documentos:', error);
      setError('Error al subir documentos. Por favor, inténtalo de nuevo.');
      setUploadStatus({ 
        loading: false, 
        error: 'Error al subir documentos. Por favor, inténtalo de nuevo.', 
        success: false 
      });
      setLoading(false);
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => {
        setUploadStatus({ loading: false, error: null, success: false });
      }, 5000);
    }
  };

  const getFileType = (fileName) => {
    if (!fileName) return 'other';
    
    // Si parece ser un mimetype, extraer la extensión del mimetype
    if (fileName.includes('/')) {
      const mimeType = fileName.toLowerCase();
      if (mimeType.includes('word') || mimeType.includes('doc')) return 'word';
      if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType.includes('xls')) return 'excel';
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('image/')) return 'image';
      return 'other';
    }
    
    try {
      const extension = fileName.split('.').pop().toLowerCase();
      if (['doc', 'docx'].includes(extension)) return 'word';
      if (['xls', 'xlsx', 'csv'].includes(extension)) return 'excel';
      if (['pdf'].includes(extension)) return 'pdf';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
      return 'other';
    } catch (error) {
      console.error('Error al determinar el tipo de archivo:', error);
      return 'other';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'word':
        return <FaFileWord color="#2B579A" />;
      case 'excel':
        return <FaFileExcel color="#217346" />;
      case 'pdf':
        return <FaFilePdf color="#F40F02" />;
      case 'image':
        return <FaFileImage color="#FFB400" />;
      default:
        return <FaFileAlt color="#757575" />;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'word':
        return 'primary';
      case 'excel':
        return 'success';
      case 'pdf':
        return 'danger';
      case 'image':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '-';
    }
  };

  const handleDownload = async (documentItem) => {
    try {
      setDownloadStatus({ loading: true, error: null, success: false });
      
      const blob = await downloadDocument(null, documentItem.id);
      const url = URL.createObjectURL(blob);
      
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentItem.name);
      link.style.display = 'none';
      window.document.body.appendChild(link);
      link.click();
      
      // Limpieza
      setTimeout(() => {
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      setDownloadStatus({ loading: false, error: null, success: true });
      
      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setDownloadStatus({ loading: false, error: null, success: false });
      }, 3000);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      setDownloadStatus({ 
        loading: false, 
        error: 'Hubo un error al descargar el documento. Por favor, intente nuevamente.', 
        success: false 
      });
      
      // Limpiar el mensaje de error después de 5 segundos
      setTimeout(() => {
        setDownloadStatus({ loading: false, error: null, success: false });
      }, 5000);
    }
  };

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteStatus({ loading: true, error: null, success: false });
      await deleteDocument(null, documentToDelete.id);
      
      // Filtrar el documento eliminado
      const updatedDocuments = allDocuments.filter(doc => doc.id !== documentToDelete.id);
      setAllDocuments(updatedDocuments);
      setDocuments(updatedDocuments);
      setShowDeleteModal(false);
      
      setDeleteStatus({ 
        loading: false, 
        error: null, 
        success: true,
        message: `El documento "${documentToDelete.name}" ha sido eliminado`
      });
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setDeleteStatus({ loading: false, error: null, success: false });
      }, 3000);
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
      setDeleteStatus({ 
        loading: false, 
        error: 'Error al eliminar el documento. Por favor, inténtalo de nuevo.',
        success: false 
      });
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => {
        setDeleteStatus({ loading: false, error: null, success: false });
      }, 5000);
    }
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...uploadFiles];
    updatedFiles.splice(index, 1);
    setUploadFiles(updatedFiles);
  };

  // Calcular estadísticas de documentos
  const getDocumentStats = () => {
    const totalDocs = documents.length;
    
    // Contar documentos por tipo
    const typeCount = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {});
    
    // Obtener el tipo más común
    let mostCommonType = '';
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(typeCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    }
    
    return {
      totalDocs,
      pdfCount: typeCount['pdf'] || 0,
      wordCount: typeCount['word'] || 0,
      excelCount: typeCount['excel'] || 0,
      mostCommonType
    };
  };

  if (loading) {
    return (
      <StyledContainer>
        <Title>Repositorio Documental</Title>
        <LoadingContainer>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </LoadingContainer>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Title>Repositorio Documental</Title>
        <Alert variant="danger">{error}</Alert>
      </StyledContainer>
    );
  }

  const stats = getDocumentStats();

  return (
    <StyledContainer>
      <Title>Repositorio Documental</Title>
      <Subtitle>Gestión centralizada de archivos</Subtitle>
      
      <MainContainer>
        <ContainerHeader>
          <div>
            <h4 className="mb-0">Documentos</h4>
            <small className="text-muted">Total: {stats.totalDocs} documentos</small>
          </div>
          <Button 
            primary 
            onClick={() => setShowUploadModal(true)}
          >
            <FaFileUpload /> Subir Documentos
          </Button>
        </ContainerHeader>
        
        {documents.length > 0 && (
          <StatsContainer>
            <StatCard>
              <StatValue>{stats.pdfCount}</StatValue>
              <StatLabel>Documentos PDF</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.wordCount}</StatValue>
              <StatLabel>Documentos Word</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.excelCount}</StatValue>
              <StatLabel>Hojas de cálculo</StatLabel>
            </StatCard>
          </StatsContainer>
        )}
        
        <ActionBar>
          <SearchContainer>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </ActionBar>
        
        {documents.length > 0 ? (
          <DocumentTable hover responsive>
            <thead>
              <tr>
                <th width="35%">Nombre</th>
                <th width="10%">Tamaño</th>
                <th width="20%">Subido por</th>
                <th width="20%">Fecha</th>
                <th width="15%">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(document => (
                <tr key={document.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileIcon>{getFileIcon(document.type)}</FileIcon>
                      <span>{document.name}</span>
                      <FileTypeTag bg={getFileTypeColor(document.type)}>
                        {document.type ? document.type.toUpperCase() : 'N/A'}
                      </FileTypeTag>
                    </div>
                  </td>
                  <td>{document.size}</td>
                  <td>
                    <UserInfo>
                      <FaUser color="#64748B" />
                      <span>{document.createdBy}</span>
                    </UserInfo>
                  </td>
                  <td>
                    <DateInfo>
                      <FaCalendarAlt />
                      <span>{formatDate(document.createdAt)}</span>
                    </DateInfo>
                  </td>
                  <td className="text-center">
                    <ActionButtonsContainer>
                      <ActionButton
                        className="download-btn"
                        onClick={() => handleDownload(document)}
                        title="Descargar"
                      >
                        <FaDownload />
                      </ActionButton>
                      <ActionButton
                        className="delete-btn"
                        onClick={() => handleDeleteClick(document)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </ActionButton>
                    </ActionButtonsContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </DocumentTable>
        ) : (
          <NoDocuments>
            <FaFileAlt />
            <h4>No hay documentos disponibles</h4>
            <p>Aún no se han subido documentos al repositorio. Haz clic en "Subir Documentos" para agregar archivos.</p>
            <Button 
              primary 
              onClick={() => setShowUploadModal(true)}
              className="mt-4"
            >
              <FaFileUpload /> Subir Documentos
            </Button>
          </NoDocuments>
        )}
      </MainContainer>
      
      {/* Mensaje de estado de subida */}
      {(uploadStatus.loading || uploadStatus.error || uploadStatus.success) && (
        <Alert 
          variant={uploadStatus.error ? 'danger' : uploadStatus.success ? 'success' : 'info'} 
          className="position-fixed bottom-0 start-0 m-3 animate__animated animate__fadeIn"
          style={{
            zIndex: 1050,
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px'
          }}
        >
          {uploadStatus.loading && (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Subiendo documentos...</span>
            </div>
          )}
          {uploadStatus.error && (
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2 text-danger" />
              <span>{uploadStatus.error}</span>
            </div>
          )}
          {uploadStatus.success && (
            <div className="d-flex align-items-center">
              <FaFileUpload className="me-2 text-success" />
              <span>{uploadStatus.message || '¡Documentos subidos con éxito!'}</span>
            </div>
          )}
        </Alert>
      )}
      
      {/* Mensaje de estado de descarga */}
      {(downloadStatus.loading || downloadStatus.error || downloadStatus.success) && (
        <Alert 
          variant={downloadStatus.error ? 'danger' : downloadStatus.success ? 'success' : 'info'} 
          className="position-fixed bottom-0 end-0 m-3 animate__animated animate__fadeIn"
          style={{
            zIndex: 1050,
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px'
          }}
        >
          {downloadStatus.loading && (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Descargando documento...</span>
            </div>
          )}
          {downloadStatus.error && (
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2 text-danger" />
              <span>{downloadStatus.error}</span>
            </div>
          )}
          {downloadStatus.success && (
            <div className="d-flex align-items-center">
              <FaDownload className="me-2 text-success" />
              <span>¡Documento descargado con éxito!</span>
            </div>
          )}
        </Alert>
      )}
      
      {/* Mensaje de estado de eliminación */}
      {(deleteStatus.loading || deleteStatus.error || deleteStatus.success) && (
        <Alert 
          variant={deleteStatus.error ? 'danger' : deleteStatus.success ? 'success' : 'info'} 
          className="position-fixed top-0 end-0 m-3 animate__animated animate__fadeIn"
          style={{
            zIndex: 1050,
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px'
          }}
        >
          {deleteStatus.loading && (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Eliminando documento...</span>
            </div>
          )}
          {deleteStatus.error && (
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2 text-danger" />
              <span>{deleteStatus.error}</span>
            </div>
          )}
          {deleteStatus.success && (
            <div className="d-flex align-items-center">
              <FaTrash className="me-2 text-success" />
              <span>{deleteStatus.message || 'Documento eliminado con éxito'}</span>
            </div>
          )}
        </Alert>
      )}
      
      {/* Modal de confirmación para eliminar documento */}
      {showDeleteModal && (
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          size="sm"
        >
          <Modal.Header onClose={() => setShowDeleteModal(false)}>
            Confirmar eliminación
          </Modal.Header>
          <Modal.Body>
            {documentToDelete && (
              <DeleteModalContent>
                <DeleteModalIcon>
                  <FaTrash />
                </DeleteModalIcon>
                <p>¿Estás seguro que deseas eliminar este documento?</p>
                <DeleteModalFile>
                  <FileIcon>{getFileIcon(documentToDelete.type)}</FileIcon>
                  <strong>{documentToDelete.name}</strong>
                </DeleteModalFile>
                <p className="text-danger">Esta acción no se puede deshacer.</p>
              </DeleteModalContent>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex justify-content-center w-100 gap-2">
              <Button secondary onClick={() => setShowDeleteModal(false)} disabled={deleteStatus.loading}>
                Cancelar
              </Button>
              <Button danger onClick={handleDeleteConfirm} disabled={deleteStatus.loading}>
                {deleteStatus.loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <FaTrash className="me-2" /> Eliminar
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}

      {showUploadModal && (
        <Modal 
          isOpen={showUploadModal} 
          onClose={() => setShowUploadModal(false)} 
          size="lg"
        >
          <Modal.Header onClose={() => setShowUploadModal(false)}>
            Subir Documentos
          </Modal.Header>
          <Modal.Body>
            <DropZone 
              onDrop={handleUploadDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              $isDragActive={isDragActive}
            >
              <UploadIcon>
                <FaFileUpload />
              </UploadIcon>
              <h4>Arrastra y suelta archivos aquí</h4>
              <p>o</p>
              <Button primary onClick={() => document.getElementById('fileUpload').click()}>
                Seleccionar Archivos
              </Button>
              <Form.Control
                id="fileUpload"
                type="file"
                multiple
                onChange={handleUploadChange}
                style={{ display: 'none' }}
              />
              <p className="mt-2 text-muted">Formatos permitidos: PDF, DOCX, XLSX, JPG, PNG</p>
            </DropZone>
            
            {uploadFiles.length > 0 && (
              <div className="mt-4">
                <h5>Archivos seleccionados ({uploadFiles.length})</h5>
                <div className="list-group">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="me-2">{getFileIcon(getFileType(file.name))}</span>
                        <span>{file.name}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-light text-dark me-2">{formatFileSize(file.size)}</span>
                        <Button 
                          variant="link" 
                          className="text-danger p-0" 
                          onClick={() => handleRemoveFile(index)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button secondary onClick={() => setShowUploadModal(false)}>
              Cancelar
            </Button>
            <Button 
              primary 
              onClick={handleUpload}
              disabled={uploadFiles.length === 0}
            >
              <FaFileUpload className="me-2" /> Subir Archivos {uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      
      {showPreviewModal && (
        <Modal 
          isOpen={showPreviewModal} 
          onClose={() => setShowPreviewModal(false)} 
          size="lg"
        >
          <Modal.Header onClose={() => setShowPreviewModal(false)}>
            Vista Previa - {selectedDocument && selectedDocument.name}
          </Modal.Header>
          <Modal.Body>
            {selectedDocument && (
              <div className="text-center">
                <div className="mb-4">
                  <div className="d-inline-block p-4 bg-light rounded-circle mb-3">
                    {getFileIcon(selectedDocument.type)}
                  </div>
                  <h4>{selectedDocument.name}</h4>
                  <p className="text-muted">
                    {selectedDocument.size} · {selectedDocument.type.toUpperCase()}
                  </p>
                </div>
                
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <Button primary onClick={() => handleDownload(selectedDocument)}>
                    <FaDownload className="me-2" /> Descargar
                  </Button>
                  <Button danger onClick={() => {
                    setShowPreviewModal(false);
                    setDocumentToDelete(selectedDocument);
                    setShowDeleteModal(true);
                  }}>
                    <FaTrash className="me-2" /> Eliminar
                  </Button>
                </div>
                
                <div className="text-start p-3 bg-light rounded">
                  <div className="mb-3">
                    <strong>Subido por:</strong> {selectedDocument.createdBy}
                  </div>
                  <div className="mb-3">
                    <strong>Fecha de subida:</strong> {formatDate(selectedDocument.createdAt)}
                  </div>
                  {selectedDocument.description && (
                    <div>
                      <strong>Descripción:</strong>
                      <p>{selectedDocument.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button secondary onClick={() => setShowPreviewModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </StyledContainer>
  );
};

export default DocumentsPage;