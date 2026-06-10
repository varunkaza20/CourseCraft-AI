import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import ROUTES from '../../constants/routes';
import { DEMO_VIDEO_URL } from '../../constants/config';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLandingPage = location.pathname === '/';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    if (isLandingPage) {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/?scrollTo=features");
    }
  };

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-primary/5 shadow-sm">
              <img src="/logo.jpg" alt="CourseCraft AI" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              CourseCraft<span className="text-primary">.ai</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              onClick={handleFeaturesClick}
              className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Features
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.open(DEMO_VIDEO_URL, "_blank", "noopener,noreferrer"); }}
              className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              How it works
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500">Go to Dashboard</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shrink-0">
                  {getInitials(user.name)}
                </div>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Log in
                </Link>
                <Link to={ROUTES.LOGIN} className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
