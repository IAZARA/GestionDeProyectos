import API from './api';

const wikiService = {
  // Funciones para wiki global
  async getGlobalWikiPages() {
    try {
      const response = await API.get('/wiki/global');
      return response.data.wikiPages || [];
    } catch (error) {
      console.error('Error al obtener páginas de la wiki global:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener páginas de la wiki global');
    }
  },

  async createGlobalWikiPage(pageData) {
    try {
      if (!pageData.title) {
        throw new Error('El título es requerido');
      }

      const response = await API.post('/wiki/global', {
        title: pageData.title.trim(),
        content: pageData.content || '',
        parent: pageData.parent || null
      });

      return response.data.wikiPage;
    } catch (error) {
      console.error('Error al crear página de wiki global:', error);
      throw new Error(error.response?.data?.message || 'Error al crear la página de wiki global');
    }
  },

  async updateGlobalWikiPage(pageId, pageData) {
    try {
      if (!pageId) {
        throw new Error('El ID de la página es requerido');
      }

      const response = await API.put(`/wiki/global/${pageId}`, {
        title: pageData.title?.trim(),
        content: pageData.content,
        parent: pageData.parent
      });

      return response.data.wikiPage;
    } catch (error) {
      console.error('Error al actualizar página de wiki global:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la página de wiki global');
    }
  },

  async deleteGlobalWikiPage(pageId) {
    try {
      if (!pageId) {
        throw new Error('El ID de la página es requerido');
      }

      await API.delete(`/wiki/global/${pageId}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar página de wiki global:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar la página de wiki global');
    }
  },

  // Funciones para wiki de proyecto
  async getWikiPages(projectId) {
    try {
      const response = await API.get(`/projects/${projectId}/wiki`);
      return response.data.wikiPages || [];
    } catch (error) {
      console.error('Error al obtener páginas de la wiki:', error);
      return [];
    }
  },

  async getWikiPageById(projectId, pageId) {
    try {
      const response = await API.get(`/projects/${projectId}/wiki/${pageId}`);
      return response.data.wikiPage;
    } catch (error) {
      console.error('Error al obtener página de la wiki:', error);
      throw error;
    }
  },

  async createWikiPage(projectId, pageData) {
    try {
      const response = await API.post(`/projects/${projectId}/wiki`, pageData);
      return response.data.wikiPage;
    } catch (error) {
      console.error('Error al crear página de wiki:', error);
      throw error;
    }
  },

  async updateWikiPage(projectId, pageId, pageData) {
    try {
      const response = await API.put(`/projects/${projectId}/wiki/${pageId}`, pageData);
      return response.data.wikiPage;
    } catch (error) {
      console.error('Error al actualizar página de wiki:', error);
      throw error;
    }
  },

  async deleteWikiPage(projectId, pageId) {
    try {
      await API.delete(`/projects/${projectId}/wiki/${pageId}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar página de wiki:', error);
      throw error;
    }
  },

  async createInitialWikiPage(projectId) {
    try {
      const initialContent = `## Descripción
Describe aquí los detalles de tu proyecto.

## Objetivos
- Objetivo 1
- Objetivo 2
- Objetivo 3

## Requisitos
- Requisito 1
- Requisito 2
- Requisito 3

## Instrucciones
Añade aquí las instrucciones o guías necesarias para el proyecto.

## Recursos
- [Enlace a recursos 1]
- [Enlace a recursos 2]
`;

      const response = await API.post(`/projects/${projectId}/wiki`, {
        title: 'Página Principal',
        content: initialContent,
        isMainPage: true
      });
      return response.data.wikiPage;
    } catch (error) {
      console.error('Error al crear la página inicial de la wiki:', error);
      throw error;
    }
  }
};

// Exportar funciones individuales para mantener compatibilidad
export const getWikiPages = wikiService.getWikiPages.bind(wikiService);
export const getWikiPageById = wikiService.getWikiPageById.bind(wikiService);
export const createWikiPage = wikiService.createWikiPage.bind(wikiService);
export const updateWikiPage = wikiService.updateWikiPage.bind(wikiService);
export const deleteWikiPage = wikiService.deleteWikiPage.bind(wikiService);
export const createInitialWikiPage = wikiService.createInitialWikiPage.bind(wikiService);

export default wikiService;
