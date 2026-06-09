import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ROUTES from '../../constants/routes';

export default function TopBar({ toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard/curriculum': return 'Curriculum Builder';
      case '/dashboard/courses': return 'Course Generation';
      case '/dashboard/outcomes': return 'Outcome Mapping';
      case '/dashboard/export': return 'Export And Download';
      case '/profile':
      case '/dashboard/profile': return 'My Profile';
      default: return 'Dashboard';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium text-gray-900">{getPageTitle()}</h1>
      </div>

      <div 
        onClick={() => navigate(ROUTES.PROFILE)}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shrink-0">
          {getInitials(user?.name)}
        </div>
      </div>
    </div>
  );
}
