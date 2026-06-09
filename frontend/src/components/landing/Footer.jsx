import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2025 CourseCraft AI. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm font-medium">
            Built for educators, powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
}
