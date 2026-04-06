import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import Settings from './pages/settings/Settings';
import UIDemo from './pages/dev/UIDemo';

function App() {
  const { token, fetchUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(theme);
    if (token) {
      fetchUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        } />
        
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/dev/ui" element={<UIDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;