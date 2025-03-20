import API from './api';

const setToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

export const login = async (credentials) => {
  try {
    const response = await API.post('/auth/login', credentials);
    const { token, user } = response.data;
    setToken(token, credentials.rememberMe);
    return { token, user };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

export const register = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al registrar usuario');
  }
};

export const forgotPassword = async (email) => {
  const response = await API.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await API.post(`/api/auth/reset-password/${token}`, { password: newPassword });
  return response.data;
};

export const getProfile = async () => {
  try {
    const response = await API.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener perfil');
  }
};

export const updateProfile = async (userData) => {
  const response = await API.put('/api/auth/me', userData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await API.post('/api/auth/change-password', passwordData);
  return response.data;
};

export const logout = () => {
  removeToken();
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

export default {
  login,
  register,
  logout,
  getProfile,
  isAuthenticated
};
