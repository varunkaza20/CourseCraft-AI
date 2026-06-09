import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import LabSyllabusTab from './LabSyllabusTab';

const TYPE_LABELS = { core: 'Core', elective: 'Elective', open_elective: 'Open Elective' };
const DIFF_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export default function CourseResult({ course, onNew }) {
  const [activeTab, setActiveTab] = useState('course');
  const syllabus = course.generatedSyllabus || {};
  const units    = syllabus.units || [];
  const totalHours = units.reduce((s, u) => s + (u.estimatedHours || 0), 0);
  const hasLab   = course.includesLab && (syllabus.labSyllabus?.length > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-gray-50">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{course.courseName}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {course.courseCode} · {course.credits} Credits · {TYPE_LABELS[course.courseType] || course.courseType}
            {' · '}{DIFF_LABELS[course.difficultyLevel] || course.difficultyLevel}
          </p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New course
        </button>
      </div>

      {/* Tabs */}
      {hasLab && (
        <div className="flex border-b border-gray-100 px-5">
          {['course', 'lab'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'course' ? 'Course syllabus' : 'Lab syllabus'}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-6">
        {activeTab === 'course' ? (
          <>
            {/* Description */}
            {syllabus.courseDescription && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 italic leading-relaxed">{syllabus.courseDescription}</p>
              </div>
            )}

            {/* Prerequisites */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Prerequisites</h3>
              {syllabus.prerequisites?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {syllabus.prerequisites.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{p}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">None</p>
              )}
            </div>

            {/* Objectives */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Course objectives</h3>
              <div className="space-y-2">
                {(syllabus.courseObjectives || []).map((obj, i) => (
                  <div key={i} className="flex gap-3 border-l-2 border-green-400 pl-3">
                    <span className="text-xs text-gray-500 mt-0.5 shrink-0">{i + 1}.</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Unit-wise syllabus */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Unit-wise syllabus</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 w-12">Unit</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500">Unit Title</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500">Topics</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 text-right w-20">Est. Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 text-center font-medium text-gray-500">{u.unitNumber}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 align-top">{u.unitTitle}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs leading-relaxed">{(u.topics || []).join(', ')}</td>
                        <td className="px-4 py-3 text-right text-gray-400">{u.estimatedHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-100">
                      <td colSpan={3} className="px-4 py-3 text-xs font-medium text-gray-700">Total</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-gray-800">{totalHours}h</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        ) : (
          <LabSyllabusTab course={course} />
        )}
      </div>
    </div>
  );
}
