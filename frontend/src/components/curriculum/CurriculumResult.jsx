import React from 'react';
import SemesterAccordion from './SemesterAccordion';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function CurriculumResult({ program, isGenerating, error, onNew }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-red-800 font-medium text-lg">Generation failed</h3>
        <p className="text-red-600 text-sm mt-1 mb-4 text-center">{error}</p>
        <button 
          onClick={onNew}
          className="px-4 py-2 bg-white text-red-700 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="space-y-8">
        <div className="flex gap-4">
          <div className="h-24 flex-1 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-24 flex-1 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-24 flex-1 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <p className="text-sm font-medium text-primary animate-pulse">Gemini is designing your curriculum...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!program) return null;

  const { generatedCurriculum } = program;
  const { programSummary, semesters, programOutcomes } = generatedCurriculum;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{program.programName}</h2>
          <p className="text-sm text-gray-500">
            {program.degreeType} &middot; {program.department}
          </p>
        </div>
        <button 
          onClick={onNew}
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors"
        >
          New program
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100">
          <span className="text-2xl font-bold text-gray-900 mb-1">{programSummary.totalCoreCredits}</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Core credits</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100">
          <span className="text-2xl font-bold text-gray-900 mb-1">{programSummary.totalElectiveCredits}</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Elective credits</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100">
          <span className="text-2xl font-bold text-gray-900 mb-1">{programSummary.totalOpenElectiveCredits}</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Open elective</span>
        </div>
      </div>

      {/* Semesters */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Semester Plan</h3>
        <div className="space-y-3">
          {semesters.map(sem => (
            <SemesterAccordion key={sem.semesterNumber} semester={sem} />
          ))}
        </div>
      </div>

      {/* Program Outcomes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Program Outcomes (POs)</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {programOutcomes.map((po, index) => (
            <div 
              key={po.poNumber} 
              className={`flex items-start gap-4 p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
                PO{po.poNumber}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pt-1">
                {po.statement}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
