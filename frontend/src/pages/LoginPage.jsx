import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GraduationCap, LayoutGrid, BookOpen, Calendar, BarChart2, Layers, FileDown } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';
import ROUTES from '../constants/routes';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const features = [
    { icon: LayoutGrid, text: "Build semester-wise curricula with credit distribution" },
    { icon: BookOpen,   text: "Design course syllabi with unit breakdowns" },
    { icon: Calendar,   text: "Generate week-wise schedules with capstone support" },
    { icon: BarChart2,  text: "Map course outcomes using Bloom's taxonomy" },
    { icon: Layers,     text: "Manage all generated content in one place" },
    { icon: FileDown,   text: "Export reports as PDF or DOCX" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[45%] bg-primary text-white flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shadow-sm">
              <img src="/logo.jpg" alt="CourseCraft AI Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-3xl tracking-tight">CourseCraft AI</span>
          </div>

          {/* Project Overview */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-medium text-white mb-4">What is CourseCraft AI?</h2>
              <p className="text-white/80 text-sm leading-relaxed text-justify">
                CourseCraft AI is an AI-powered academic program design platform built for educators and curriculum designers.
                It automates the most time-consuming parts of academic planning — from generating full semester-wise curricula
                to mapping learning outcomes against Bloom's taxonomy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white mb-5">What can you do here?</h3>
              <div className="space-y-3">
                {features.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className="text-sm text-white/90 leading-snug font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] bg-white flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-primary/5">
              <img src="/logo.jpg" alt="CourseCraft AI Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-2xl tracking-tight text-gray-900">CourseCraft AI</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex w-full border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-3 text-sm font-medium text-center transition-colors ${
                activeTab === 'login'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-3 text-sm font-medium text-center transition-colors ${
                activeTab === 'signup'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign up
            </button>
          </div>

          {activeTab === 'login' ? <LoginForm /> : <SignupForm />}

          <p className="text-xs text-gray-500 text-center mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
