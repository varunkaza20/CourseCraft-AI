import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardHomePage from './pages/DashboardHomePage';
import ProfilePage from './pages/ProfilePage';
import CurriculumPage from './pages/CurriculumPage';
import CoursePage from './pages/CoursePage';
import { useAuth } from './hooks/useAuth';
import ROUTES from './constants/routes';
import { Loader2, BarChart2 } from 'lucide-react';

import OutcomePage from './pages/OutcomePage';

import ExportPage from './pages/ExportPage';

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
          <Route index element={<DashboardHomePage />} />
          <Route path="curriculum" element={<CurriculumPage />} />
          <Route path="courses"    element={<CoursePage />} />
          <Route path="outcomes"   element={<OutcomePage />} />
          <Route path="export"     element={<ExportPage />} />
          <Route path="profile"    element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
