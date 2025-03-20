import API from './api';

export const getNotifications = async (params = {}) => {
  const response = await API.get('/api/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await API.get('/api/notifications/count');
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await API.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await API.put('/api/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await API.delete(`/api/notifications/${notificationId}`);
  return response.data;
};
