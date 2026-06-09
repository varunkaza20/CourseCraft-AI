import React from 'react';

export default function LabSyllabusTab({ course }) {
  const lab = course.generatedSyllabus?.labSyllabus || [];
  const totalHours = lab.reduce((s, e) => s + (e.estimatedHours || 0), 0);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">Lab Syllabus</h3>
        <p className="text-xs text-gray-400 mt-0.5">{course.courseName} — Laboratory component</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 w-12">Exp. No.</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Aim</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 text-right w-16">Hours</th>
            </tr>
          </thead>
          <tbody>
            {lab.map((exp, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-3 text-center text-gray-500">{exp.experimentNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{exp.title}</td>
                <td className="px-4 py-3 text-gray-600 text-xs leading-relaxed">{exp.aim}</td>
                <td className="px-4 py-3 text-right text-gray-400">{exp.estimatedHours}h</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-100">
              <td colSpan={3} className="px-4 py-3 text-xs text-gray-500">
                Total experiments: {lab.length} · Total hours: {totalHours}h
              </td>
              <td className="px-4 py-3 text-right text-xs font-medium text-gray-700">{totalHours}h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
