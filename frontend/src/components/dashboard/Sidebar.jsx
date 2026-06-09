import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LayoutGrid, BookOpen, BarChart2, FileDown, ChevronRight, Home, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ROUTES from '../../constants/routes';

export default function Sidebar({ isOpen = true, toggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: 'Dashboard',           icon: Home,       to: ROUTES.DASHBOARD },
    { name: 'Curriculum Builder',  icon: LayoutGrid, to: ROUTES.CURRICULUM },
    { name: 'Course Generation',   icon: BookOpen,   to: ROUTES.COURSES },
    { name: 'Outcome Mapping',     icon: BarChart2,  to: ROUTES.OUTCOMES },
    { name: 'Export And Download', icon: FileDown,   to: ROUTES.EXPORT },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300
        md:static md:z-auto
        ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 md:translate-x-0 md:w-20'}
      `}>
        {/* Logo */}
        <div className={`p-6 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
          <Link to={ROUTES.HOME} className={`flex items-center no-underline ${isOpen ? 'gap-2' : ''}`}>
            <div className="bg-primary text-white p-1.5 rounded-md flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {isOpen && <span className="font-medium text-lg text-gray-900 tracking-tight whitespace-nowrap">CourseCraft AI</span>}
          </Link>
          {isOpen && (
            <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {isOpen && (
          <div className="px-7 mb-4">
            <p className="text-xs text-gray-500 font-medium truncate">Workspace: {user?.name}</p>
          </div>
        )}

        {/* Navigation Links */}
        <nav className={`flex-1 flex flex-col gap-1 overflow-y-auto ${isOpen ? 'px-4' : 'px-3'} mt-2`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === ROUTES.DASHBOARD}
                title={!isOpen ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary-light text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isOpen && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 mt-auto border-t border-gray-100">
          <div 
            onClick={() => navigate(ROUTES.PROFILE)}
            title={!isOpen ? 'Profile' : undefined}
            className={`flex items-center ${isOpen ? 'justify-between px-2' : 'justify-center px-0'} py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shrink-0">
                {getInitials(user?.name)}
              </div>
              {isOpen && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email}</span>
                </div>
              )}
            </div>
            {isOpen && <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
          </div>
        </div>
      </div>
    </>
  );
}
