import { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useNotificationStore } from './store/notificationStore';
import { initSocket, getSocket } from './socket/socket';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Spinner } from './components/ui';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFound';
import { Toaster, toast } from 'react-hot-toast';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ProjectList = lazy(() => import('./pages/projects/ProjectList'));
const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'));

const Settings = lazy(() => import('./pages/settings/Settings'));
const SearchPage = lazy(() => import('./pages/Search'));
const PublicProfile = lazy(() => import('./pages/profile/PublicProfile'));
const UIDemo = lazy(() => import('./pages/dev/UIDemo'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <Spinner size="xl" />
  </div>
);

function App() {
  const { isAuthenticated, loadUser, isLoading: authLoading } = useAuthStore();
  const { theme, setTheme, accentColor, setAccentColor } = useThemeStore();
  const { initSocketListeners, removeSocketListeners } = useNotificationStore();
  const [appLoading, setAppLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    setTheme(theme);
    setAccentColor(accentColor);
    loadUser().finally(() => setAppLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading && !appLoading) {
      const socket = initSocket();
      if (socket) {
        if (socket.connected) {
          console.log('Socket already connected, initializing listeners');
          initSocketListeners();
        } else {
          socket.on('connect', () => {
            console.log('Socket connected, initializing listeners');
            initSocketListeners();
          });
        }
      }
    }
    return () => {
      removeSocketListeners();
    };
  }, [isAuthenticated, authLoading, appLoading]);

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsPaletteOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (appLoading || authLoading) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <ErrorBoundary>
        <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="/projects" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <ProjectList />
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="/projects/:id/tasks/:taskId" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <ProjectDetail showTask />
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/projects/:id" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="/settings" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="/search" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="/profile/:userId" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <PublicProfile />
                </ProtectedRoute>
              </ErrorBoundary>
            } />

            <Route path="/dev/ui" element={
              <ErrorBoundary>
                <UIDemo />
              </ErrorBoundary>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;