import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Páginas de autenticación
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Páginas principales
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import CalendarPage from './pages/calendar/CalendarPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import WikiPage from './pages/wiki/WikiPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// Páginas de administración
import AdminPage from './pages/admin/AdminPage';

// Configuración global de axios
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Función para configurar los tokens de autenticación en Axios
const setupAxiosAuth = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['x-auth-token'] = token;
  }
};

// Configurar Axios al cargar la aplicación
setupAxiosAuth();

function App() {
  // Asegurarse de que los tokens se configuren en cada renderizado
  useEffect(() => {
    setupAxiosAuth();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Rutas de autenticación */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={<ProtectedRoute><Layout><Navigate to="/dashboard" /></Layout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
            
            {/* Proyectos */}
            <Route path="/projects" element={<ProtectedRoute><Layout><ProjectsListPage /></Layout></ProtectedRoute>} />
            <Route path="/projects/create" element={<ProtectedRoute projectManagerOnly><Layout><CreateProjectPage /></Layout></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><Layout><ProjectDetailPage /></Layout></ProtectedRoute>} />
            
            {/* Tareas */}
            <Route path="/tasks" element={<ProtectedRoute><Layout><TasksPage /></Layout></ProtectedRoute>} />
            <Route path="/tasks/:taskId" element={<ProtectedRoute><Layout><TaskDetailPage /></Layout></ProtectedRoute>} />
            
            {/* Calendario */}
            <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
            
            {/* Documentos */}
            <Route path="/documents" element={<ProtectedRoute><Layout><DocumentsPage /></Layout></ProtectedRoute>} />
            
            {/* Wiki */}
            <Route path="/wiki" element={<ProtectedRoute><Layout><WikiPage /></Layout></ProtectedRoute>} />
            <Route path="/wiki/:wikiId" element={<ProtectedRoute><Layout><WikiPage /></Layout></ProtectedRoute>} />
            
            {/* Perfil y configuración */}
            <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
            
            {/* Rutas de administración */}
            <Route path="/admin/*" element={<ProtectedRoute managerOnly><Layout><AdminPage /></Layout></ProtectedRoute>} />
            
            {/* Página no encontrada */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
