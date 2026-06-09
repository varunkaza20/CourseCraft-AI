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

const OutcomesPlaceholder = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center max-w-md">
      <div className="flex justify-center mb-4">
        <BarChart2 className="w-16 h-16 text-amber-300 opacity-50" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Outcome mapping</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-4">
        CO-PO mapping with Bloom's taxonomy distribution is coming in the next update.
      </p>
      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
        Coming soon
      </span>
    </div>
  </div>
);

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
          <Route path="outcomes"   element={<OutcomesPlaceholder />} />
          <Route path="export"     element={<div className="flex h-full items-center justify-center text-gray-500">Export coming soon</div>} />
          <Route path="profile"    element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
