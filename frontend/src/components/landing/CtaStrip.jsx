import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes';

export default function CtaStrip() {
  return (
    <div className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Ready to modernize your curriculum?</h2>
            <p className="text-gray-400 text-lg">Join forward-thinking educators building the future of learning.</p>
          </div>
          <div className="flex shrink-0 w-full md:w-auto">
            <Link to={ROUTES.LOGIN} className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
