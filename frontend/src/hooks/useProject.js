import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  // Cargar detalles del proyecto
  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar proyecto');
      console.error('Error al cargar proyecto:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Cargar miembros del proyecto
  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(response.data);
    } catch (err) {
      console.error('Error al cargar miembros:', err);
    }
  }, [projectId]);

  // Cargar tareas del proyecto
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`/api/tasks/project/${projectId}`);
      setTasks(response.data);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
    }
  }, [projectId]);

  // Cargar estadísticas del proyecto
  const fetchStats = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`/api/projects/${projectId}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, [projectId]);

  // Cargar actividad del proyecto
  const fetchActivity = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(`/api/projects/${projectId}/activity`);
      setActivity(response.data);
    } catch (err) {
      console.error('Error al cargar actividad:', err);
    }
  }, [projectId]);

  // Cargar todo cuando cambia el ID del proyecto
  useEffect(() => {
    fetchProject();
    fetchMembers();
    fetchTasks();
    fetchStats();
    fetchActivity();
  }, [projectId, fetchProject, fetchMembers, fetchTasks, fetchStats, fetchActivity]);

  // Actualizar proyecto
  const updateProject = async (projectData) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, projectData);
      setProject(response.data);
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Error al actualizar proyecto';
    }
  };

  // Añadir miembro al proyecto
  const addProjectMember = async (userData) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/members`, userData);
      await fetchMembers(); // Recargar miembros
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Error al añadir miembro';
    }
  };

  // Eliminar miembro del proyecto
  const removeProjectMember = async (userId) => {
    try {
      await axios.delete(`/api/projects/${projectId}/members/${userId}`);
      await fetchMembers(); // Recargar miembros
      return true;
    } catch (err) {
      throw err.response?.data?.message || 'Error al eliminar miembro';
    }
  };

  // Actualizar rol de miembro
  const updateMemberRole = async (userId, role) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}/members/${userId}/role`, { role });
      await fetchMembers(); // Recargar miembros
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Error al actualizar rol';
    }
  };

  // Crear tarea en el proyecto
  const createTask = async (taskData) => {
    try {
      const response = await axios.post(`/api/tasks/project/${projectId}`, taskData);
      await fetchTasks(); // Recargar tareas
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Error al crear tarea';
    }
  };

  // Generar informe del proyecto
  const generateReport = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/report`);
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Error al generar informe';
    }
  };

  return {
    project,
    loading,
    error,
    members,
    tasks,
    stats,
    activity,
    refreshProject: fetchProject,
    refreshMembers: fetchMembers,
    refreshTasks: fetchTasks,
    refreshStats: fetchStats,
    refreshActivity: fetchActivity,
    updateProject,
    addProjectMember,
    removeProjectMember,
    updateMemberRole,
    createTask,
    generateReport
  };
};

export default useProject;