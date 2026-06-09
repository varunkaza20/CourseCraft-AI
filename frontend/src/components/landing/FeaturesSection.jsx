import React from 'react';
import { LayoutGrid, BookOpen, BarChart2, FileDown } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-3 block">Core features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 max-w-2xl">
            Everything you need to design great programs
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl">
            Four tightly integrated tools that take you from program brief to accreditation-ready report.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-6">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Curriculum generation</h3>
            <p className="text-gray-600 leading-relaxed">
              Enter your program details and get a structured semester-wise curriculum with credit distribution, course types, and prerequisites — powered by Gemini AI.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="w-12 h-12 bg-[#E1F5EE] rounded-lg flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-[#0F6E56]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Course design</h3>
            <p className="text-gray-600 leading-relaxed">
              Generate detailed module plans for each course — topics, hours, teaching methods, and assessments — using Groq's fast inference engine.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="w-12 h-12 bg-[#FAEEDA] rounded-lg flex items-center justify-center mb-6">
              <BarChart2 className="w-6 h-6 text-[#B45309]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">CO-PO mapping</h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically tag course outcomes to Bloom's taxonomy levels and generate a visual CO-PO correlation matrix for accreditation compliance.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="w-12 h-12 bg-[#FAECE7] rounded-lg flex items-center justify-center mb-6">
              <FileDown className="w-6 h-6 text-[#C2410C]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Export and download</h3>
            <p className="text-gray-600 leading-relaxed">
              Download your complete curriculum, syllabus, or outcomes report as a formatted PDF or DOCX file ready for submission or sharing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
