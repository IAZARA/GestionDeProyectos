import API from './api';

const documentService = {
  async getDocuments(filters = {}) {
    try {
      const response = await API.get('/documents', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      // Ya no generamos datos mock
      return { documents: [], total: 0, totalPages: 1 };
    }
  },

  async getDocumentById(documentId) {
    try {
      const response = await API.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener documento:', error);
      throw error;
    }
  },

  async getFolders(parentId = null) {
    try {
      const params = parentId ? { parent: parentId } : {};
      const response = await API.get('/documents/folders', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener carpetas:', error);
      return [];
    }
  },

  async createFolder(folderData) {
    try {
      const response = await API.post('/documents/folders', folderData);
      return response.data;
    } catch (error) {
      console.error('Error al crear carpeta:', error);
      throw error;
    }
  },

  async getDocumentsByProject(projectId) {
    try {
      const response = await API.get(`/projects/${projectId}/documents`);
      return response.data.documents;
    } catch (error) {
      console.error('Error al obtener documentos del proyecto:', error);
      return [];
    }
  },

  async uploadDocument(projectId, file, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('description', description);
      
      // Asegurarnos de que projectId se pasa correctamente solo si existe
      if (projectId) {
        formData.append('project', projectId);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 90000, // Aumentamos el timeout a 90 segundos
        onUploadProgress: progressEvent => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Progreso de carga: ${progress}%`);
        }
      };
      
      // Intentar con la ruta específica del proyecto si se proporciona projectId
      const endpoint = projectId 
        ? `/projects/${projectId}/documents` 
        : `/documents`;
      
      try {
        const response = await API.post(endpoint, formData, config);
        return response.data.document;
      } catch (error) {
        // Si falla con la ruta específica del proyecto, intentar con la ruta general
        if (projectId && error.response && error.response.status === 404) {
          console.log('Intentando ruta alternativa para subir documentos...');
          const fallbackResponse = await API.post('/documents', formData, config);
          return fallbackResponse.data.document;
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      throw error;
    }
  },

  async updateDocument(documentId, documentData) {
    try {
      const response = await API.put(`/documents/${documentId}`, documentData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      throw error;
    }
  },

  async deleteDocument(projectId, documentId) {
    try {
      // Si no hay projectId, intentar con la ruta general
      if (!projectId) {
        await API.delete(`/documents/${documentId}`);
        return true;
      }
      
      try {
        // Primero intentar con la ruta específica del proyecto
        await API.delete(`/projects/${projectId}/documents/${documentId}`);
        return true;
      } catch (error) {
        // Si falla con error 404, intentar con la ruta general
        if (error.response && error.response.status === 404) {
          console.log('Intentando ruta alternativa para eliminar documento...');
          await API.delete(`/documents/${documentId}`);
          return true;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  },

  async deleteFolder(folderId) {
    try {
      await API.delete(`/documents/folders/${folderId}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar carpeta:', error);
      throw error;
    }
  },

  async downloadDocument(projectId, documentId) {
    try {
      const response = await API.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar documento:', error);
      throw error;
    }
  }
};

// Exportar funciones individuales para mantener compatibilidad
export const getDocuments = documentService.getDocuments.bind(documentService);
export const getDocumentById = documentService.getDocumentById.bind(documentService);
export const getFolders = documentService.getFolders.bind(documentService);
export const createFolder = documentService.createFolder.bind(documentService);
export const getDocumentsByProject = documentService.getDocumentsByProject.bind(documentService);
export const uploadDocument = documentService.uploadDocument.bind(documentService);
export const updateDocument = documentService.updateDocument.bind(documentService);
export const deleteDocument = documentService.deleteDocument.bind(documentService);
export const deleteFolder = documentService.deleteFolder.bind(documentService);
export const downloadDocument = documentService.downloadDocument.bind(documentService);

// Mantener la función formatFileSize pero moverla arriba
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default documentService;
