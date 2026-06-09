import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';

export default function ProblemVsSolution() {
  const oldWay = [
    "Weeks of manual curriculum drafting across committees",
    "No systematic Bloom's taxonomy coverage check",
    "CO-PO mapping done in spreadsheets, error-prone",
    "Inconsistent credit distribution across semesters",
    "Reports manually compiled for accreditation bodies"
  ];

  const newWay = [
    "Full curriculum generated in under 2 minutes",
    "Bloom's levels auto-assigned with distribution view",
    "CO-PO matrix computed and visualised instantly",
    "Credits balanced automatically across semesters",
    "Accreditation-ready PDF/DOCX export in one click"
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-3 block">The problem</span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Curriculum design shouldn't take weeks
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Traditional methods are slow, inconsistent, and disconnected from industry needs. Here's how CourseCraft AI changes that.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#FCEBEB] px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-white rounded-full p-1 shadow-sm">
              <XCircle className="w-5 h-5 text-[#A32D2D]" />
            </div>
            <h3 className="font-semibold text-lg text-[#A32D2D]">The old way</h3>
          </div>
          <div className="p-6 flex-1 bg-gray-50/50">
            <ul className="space-y-5">
              {oldWay.map((text, i) => (
                <li key={i} className="flex gap-3 text-gray-600">
                  <XCircle className="w-5 h-5 text-[#A32D2D] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none"></div>
          <div className="bg-[#E1F5EE] px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-white rounded-full p-1 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[#0F6E56]" />
            </div>
            <h3 className="font-semibold text-lg text-[#0F6E56]">The CourseCraft way</h3>
          </div>
          <div className="p-6 flex-1">
            <ul className="space-y-5">
              {newWay.map((text, i) => (
                <li key={i} className="flex gap-3 text-gray-800">
                  <CheckCircle2 className="w-5 h-5 text-[#0F6E56] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
