import React from 'react';
import { LayoutGrid, BookOpen, Calendar, X } from 'lucide-react';

export default function ContextPreviewCard({ contextType, contextData, onClear }) {
  if (!contextType || !contextData) return null;

  const getConfig = () => {
    switch (contextType) {
      case 'curriculum':
        return {
          icon: <LayoutGrid className="w-4 h-4 text-purple-600" />,
          badgeClass: 'bg-purple-100 text-purple-700',
          title: contextData.programName,
          subtitle: `${contextData.department} · ${contextData.durationSemesters} semesters · ${contextData.totalCredits} credits`
        };
      case 'course':
        return {
          icon: <BookOpen className="w-4 h-4 text-green-600" />,
          badgeClass: 'bg-green-100 text-green-700',
          title: `${contextData.courseName} (${contextData.courseCode})`,
          subtitle: `${contextData.difficultyLevel} · ${contextData.credits} credits · ${contextData.numberOfUnits} units`
        };
      case 'program':
        return {
          icon: <Calendar className="w-4 h-4 text-amber-600" />,
          badgeClass: 'bg-amber-100 text-amber-700',
          title: contextData.programName,
          subtitle: `${contextData.difficultyLevel} · ${contextData.numberOfWeeks} weeks ${contextData.includesCapstone ? '· Capstone' : ''}`
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${config.badgeClass}`}>
            {contextType}
          </span>
        </div>
        <button onClick={onClear} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="text-xs text-gray-800 font-medium mb-0.5">{config.title}</div>
      <div className="text-[11px] text-gray-500">{config.subtitle}</div>
    </div>
  );
}
