import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LayoutGrid, BookOpen, BarChart2, FileDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ROUTES from '../../constants/routes';

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: 'Curriculum Builder',  icon: LayoutGrid, to: ROUTES.CURRICULUM },
    { name: 'Course Generation',   icon: BookOpen,   to: ROUTES.COURSES },
    { name: 'Outcome Mapping',     icon: BarChart2,  to: ROUTES.OUTCOMES },
    { name: 'Export & Share',      icon: FileDown,   to: ROUTES.EXPORT },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
      {/* Logo */}
      <div className="p-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-1 no-underline">
          <div className="bg-primary text-white p-1.5 rounded-md flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-medium text-lg text-gray-900 tracking-tight">CourseCraft AI</span>
        </Link>
        <p className="text-xs text-gray-500 font-medium px-1">Workspace: {user?.name}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-light text-primary font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto border-t border-gray-100">
        <div 
          onClick={() => navigate(ROUTES.PROFILE)}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name}</span>
              <span className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
