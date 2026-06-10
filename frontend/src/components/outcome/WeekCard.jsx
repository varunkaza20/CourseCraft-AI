import React from "react";
import { ChevronDown, ChevronUp, BookOpen, Zap, CheckSquare, Trophy } from "lucide-react";

const WeekCard = ({ week, isOpen, onToggle, difficultyLevel, isCapstoneWeek = false }) => {
  const { weekNumber, weekTitle, theme, topics, activities, deliverables, estimatedHours } = week;

  const bgColors = {
    beginner: { badgeBg: "bg-green-100", badgeText: "text-green-800", openBg: "bg-green-50" },
    intermediate: { badgeBg: "bg-amber-100", badgeText: "text-amber-800", openBg: "bg-amber-50" },
    advanced: { badgeBg: "bg-red-100", badgeText: "text-red-800", openBg: "bg-red-50" }
  };

  const colors = bgColors[difficultyLevel] || bgColors.intermediate;

  const containerBorder = isCapstoneWeek ? "border-amber-200" : "border-gray-200";
  const containerBg = isOpen ? (isCapstoneWeek ? "bg-[#FFFBEB]" : colors.openBg) : "bg-white";

  return (
    <div className={`border ${containerBorder} rounded-xl overflow-hidden transition-colors ${containerBg}`}>
      <div 
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${colors.badgeBg} ${colors.badgeText}`}>
            W{weekNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">{weekTitle}</h4>
              {isCapstoneWeek && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                  <Trophy className="w-3 h-3" /> Capstone
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 italic mt-0.5">{theme}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium whitespace-nowrap">
            {estimatedHours} hrs
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Topics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Topics</h5>
              </div>
              <ul className="space-y-2 pl-3 border-l-2 border-blue-300">
                {topics?.map((topic, idx) => (
                  <li key={idx} className="text-sm text-gray-700 relative pl-2 before:content-[''] before:absolute before:left-[-17px] before:top-[7px] before:w-1.5 before:h-1.5 before:bg-blue-300 before:rounded-full">
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            {/* Activities */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-gray-400" />
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activities</h5>
              </div>
              <ul className="space-y-2 pl-3 border-l-2 border-purple-300">
                {activities?.map((activity, idx) => (
                  <li key={idx} className="text-sm text-gray-700 relative pl-2 before:content-[''] before:absolute before:left-[-17px] before:top-[7px] before:w-1.5 before:h-1.5 before:bg-purple-300 before:rounded-full">
                    {activity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="w-4 h-4 text-gray-400" />
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliverables</h5>
              </div>
              <ul className="space-y-2 pl-3 border-l-2 border-green-300">
                {deliverables?.map((deliverable, idx) => (
                  <li key={idx} className="text-sm text-gray-700 relative pl-2 before:content-[''] before:absolute before:left-[-17px] before:top-[7px] before:w-1.5 before:h-1.5 before:bg-green-300 before:rounded-full">
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WeekCard;
