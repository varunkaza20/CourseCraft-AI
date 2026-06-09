import React from 'react';

export default function StatsBar() {
  return (
    <section className="border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
          
          <div className="py-8 px-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">10&times;</div>
            <div className="text-sm font-medium text-gray-500">Faster than manual design</div>
          </div>
          
          <div className="py-8 px-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">OBE</div>
            <div className="text-sm font-medium text-gray-500">Outcome-based education ready</div>
          </div>
          
          <div className="py-8 px-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">Bloom's</div>
            <div className="text-sm font-medium text-gray-500">Taxonomy auto-mapped</div>
          </div>
          
          <div className="py-8 px-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">PDF/DOCX</div>
            <div className="text-sm font-medium text-gray-500">One-click export</div>
          </div>

        </div>
      </div>
    </section>
  );
}
