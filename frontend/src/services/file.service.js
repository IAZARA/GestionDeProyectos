import API from './api';

export const uploadFile = async (formData) => {
  const response = await API.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getFiles = async (filters = {}) => {
  const response = await API.get('/files', { params: filters });
  return response.data;
};

export const getFileById = async (fileId) => {
  const response = await API.get(`/files/${fileId}`);
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await API.delete(`/files/${fileId}`);
  return response.data;
};

export const downloadFile = async (fileId) => {
  const response = await API.get(`/files/${fileId}/download`, { responseType: 'blob' });
  return response.data;
};

export const getTaskFiles = async (taskId) => {
  const response = await API.get(`/tasks/${taskId}/files`);
  return response.data;
};

export const getProjectFiles = async (projectId) => {
  const response = await API.get(`/projects/${projectId}/files`);
  return response.data;
};
