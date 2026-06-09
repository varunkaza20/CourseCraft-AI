import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { GraduationCap, Quote, CheckCircle2 } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel (Hidden on mobile) */}
      <div className="hidden md:flex md:w-[45%] bg-primary text-white flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-md flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium text-xl">CourseCraft AI</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 relative">
            <Quote className="w-6 h-6 text-white mb-4 opacity-70" />
            <p className="text-white text-lg leading-relaxed font-medium mb-4">
              "CourseCraft AI saved our department weeks of curriculum planning work. The Bloom's mapping alone is worth it."
            </p>
            <p className="text-primary-light text-sm">
              — Dr. Priya Sharma, Head of CSE, VIT University
            </p>
          </div>
        </div>

        <div className="space-y-3 max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary-light shrink-0" />
            <span className="text-sm font-medium">Curriculum generated in minutes</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary-light shrink-0" />
            <span className="text-sm font-medium">Bloom's taxonomy auto-mapped</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary-light shrink-0" />
            <span className="text-sm font-medium">Export-ready reports</span>
          </div>
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

          {/* Render Form */}
          {activeTab === 'login' ? <LoginForm /> : <SignupForm />}

          <p className="text-xs text-gray-500 text-center mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
