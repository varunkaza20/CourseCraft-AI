import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SemesterAccordion({ semester }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${isOpen ? 'border-primary/30' : 'border-gray-200'}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors ${isOpen ? 'bg-primary-light' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-4">
          <h4 className="font-medium text-gray-900">Semester {semester.semesterNumber}</h4>
          <span className="text-sm text-gray-500 hidden sm:block">
            {semester.totalCredits} credits &middot; {semester.courses.length} courses
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 sm:hidden">
            {semester.totalCredits} cr
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="overflow-x-auto bg-white border-t border-primary/20">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="px-4 py-3 border-b border-gray-200 w-24">Code</th>
                <th className="px-4 py-3 border-b border-gray-200">Course Name</th>
                <th className="px-4 py-3 border-b border-gray-200 w-20 text-center">Cr</th>
                <th className="px-4 py-3 border-b border-gray-200 w-32">Type</th>
                <th className="px-4 py-3 border-b border-gray-200 w-20 text-center">Lab</th>
                <th className="px-4 py-3 border-b border-gray-200 w-32">Difficulty</th>
                <th className="px-4 py-3 border-b border-gray-200 w-32">Prereq</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {semester.courses.map((course, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 font-mono text-xs rounded">
                      {course.courseCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {course.courseName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {course.credits}
                  </td>
                  <td className="px-4 py-3">
                    {course.type === 'core' && <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Core</span>}
                    {course.type === 'elective' && <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary-light text-primary border border-primary/20">Elective</span>}
                    {course.type === 'open_elective' && <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">Open Elec</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {course.hasLab ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">Yes</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {course.difficultyLevel === 'beginner' && <span className="text-xs font-medium text-green-600 capitalize">Beginner</span>}
                    {course.difficultyLevel === 'intermediate' && <span className="text-xs font-medium text-amber-600 capitalize">Intermediate</span>}
                    {course.difficultyLevel === 'advanced' && <span className="text-xs font-medium text-red-600 capitalize">Advanced</span>}
                  </td>
                  <td className="px-4 py-3">
                    {course.prerequisite ? (
                      <span className="text-xs text-gray-500 font-mono">{course.prerequisite}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
