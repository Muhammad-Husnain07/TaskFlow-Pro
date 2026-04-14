import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Spinner } from './components/ui';
import CommandPalette from './components/CommandPalette';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetail from './pages/projects/ProjectDetail';
import Settings from './pages/settings/Settings';
import SearchPage from './pages/Search';
import PublicProfile from './pages/profile/PublicProfile';
import UIDemo from './pages/dev/UIDemo';

function App() {
  const { isAuthenticated, loadUser, isLoading: authLoading } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [appLoading, setAppLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    setTheme(theme);
    loadUser().finally(() => setAppLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (appLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="xl" />
          <p className="text-gray-500 dark:text-gray-400">Loading TaskFlow Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        
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
            <ProjectDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/search" element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/dev/ui" element={<UIDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;