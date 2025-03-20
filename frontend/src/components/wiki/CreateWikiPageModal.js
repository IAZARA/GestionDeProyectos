import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';
import Button from '../common/Button';
import FormControl from '../common/FormControl';
import Spinner from '../common/Spinner';
import { getWikiPages, createWikiPage, updateWikiPage } from '../../services/wiki.service';

const ModalContent = styled.div`
  min-width: 800px;
  padding: 20px 0;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 10px;
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const ToolbarButton = styled.button`
  padding: 0.5rem;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const WikiPageModal = ({ open, onClose, projectId, onCreateSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: 'Wiki del Proyecto',
    contenido: '',
    resumen: 'Documentación principal del proyecto'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingPage, setExistingPage] = useState(null);

  useEffect(() => {
    if (open && projectId) {
      const loadWikiPage = async () => {
        try {
          const pages = await getWikiPages(projectId);
          if (pages && pages.length > 0) {
            const page = pages[0]; // Tomamos la primera página ya que solo permitimos una
            setExistingPage(page);
            setFormData({
              titulo: page.titulo || 'Wiki del Proyecto',
              contenido: page.contenido || '',
              resumen: page.resumen || 'Documentación principal del proyecto'
            });
          } else {
            // Si no existe una página, establecemos el contenido por defecto
            setFormData({
              titulo: 'Wiki del Proyecto',
              contenido: 'Esta es la página principal de la wiki. Puedes editar este contenido para documentar información importante sobre el proyecto.\n\n## Estructura del Proyecto\n\nDescribe aquí la estructura general del proyecto.\n\n## Objetivos\n\nLista los objetivos principales del proyecto.\n\n## Requisitos\n\nDescribe los requisitos necesarios para el proyecto.',
              resumen: 'Documentación principal del proyecto'
            });
          }
        } catch (err) {
          console.error('Error al cargar la página wiki:', err);
          setError('Error al cargar la página wiki');
        }
      };

      loadWikiPage();
    }
  }, [open, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const insertText = (prefix, suffix = '') => {
    const textarea = document.querySelector('textarea[name="contenido"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selected + suffix + after;
    setFormData(prev => ({ ...prev, contenido: newText }));

    // Restaurar el foco y la selección después de la actualización
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const handleSave = async () => {
    if (!formData.contenido.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let result;
      if (existingPage) {
        result = await updateWikiPage(projectId, existingPage._id, formData);
      } else {
        result = await createWikiPage(projectId, formData);
      }

      setSaving(false);
      onCreateSuccess(result);
      onClose();
    } catch (err) {
      console.error('Error al guardar la página wiki:', err);
      setError('Error al guardar la página wiki. Por favor, inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        Editar Wiki del Proyecto
      </Modal.Header>
      <Modal.Body>
        <ModalContent>
          <EditorToolbar>
            <ToolbarButton onClick={() => insertText('**', '**')} title="Negrita">
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertText('*', '*')} title="Cursiva">
              <i>I</i>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertText('# ')} title="Título">
              H
            </ToolbarButton>
            <ToolbarButton onClick={() => insertText('- ')} title="Lista">
              •
            </ToolbarButton>
            <ToolbarButton onClick={() => insertText('[', '](url)')} title="Enlace">
              🔗
            </ToolbarButton>
          </EditorToolbar>

          <FormControl.Textarea
            id="wiki-content"
            name="contenido"
            label="Contenido (Markdown)"
            rows={20}
            value={formData.contenido}
            onChange={handleChange}
            placeholder="Escribe el contenido de la wiki usando Markdown..."
          />
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </ModalContent>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          variant="primary"
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? <Spinner size="sm" /> : (existingPage ? 'Guardar cambios' : 'Crear Wiki')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WikiPageModal;
