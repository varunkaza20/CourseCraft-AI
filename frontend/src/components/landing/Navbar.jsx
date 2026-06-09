import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import ROUTES from '../../constants/routes';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              CourseCraft<span className="text-primary">.ai</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to={ROUTES.LOGIN} className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Log in
            </Link>
            <Link to={ROUTES.LOGIN} className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
