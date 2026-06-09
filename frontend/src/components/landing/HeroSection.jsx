import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-white pt-16 sm:pt-24 lg:pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Curriculum Design</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            Build outcome-based <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
              curriculums in seconds
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate complete, compliant, and modern academic programs tailored to your institution's specific needs, instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={ROUTES.LOGIN} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
              Start Designing Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
              See How It Works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Export to PDF/JSON</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>OBE Compliant</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-400/5 blur-3xl" />
      </div>
    </div>
  );
}
