import API from './api';

export const getLeaveRequests = async (filters = {}) => {
  const response = await API.get('/leaves', { params: filters });
  return response.data;
};

export const getMyLeaveRequests = async () => {
  const response = await API.get('/leaves/me');
  return response.data;
};

export const getLeaveRequestById = async (requestId) => {
  const response = await API.get(`/leaves/${requestId}`);
  return response.data;
};

export const createLeaveRequest = async (leaveData) => {
  const response = await API.post('/leaves', leaveData);
  return response.data;
};

export const updateLeaveRequest = async (requestId, leaveData) => {
  const response = await API.put(`/leaves/${requestId}`, leaveData);
  return response.data;
};

export const cancelLeaveRequest = async (requestId) => {
  const response = await API.put(`/leaves/${requestId}/cancel`);
  return response.data;
};

export const approveLeaveRequest = async (requestId) => {
  const response = await API.put(`/leaves/${requestId}/approve`);
  return response.data;
};

export const rejectLeaveRequest = async (requestId, reason) => {
  const response = await API.put(`/leaves/${requestId}/reject`, { reason });
  return response.data;
};

export const getLeaveStatistics = async (userId = null) => {
  const params = userId ? { userId } : {};
  const response = await API.get('/leaves/statistics', { params });
  return response.data;
};
