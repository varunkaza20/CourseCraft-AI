import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CurriculumPage from './pages/CurriculumPage';
import { useAuth } from './hooks/useAuth';
import ROUTES from './constants/routes';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return <Outlet />;
};

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute />}>
        <Route element={<DashboardPage />}>
          <Route index element={<Navigate to={ROUTES.CURRICULUM} replace />} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="courses" element={<div className="flex h-full items-center justify-center text-gray-500">Course generation coming soon</div>} />
          <Route path="outcomes" element={<div className="flex h-full items-center justify-center text-gray-500">Outcome mapping coming soon</div>} />
          <Route path="export" element={<div className="flex h-full items-center justify-center text-gray-500">Export coming soon</div>} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
