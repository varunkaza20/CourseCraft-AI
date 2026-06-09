import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, BookOpen, BarChart2, FileDown, ArrowRight } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { usePrograms } from '../hooks/usePrograms';
import { timeAgo } from '../utils/timeAgo';
import ROUTES from '../constants/routes';

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const { programs, loadingPrograms } = usePrograms();
  const [stats, setStats] = useState({ curriculums: 0, courses: 0, outcomes: 0, exports: 0 });

  useEffect(() => {
    axiosInstance.get('/api/curriculum/stats')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Curriculums', value: stats.curriculums, icon: LayoutGrid, color: 'text-primary',   bg: 'bg-[#EEEDFE]' },
    { label: 'Total Courses',     value: stats.courses,     icon: BookOpen,   color: 'text-[#0F6E56]', bg: 'bg-[#E1F5EE]' },
    { label: 'Outcomes Mapped',   value: stats.outcomes,    icon: BarChart2,  color: 'text-[#B45309]', bg: 'bg-[#FAEEDA]' },
    { label: 'Exports Done',      value: stats.exports,     icon: FileDown,   color: 'text-[#C2410C]', bg: 'bg-[#FAECE7]' },
  ];

  const quickActions = [
    { label: 'Generate curriculum', desc: 'Create a new semester-wise curriculum', icon: LayoutGrid, bg: 'bg-[#EEEDFE]', color: 'text-primary', btn: 'Generate', to: ROUTES.CURRICULUM },
    { label: 'Design course syllabus', desc: 'Build a detailed course with unit plans',  icon: BookOpen,  bg: 'bg-[#E1F5EE]', color: 'text-[#0F6E56]', btn: 'Design',   to: ROUTES.COURSES },
    { label: 'Map outcomes',          desc: 'Map COs to POs using Bloom's taxonomy',     icon: BarChart2, bg: 'bg-[#FAEEDA]', color: 'text-[#B45309]', btn: 'Map',      to: ROUTES.OUTCOMES },
    { label: 'Export & download',     desc: 'Download reports as PDF or DOCX',           icon: FileDown,  bg: 'bg-[#FAECE7]', color: 'text-[#C2410C]', btn: 'Export',   to: ROUTES.EXPORT },
  ];

  const recentPrograms = [...(programs || [])].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map(({ label, desc, icon: Icon, bg, color, btn, to }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">{desc}</p>
                  <button
                    onClick={() => navigate(to)}
                    className={`inline-flex items-center gap-1 text-xs font-medium ${color} hover:opacity-80 transition-opacity`}
                  >
                    {btn} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-4">Recent activity</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {loadingPrograms ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : recentPrograms.length === 0 ? (
            <div className="p-12 text-center">
              <LayoutGrid className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Generated programs and courses will appear here.</p>
            </div>
          ) : (
            recentPrograms.map(p => (
              <div key={p._id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-[#EEEDFE] flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.programName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.department} · {p.degreeType}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(p.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
