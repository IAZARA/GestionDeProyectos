import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createTask } from '../../services/task.service';
import { getProjects } from '../../services/project.service';
import { getUsers } from '../../services/user.service';
import { uploadFile } from '../../services/file.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormControl from '../../components/common/FormControl';
import Alert from '../../components/common/Alert';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const TagsInput = styled.div`
  margin-bottom: 1.5rem;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #F3F4F6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #4B5563;
  
  button {
    background: transparent;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    display: flex;
    padding: 0;
    margin-left: 0.25rem;
    
    &:hover {
      color: #EF4444;
    }
  }
`;

const FilesList = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  
  .file-name {
    font-size: 0.875rem;
    color: #111827;
    margin-right: 0.5rem;
  }
  
  .file-size {
    font-size: 0.75rem;
    color: #6B7280;
  }
  
  button {
    background: transparent;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    display: flex;
    padding: 0.25rem;
    
    &:hover {
      color: #EF4444;
    }
  }
`;

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'pendiente',
    prioridad: 'media',
    proyecto: '',
    fechaLimite: '',
    asignadoA: '',
    etiquetas: []
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, usersData] = await Promise.all([
          getProjects(),
          getUsers()
        ]);
        
        setProjects(projectsData);
        setUsers(usersData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Por favor, inténtelo de nuevo.');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.etiquetas.includes(tag)) {
      setFormData({
        ...formData,
        etiquetas: [...formData.etiquetas, tag]
      });
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    const newTags = [...formData.etiquetas];
    newTags.splice(index, 1);
    setFormData({ ...formData, etiquetas: newTags });
  };

  const handleFileChange = (e) => {
    const fileList = e.target.files;
    if (!fileList.length) return;
    
    const newFiles = Array.from(fileList).map(file => ({
      file,
      name: file.name,
      size: file.size,
      id: Date.now() + Math.random().toString(36).substring(2, 15)
    }));
    
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFiles = async (taskId) => {
    if (!files.length) return [];
    
    const uploadPromises = files.map(fileObj => {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      formData.append('entidad', 'tarea');
      formData.append('entidadId', taskId);
      
      return uploadFile(formData);
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Crear la tarea
      const task = await createTask(formData);
      
      // Subir archivos si hay
      if (files.length) {
        await uploadFiles(task._id);
      }
      
      navigate(`/tasks/${task._id}`);
    } catch (err) {
      console.error('Error al crear la tarea:', err);
      setError('Ocurrió un error al crear la tarea. Por favor, inténtelo de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader>
        <PageTitle>Crear Nueva Tarea</PageTitle>
      </PageHeader>

      {error && (
        <Alert 
          type="error" 
          title="Error" 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <FormControl.Input 
                  id="titulo"
                  name="titulo"
                  label="Título"
                  value={formData.titulo}
                  onChange={handleChange}
                  error={errors.titulo}
                  placeholder="Título de la tarea"
                />
                
                <FormControl.Textarea 
                  id="descripcion"
                  name="descripcion"
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={handleChange}
                  error={errors.descripcion}
                  placeholder="Describe la tarea detalladamente"
                />
                
                <FormControl.Select
                  id="proyecto"
                  name="proyecto"
                  label="Proyecto"
                  value={formData.proyecto}
                  onChange={handleChange}
                >
                  <option value="">Sin proyecto</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.nombre}
                    </option>
                  ))}
                </FormControl.Select>
                
                <FormControl.Select
                  id="asignadoA"
                  name="asignadoA"
                  label="Asignar a"
                  value={formData.asignadoA}
                  onChange={handleChange}
                >
                  <option value="">Sin asignar</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.nombre}
                    </option>
                  ))}
                </FormControl.Select>
              </div>
              
              <div>
                <FormControl.Select
                  id="estado"
                  name="estado"
                  label="Estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </FormControl.Select>
                
                <FormControl.Select
                  id="prioridad"
                  name="prioridad"
                  label="Prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </FormControl.Select>
                
                <FormControl.Input
                  id="fechaLimite"
                  name="fechaLimite"
                  label="Fecha Límite (opcional)"
                  type="date"
                  value={formData.fechaLimite}
                  onChange={handleChange}
                />
                
                <TagsInput>
                  <FormControl.Input
                    id="tagInput"
                    label="Etiquetas (presiona Enter para añadir)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Añadir etiqueta"
                  />
                  <TagsList>
                    {formData.etiquetas.map((tag, index) => (
                      <Tag key={index}>
                        {tag}
                        <button type="button" onClick={() => removeTag(index)}>
                          <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </Tag>
                    ))}
                  </TagsList>
                </TagsInput>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="files" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
                    Archivos Adjuntos
                  </label>
                  
                  <input 
                    type="file" 
                    id="files" 
                    multiple 
                    onChange={handleFileChange} 
                    style={{ marginBottom: '0.5rem' }}
                  />
                  
                  <FilesList>
                    {files.map((file, index) => (
                      <FileItem key={file.id}>
                        <div>
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <button type="button" onClick={() => removeFile(file.id)}>
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </FileItem>
                    ))}
                  </FilesList>
                </div>
              </div>
            </FormGrid>
            
            <FormActions>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/tasks')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Crear Tarea
              </Button>
            </FormActions>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateTaskPage;
