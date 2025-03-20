import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import Button from '../common/Button';
import { getWikiPages, createWikiPage, updateWikiPage } from '../../services/wiki.service';

const EditorContainer = styled.div`
  width: 100%;
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

const EditorTextarea = styled.textarea`
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  font-family: monospace;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const MarkdownPreview = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: white;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const NoContent = styled.div`
  text-align: center;
  margin: 2rem 0;
  color: #757575;
`;

const InlineWikiEditor = ({ projectId }) => {
  const [editingWiki, setEditingWiki] = useState(false);
  const [wikiContent, setWikiContent] = useState('');
  const [wikiPages, setWikiPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de la wiki
  useEffect(() => {
    const fetchWikiData = async () => {
      try {
        setIsLoading(true);
        const wikiData = await getWikiPages(projectId);
        if (wikiData && wikiData.length > 0) {
          setWikiPages(wikiData);
          setWikiContent(wikiData[0].contenido || '');
        } else {
          // Si no hay páginas wiki, creamos una con contenido por defecto
          const defaultContent = '## Descripción\nDescribe aquí los detalles de tu proyecto.\n\n## Objetivos\n- Objetivo 1\n- Objetivo 2\n- Objetivo 3\n\n## Requisitos\n- Requisito 1\n- Requisito 2\n- Requisito 3\n\n## Instrucciones\nAñade aquí las instrucciones o guías necesarias para el proyecto.\n\n## Recursos\n- [Enlace a recursos 1]\n- [Enlace a recursos 2]';
          setWikiContent(defaultContent);
          setWikiPages([]);
        }
      } catch (error) {
        console.error('Error al obtener datos de la wiki:', error);
        setWikiPages([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchWikiData();
    }
  }, [projectId]);

  // Guardar la wiki
  const handleSaveWiki = async () => {
    try {
      if (wikiPages && wikiPages.length > 0) {
        // Si ya existe una página wiki, actualizarla
        const page = wikiPages[0];
        const updatedPage = await updateWikiPage(
          projectId, 
          page._id, 
          {
            title: page.titulo || page.title || 'Wiki del Proyecto',
            content: wikiContent,
            description: page.resumen || page.description || 'Documentación principal del proyecto'
          }
        );
        setWikiPages([updatedPage]);
      } else {
        // Si no existe, crear una nueva
        const newPage = await createWikiPage(
          projectId, 
          {
            title: 'Wiki del Proyecto',
            content: wikiContent,
            description: 'Documentación principal del proyecto'
          }
        );
        setWikiPages([newPage]);
      }
      setEditingWiki(false);
    } catch (error) {
      console.error('Error al guardar la wiki:', error);
    }
  };

  // Insertar formato markdown
  const insertMarkdownFormat = (prefix, suffix = '') => {
    const textarea = document.getElementById('wiki-editor');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const newText = text.substring(0, start) + prefix + 
                    text.substring(start, end) + 
                    suffix + 
                    text.substring(end);
    
    setWikiContent(newText);
    
    // Recuperar el foco después de la actualización
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  if (isLoading) {
    return <div>Cargando contenido wiki...</div>;
  }

  return (
    <EditorContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{wikiPages && wikiPages.length > 0 ? wikiPages[0].titulo || 'Wiki del Proyecto' : 'Wiki del Proyecto'}</h3>
        <Button
          variant={editingWiki ? "primary" : "outline"}
          onClick={() => {
            if (editingWiki) {
              // Si estamos en modo edición, guardar cambios
              handleSaveWiki();
            } else {
              // Entrar en modo edición
              setEditingWiki(true);
            }
          }}
        >
          {editingWiki ? "Guardar Cambios" : "Editar Wiki"}
        </Button>
      </div>

      {wikiPages && wikiPages.length > 0 ? (
        <div>
          {wikiPages[0].resumen && !editingWiki && (
            <p style={{ color: '#757575', marginBottom: '1rem' }}>
              {wikiPages[0].resumen}
            </p>
          )}
          
          {editingWiki ? (
            <div>
              <EditorToolbar>
                <ToolbarButton onClick={() => insertMarkdownFormat('**', '**')} title="Negrita">
                  <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdownFormat('*', '*')} title="Cursiva">
                  <i>I</i>
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdownFormat('# ')} title="Título">
                  H
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdownFormat('- ')} title="Lista">
                  •
                </ToolbarButton>
                <ToolbarButton onClick={() => insertMarkdownFormat('[', '](url)')} title="Enlace">
                  🔗
                </ToolbarButton>
              </EditorToolbar>
              <EditorTextarea
                id="wiki-editor"
                value={wikiContent}
                onChange={(e) => setWikiContent(e.target.value)}
              />
            </div>
          ) : (
            <MarkdownPreview>
              <ReactMarkdown>{wikiPages[0].contenido}</ReactMarkdown>
            </MarkdownPreview>
          )}
        </div>
      ) : (
        editingWiki ? (
          <div>
            <EditorToolbar>
              <ToolbarButton onClick={() => insertMarkdownFormat('**', '**')} title="Negrita">
                <strong>B</strong>
              </ToolbarButton>
              <ToolbarButton onClick={() => insertMarkdownFormat('*', '*')} title="Cursiva">
                <i>I</i>
              </ToolbarButton>
              <ToolbarButton onClick={() => insertMarkdownFormat('# ')} title="Título">
                H
              </ToolbarButton>
              <ToolbarButton onClick={() => insertMarkdownFormat('- ')} title="Lista">
                •
              </ToolbarButton>
              <ToolbarButton onClick={() => insertMarkdownFormat('[', '](url)')} title="Enlace">
                🔗
              </ToolbarButton>
            </EditorToolbar>
            <EditorTextarea
              id="wiki-editor"
              value={wikiContent}
              onChange={(e) => setWikiContent(e.target.value)}
            />
          </div>
        ) : (
          <NoContent>
            <p>No hay contenido wiki disponible para este proyecto.</p>
            <p>Haz clic en "Editar Wiki" para comenzar a documentar.</p>
          </NoContent>
        )
      )}
    </EditorContainer>
  );
};

export default InlineWikiEditor; 