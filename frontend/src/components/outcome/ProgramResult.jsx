import React, { useState } from "react";
import { Clock, BookOpen, CheckSquare, Calendar, Trophy, Star } from "lucide-react";
import WeekCard from "./WeekCard";

const ProgramResult = ({ program, onNew }) => {
  const { programName, difficultyLevel, numberOfWeeks, generatedSchedule, includesCapstone } = program;
  const { programOverview, targetAudience, prerequisites, learningOutcomes, weeklySchedule, programSummary, capstoneProject } = generatedSchedule;

  const [openWeeks, setOpenWeeks] = useState(() => Array(weeklySchedule.length).fill(true));

  const toggleWeek = (index) => {
    const newOpen = [...openWeeks];
    newOpen[index] = !newOpen[index];
    setOpenWeeks(newOpen);
  };

  const toggleAll = (open) => {
    setOpenWeeks(Array(weeklySchedule.length).fill(open));
  };

  const badgeColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-amber-100 text-amber-800",
    advanced: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900">{programName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${badgeColors[difficultyLevel] || badgeColors.intermediate}`}>
              {difficultyLevel}
            </span>
            {includesCapstone && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E] flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Capstone Included
              </span>
            )}
            <span className="text-sm text-gray-500">· {numberOfWeeks} weeks</span>
          </div>
        </div>
        <button 
          onClick={onNew}
          className="px-4 py-2 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          New Program
        </button>
      </div>

      {/* Summary Cards */}
      <div className={`grid grid-cols-2 ${includesCapstone ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
          <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{programSummary.totalHours}</div>
          <div className="text-xs text-gray-500 font-medium">Total Hours</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
          <BookOpen className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{programSummary.totalTopics}</div>
          <div className="text-xs text-gray-500 font-medium">Topics Covered</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
          <CheckSquare className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{programSummary.totalDeliverables}</div>
          <div className="text-xs text-gray-500 font-medium">Deliverables</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
          <Calendar className="w-5 h-5 text-coral-500 text-[#FF7F50] mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900">{numberOfWeeks}</div>
          <div className="text-xs text-gray-500 font-medium">Weeks</div>
        </div>
        {includesCapstone && (
          <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
            <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">Yes</div>
            <div className="text-xs text-gray-500 font-medium">Capstone</div>
          </div>
        )}
      </div>

      {/* Program Overview Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Program Overview</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{programOverview}</p>
        </div>
        
        <hr className="border-gray-100" />
        
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Audience</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{targetAudience}</p>
        </div>
        
        <hr className="border-gray-100" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prerequisites</h4>
            <div className="flex flex-wrap gap-2">
              {prerequisites?.map((prereq, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                  {prereq}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recommended Tools</h4>
            <div className="flex flex-wrap gap-2">
              {programSummary.recommendedTools?.map((tool, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Learning Outcomes</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <ul className="space-y-3">
            {learningOutcomes?.map((outcome, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-gray-700">
                <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs mt-0.5">
                  {idx + 1}
                </span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Week-Wise Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Week-Wise Schedule</h3>
            <p className="text-xs text-gray-500 mt-0.5">{numberOfWeeks} weeks · {programSummary.totalHours} total hours</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleAll(true)}
              className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Expand All
            </button>
            <button 
              onClick={() => toggleAll(false)}
              className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {weeklySchedule?.map((week, idx) => {
            const capstoneWeeks = program.generatedSchedule.capstoneProject?.suggestedWeeks || 0;
            const totalWeeks = program.generatedSchedule.weeklySchedule.length;
            const isCapstoneWeek = includesCapstone && idx >= (totalWeeks - capstoneWeeks);
            
            return (
              <WeekCard 
                key={idx}
                week={week}
                isOpen={openWeeks[idx]}
                onToggle={() => toggleWeek(idx)}
                difficultyLevel={difficultyLevel}
                isCapstoneWeek={isCapstoneWeek}
              />
            );
          })}
        </div>
      </div>

      {/* Capstone Project Section */}
      {includesCapstone && capstoneProject && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-[18px] h-[18px] text-amber-500" />
            <h3 className="text-base font-medium text-gray-900">Capstone Project</h3>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Final {capstoneProject.suggestedWeeks} Weeks
            </span>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div>
              <h4 className="text-lg font-medium text-amber-600">{capstoneProject.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{capstoneProject.description}</p>
            </div>
            
            <hr className="my-5 border-gray-100" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Objectives</h4>
                <ul className="space-y-2 border-l-2 border-amber-300 pl-3">
                  {capstoneProject.objectives?.map((obj, idx) => (
                    <li key={idx} className="text-sm text-gray-700">{idx + 1}. {obj}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Deliverables</h4>
                <ul className="space-y-2">
                  {capstoneProject.deliverables?.map((del, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <CheckSquare className="w-[14px] h-[14px] text-green-500 mt-0.5 shrink-0" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Evaluation Criteria</h4>
                <ul className="space-y-2">
                  {capstoneProject.evaluationCriteria?.map((crit, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <Star className="w-[14px] h-[14px] text-purple-500 mt-0.5 shrink-0" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramResult;
