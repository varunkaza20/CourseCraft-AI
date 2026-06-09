import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, LayoutGrid, BookOpen, BarChart2, FileDown } from 'lucide-react';
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
    { icon: LayoutGrid, text: "Generate semester-wise curricula in minutes" },
    { icon: BookOpen,   text: "Design detailed course syllabi with unit plans" },
    { icon: BarChart2,  text: "Map outcomes using Bloom's taxonomy" },
    { icon: FileDown,   text: "Export reports as PDF or DOCX" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[45%] bg-primary text-white flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-md flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-xl">CourseCraft AI</span>
        </div>

        {/* Middle — Project Overview */}
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-medium text-white mb-3">What is CourseCraft AI?</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              CourseCraft AI is an AI-powered academic program design platform built for educators and curriculum designers.
              It automates the most time-consuming parts of academic planning — from generating full semester-wise curricula
              to mapping learning outcomes against Bloom's taxonomy.
            </p>
          </div>

          <div>
            <h3 className="text-base font-medium text-white mb-4">What can you do here?</h3>
            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bullets */}
        <div className="space-y-3 max-w-sm mx-auto w-full">
          {["Curriculum generated in minutes", "Bloom's taxonomy auto-mapped", "Export-ready reports"].map(t => (
            <div key={t} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70 shrink-0" />
              <span className="text-sm font-medium">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] bg-white flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="bg-primary text-white p-1.5 rounded-md flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-medium text-xl text-gray-900">CourseCraft AI</span>
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
