import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Form, Modal, Alert, Breadcrumb, Spinner } from 'react-bootstrap';
import { FaEdit, FaPlus, FaFolder, FaFile, FaHistory, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import ReactMarkdown from 'react-markdown';
import Button from '../../components/common/Button';
import wikiService from '../../services/wiki.service';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 0.5rem;
  color: #1a237e;
  font-weight: 600;
`;

const Subtitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #283593;
  font-size: 1.25rem;
  font-weight: 400;
`;

const WikiContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
  min-height: 600px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const SidebarCard = styled(Card)`
  height: fit-content;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  .card-header {
    background-color: #f8f9fa;
    font-weight: 600;
    border-bottom: 2px solid #3949ab;
    padding: 0.75rem 1rem;
  }
  
  .card-body {
    padding: 0;
  }
`;

const WikiCard = styled(Card)`
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    padding: 1rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
`;

const PageTitle = styled.h3`
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #1a237e;
`;

const PageContent = styled.div`
  margin-top: 1rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  min-height: 300px;
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    color: #1a237e;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }
  
  h1 {
    font-size: 1.75rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
  
  blockquote {
    border-left: 4px solid #3949ab;
    padding-left: 1rem;
    margin-left: 0;
    color: #666;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  a {
    color: #3949ab;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    
    th, td {
      border: 1px solid #e0e0e0;
      padding: 0.5rem;
    }
    
    th {
      background-color: #f5f5f5;
    }
  }
`;

const PageList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const PageItem = styled.li`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &.active {
    background-color: #e3f2fd;
    border-left: 4px solid #3949ab;
    font-weight: 600;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const PageIcon = styled.span`
  margin-right: 0.75rem;
  color: #3949ab;
  font-size: 1rem;
  display: flex;
  align-items: center;
`;

const VersionInfo = styled.div`
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: #757575;
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const VersionHistory = styled.div`
  margin-top: 1rem;
`;

const VersionItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  padding-left: 2.5rem;

  &:focus {
    outline: none;
    border-color: #3949ab;
    box-shadow: 0 0 0 2px rgba(57, 73, 171, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  color: #666;
`;

const EditNotice = styled.div`
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0 4px 4px 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.75rem;
    color: #ffa000;
    font-size: 1.25rem;
  }
`;

const CreateButton = styled(Button)`
  margin-bottom: 1.5rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background-color: #3949ab;
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background-color: #303f9f;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  height: 100%;
  min-height: 400px;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h4`
  margin-bottom: 1rem;
  color: #333;
`;

const EmptyStateText = styled.p`
  margin-bottom: 1.5rem;
  color: #666;
  max-width: 500px;
`;

const ModalFooter = styled(Modal.Footer)`
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  gap: 1rem;
`;

const ModalButton = styled(Button)`
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:focus {
    box-shadow: none;
  }
`;

const StyledModal = styled(Modal)`
  &.modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1055;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
  }

  .modal-dialog {
    position: relative;
    max-width: 500px;
    margin: 1.75rem auto;
    display: flex;
    align-items: center;
    min-height: calc(100% - 3.5rem);
    pointer-events: none;
  }
  
  .modal-content {
    position: relative;
    width: 100%;
    pointer-events: auto;
    background-color: #fff;
    border-radius: 8px;
    border: none;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    outline: 0;
  }
  
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-header {
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 1.25rem 1.5rem;
    
    .modal-title {
      color: #333;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    
    .btn-close {
      padding: 1rem;
      margin: -1rem -1rem -1rem auto;
      
      &:focus {
        box-shadow: none;
        outline: none;
      }
    }
  }
  
  .modal-body {
    padding: 2rem 1.5rem;
  }
  
  .modal-footer {
    border-top: 1px solid #e0e0e0;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
`;

const FormLabel = styled(Form.Label)`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const FormControl = styled(Form.Control)`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #3949ab;
    box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.15);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const FormSelect = styled(Form.Select)`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #3949ab;
    box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.15);
  }
`;

// Añadir nuevo componente para mostrar la información de edición
const EditInfoContainer = styled.div`
  margin-top: 2rem;
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
`;

const EditInfoTitle = styled.h5`
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  svg {
    color: #3949ab;
    margin-right: 0.5rem;
  }
`;

const EditInfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;

  strong {
    margin-right: 0.5rem;
    color: #333;
  }
`;

const WikiPage = () => {
  const { currentUser } = useAuth();
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [title, setTitle] = useState('');
  const [parentId, setParentId] = useState('');
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPages, setFilteredPages] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Cargar páginas de la wiki global
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const wikiPages = await wikiService.getGlobalWikiPages();
        setPages(wikiPages);
        setFilteredPages(wikiPages);
        if (wikiPages.length > 0) {
          setCurrentPage(wikiPages[0]);
        }
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las páginas de la wiki');
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchPages();
  }, []);

  // Filtrar páginas cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPages(pages);
    } else {
      const filtered = pages.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPages(filtered);
    }
  }, [searchTerm, pages]);

  const handleCreatePage = async () => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      const newPage = await wikiService.createGlobalWikiPage({
        title: title.trim(),
        content: ' ', // Enviar un espacio en blanco para cumplir con la validación
        parent: parentId || null
      });
      
      setPages(prevPages => [...prevPages, newPage]);
      setCurrentPage(newPage);
      setShowCreateModal(false);
      setTitle('');
      setParentId('');
      setEditMode(true);  // Activar modo edición inmediatamente
    } catch (err) {
      setError('Error al crear la página: ' + (err.message || 'Error desconocido'));
      console.error(err);
    }
  };

  const handleUpdatePage = async () => {
    if (!currentPage) return;

    try {
      const updatedPage = await wikiService.updateGlobalWikiPage(currentPage._id, {
        title: currentPage.title,
        content: currentPage.content,
        parent: currentPage.parent || null
      });
      
      setPages(prevPages => 
        prevPages.map(p => p._id === updatedPage._id ? updatedPage : p)
      );
      setCurrentPage(updatedPage);
      setEditMode(false);
    } catch (err) {
      setError('Error al actualizar la página: ' + (err.message || 'Error desconocido'));
      console.error(err);
    }
  };

  const handleDeletePage = async () => {
    if (!currentPage) return;
    
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta página?')) {
      return;
    }
    
    try {
      await wikiService.deleteGlobalWikiPage(currentPage._id);
      setPages(prevPages => prevPages.filter(p => p._id !== currentPage._id));
      setCurrentPage(pages.length > 1 ? pages.find(p => p._id !== currentPage._id) : null);
    } catch (err) {
      setError('Error al eliminar la página: ' + (err.message || 'Error desconocido'));
      console.error(err);
    }
  };

  const handleSelectPage = (page) => {
    if (editMode && !window.confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
      return;
    }
    setCurrentPage(page);
    setEditMode(false);
  };

  const loadPageHistory = async (pageId) => {
    try {
      // Implementar cuando se tenga la API de historial
      setVersions([
        {
          editedAt: new Date(),
          editedBy: { firstName: 'Sistema', lastName: '' },
          versionComment: 'Versión inicial'
        }
      ]);
      setShowHistoryModal(true);
    } catch (err) {
      setError('Error al cargar el historial');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>Wiki Global</Title>
        <Subtitle>Base de conocimiento compartida</Subtitle>
        <LoadingContainer>
          <Spinner animation="border" variant="primary" />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Wiki Global</Title>
      <Subtitle>Base de conocimiento compartida</Subtitle>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Button 
        primary
        onClick={() => setShowCreateModal(true)}
        style={{ marginBottom: '1rem' }}
      >
        <FaPlus style={{ marginRight: '0.5rem' }} />
        Crear nueva página
      </Button>
      
      <WikiContainer>
        <div>
          <SearchContainer>
            <SearchIcon>
              <FaEdit />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Buscar en la wiki..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </SearchContainer>
          
          <SidebarCard>
            <Card.Header>Páginas</Card.Header>
            <Card.Body>
              {filteredPages.length > 0 ? (
                <PageList>
                  {filteredPages.map(page => (
                    <PageItem 
                      key={page._id} 
                      className={currentPage && currentPage._id === page._id ? 'active' : ''}
                      onClick={() => handleSelectPage(page)}
                    >
                      <PageIcon>
                        {page.isFolder ? <FaFolder /> : <FaFile />}
                      </PageIcon>
                      {page.title}
                    </PageItem>
                  ))}
                </PageList>
              ) : (
                <NoResults>No se encontraron páginas</NoResults>
              )}
            </Card.Body>
          </SidebarCard>
        </div>
        
        <div style={{ flex: 1 }}>
          {currentPage ? (
            <WikiCard>
              <Card.Header>
                <PageTitle>
                  {editMode ? (
                    <Form.Control
                      type="text"
                      value={currentPage.title}
                      onChange={(e) => setCurrentPage({...currentPage, title: e.target.value})}
                      style={{fontSize: '1.2rem', fontWeight: 'bold'}}
                    />
                  ) : (
                    currentPage.title
                  )}
                  <div>
                    {!editMode && (
                      <>
                        <Button
                          primary
                          small
                          onClick={() => setEditMode(true)}
                          style={{ marginRight: '0.5rem' }}
                        >
                          <FaEdit style={{ marginRight: '0.3rem' }} />
                          Editar
                        </Button>
                        <Button
                          danger
                          small
                          onClick={handleDeletePage}
                        >
                          <FaTrash style={{ marginRight: '0.3rem' }} />
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </PageTitle>
              </Card.Header>
              <Card.Body>
                {editMode ? (
                  <>
                    <SimpleMDE
                      value={currentPage.content || ''}
                      onChange={(value) => setCurrentPage(prev => ({ ...prev, content: value }))}
                      options={{
                        autofocus: true,
                        spellChecker: false,
                        placeholder: "Escribe el contenido usando Markdown...",
                      }}
                    />
                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                      <Button
                        secondary
                        onClick={() => setEditMode(false)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        primary
                        onClick={handleUpdatePage}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    {currentPage.content ? (
                      <>
                        <ReactMarkdown>{currentPage.content}</ReactMarkdown>
                        
                        {/* Información de edición */}
                        <EditInfoContainer>
                          <EditInfoTitle>
                            <FaHistory />
                            Historial de ediciones
                          </EditInfoTitle>
                          <EditInfoItem>
                            <strong>Creado por:</strong> 
                            {currentPage.author?.firstName} {currentPage.author?.lastName || 'Sistema'} 
                            <span style={{margin: '0 0.5rem'}}>•</span>
                            {new Date(currentPage.createdAt).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </EditInfoItem>
                          {currentPage.lastEditedBy && (
                            <EditInfoItem>
                              <strong>Última edición:</strong> 
                              {currentPage.lastEditedBy?.firstName} {currentPage.lastEditedBy?.lastName || 'Sistema'} 
                              <span style={{margin: '0 0.5rem'}}>•</span>
                              {new Date(currentPage.updatedAt).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </EditInfoItem>
                          )}
                          {currentPage.history && currentPage.history.length > 0 && (
                            <Button
                              secondary
                              small
                              onClick={() => loadPageHistory(currentPage._id)}
                              style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                            >
                              Ver historial completo
                            </Button>
                          )}
                        </EditInfoContainer>
                      </>
                    ) : (
                      <EmptyStateContainer style={{minHeight: '200px'}}>
                        <EmptyStateText>
                          Esta página está vacía. Haz clic en "Editar" para agregar contenido.
                        </EmptyStateText>
                        <Button
                          primary
                          onClick={() => setEditMode(true)}
                        >
                          <FaEdit style={{ marginRight: '0.3rem' }} />
                          Editar Página
                        </Button>
                      </EmptyStateContainer>
                    )}
                  </div>
                )}
              </Card.Body>
            </WikiCard>
          ) : (
            <EmptyStateContainer>
              <EmptyStateIcon>
                <FaFile />
              </EmptyStateIcon>
              <EmptyStateTitle>No hay página seleccionada</EmptyStateTitle>
              <EmptyStateText>
                Selecciona una página de la lista o crea una nueva para empezar.
              </EmptyStateText>
              <Button
                primary
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus style={{ marginRight: '0.5rem' }} />
                Crear nueva página
              </Button>
            </EmptyStateContainer>
          )}
        </div>
      </WikiContainer>
      
      {/* Modal para crear nueva página */}
      <StyledModal 
        show={showCreateModal} 
        onHide={() => setShowCreateModal(false)}
        centered
        animation={true}
        backdrop={true}
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: '#f0f0f0', 
                padding: '0.5rem', 
                borderRadius: '4px',
                marginRight: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}>
                <FaPlus style={{ color: '#3949ab' }} />
              </div>
              Crear nueva página
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-4">
            <FormLabel>Título de la página</FormLabel>
            <FormControl
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título de la página"
              autoFocus
            />
            <Form.Text className="text-muted" style={{ marginTop: '0.5rem', display: 'block' }}>
              Elige un título descriptivo para tu página.
            </Form.Text>
          </Form.Group>
          
          {pages.length > 0 && (
            <Form.Group className="mb-4">
              <FormLabel>Página padre (opcional)</FormLabel>
              <FormSelect
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">Ninguna (página de nivel superior)</option>
                {pages.map(page => (
                  <option key={page._id} value={page._id}>
                    {page.title}
                  </option>
                ))}
              </FormSelect>
              <Form.Text className="text-muted" style={{ marginTop: '0.5rem', display: 'block' }}>
                Si esta página pertenece a otra, selecciona la página padre.
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <ModalFooter>
          <ModalButton 
            secondary 
            onClick={() => setShowCreateModal(false)}
            style={{ minWidth: '120px', backgroundColor: '#f2f2f2', color: '#333' }}
          >
            Cancelar
          </ModalButton>
          <ModalButton 
            primary 
            onClick={handleCreatePage}
            disabled={!title.trim()}
            style={{ minWidth: '160px' }}
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Crear página
          </ModalButton>
        </ModalFooter>
      </StyledModal>
      
      {/* Modal para historial de versiones */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Historial de Versiones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {versions.length > 0 ? (
            versions.map((version, index) => (
              <div key={index} className="mb-3 p-3 border rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Versión {versions.length - index}</strong>
                  <small>{new Date(version.editedAt).toLocaleString()}</small>
                </div>
                <div>
                  <strong>Editor:</strong> {version.editedBy?.firstName} {version.editedBy?.lastName}
                </div>
                {version.versionComment && (
                  <div className="mt-2">
                    <strong>Comentario:</strong> {version.versionComment}
                  </div>
                )}
              </div>
            ))
          ) : (
            <NoResults>No hay versiones anteriores disponibles</NoResults>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default WikiPage;