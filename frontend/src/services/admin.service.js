import API from './api';

export const getDashboardStats = async () => {
  const response = await API.get('/admin/dashboard');
  return response.data;
};

export const getSystemLogs = async (filters = {}) => {
  const response = await API.get('/admin/logs', { params: filters });
  return response.data;
};

export const getUsersReport = async (filters = {}) => {
  const response = await API.get('/admin/reports/users', { params: filters });
  return response.data;
};

export const getProjectsReport = async (filters = {}) => {
  const response = await API.get('/admin/reports/projects', { params: filters });
  return response.data;
};

export const getActivityReport = async (filters = {}) => {
  const response = await API.get('/admin/reports/activity', { params: filters });
  return response.data;
};

export const manageLeavePolicies = async (policyData) => {
  const response = await API.post('/admin/leaves/policies', policyData);
  return response.data;
};

export const getLeavePolicies = async () => {
  const response = await API.get('/admin/leaves/policies');
  return response.data;
};

export const updateLeavePolicy = async (policyId, policyData) => {
  const response = await API.put(`/admin/leaves/policies/${policyId}`, policyData);
  return response.data;
};

export const deleteLeavePolicy = async (policyId) => {
  const response = await API.delete(`/admin/leaves/policies/${policyId}`);
  return response.data;
};
