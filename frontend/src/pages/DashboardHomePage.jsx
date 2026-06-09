import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, BookOpen, BarChart2, FileDown, ArrowRight } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { usePrograms } from '../hooks/usePrograms';
import { useCourses } from '../hooks/useCourses';
import { timeAgo } from '../utils/timeAgo';
import ROUTES from '../constants/routes';

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const { programs, loadingPrograms } = usePrograms();
  const { courses, loadingCourses } = useCourses();
  const [stats, setStats] = useState({ curriculums: 0, courses: 0, outcomes: 0, exports: 0 });
  const [outcomes, setOutcomes] = useState([]);
  const [loadingOutcomes, setLoadingOutcomes] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/curriculum/stats')
      .then(r => setStats(r.data))
      .catch(() => {});

    axiosInstance.get('/api/outcomes/my-mappings')
      .then(r => setOutcomes(r.data.mappings || []))
      .catch(() => {})
      .finally(() => setLoadingOutcomes(false));
  }, []);

  const statCards = [
    { label: 'Total Curriculums', value: stats.curriculums, icon: LayoutGrid, color: 'text-primary',   bg: 'bg-[#EEEDFE]' },
    { label: 'Total Courses',     value: stats.courses,     icon: BookOpen,   color: 'text-[#0F6E56]', bg: 'bg-[#E1F5EE]' },
    { label: 'Outcomes Mapped',   value: stats.outcomes,    icon: BarChart2,  color: 'text-[#B45309]', bg: 'bg-[#FAEEDA]' },
    { label: 'Exports Done',      value: stats.exports,     icon: FileDown,   color: 'text-[#C2410C]', bg: 'bg-[#FAECE7]' },
  ];

  const quickActions = [
    { label: 'Curriculum Builder', desc: 'Create a new semester-wise curriculum', icon: LayoutGrid, bg: 'bg-[#EEEDFE]', color: 'text-primary', btn: 'Open', to: ROUTES.CURRICULUM },
    { label: 'Course Generation', desc: 'Build a detailed course with unit plans',  icon: BookOpen,  bg: 'bg-[#E1F5EE]', color: 'text-[#0F6E56]', btn: 'Open',   to: ROUTES.COURSES },
    { label: 'Outcome Mapping',          desc: "Map COs to POs using Bloom's taxonomy",     icon: BarChart2, bg: 'bg-[#FAEEDA]', color: 'text-[#B45309]', btn: 'Open',      to: ROUTES.OUTCOMES },
    { label: 'Export And Download',     desc: 'Download reports as PDF or DOCX',           icon: FileDown,  bg: 'bg-[#FAECE7]', color: 'text-[#C2410C]', btn: 'Open',   to: ROUTES.EXPORT },
  ];

  const activities = [
    ...(programs || []).map(p => ({
      id: p._id,
      name: p.programName,
      subtext: `${p.department} · ${p.degreeType}`,
      createdAt: p.createdAt,
      type: 'curriculum',
      icon: LayoutGrid,
      iconBg: 'bg-[#EEEDFE]',
      iconColor: 'text-primary',
      to: `${ROUTES.CURRICULUM}?id=${p._id}`
    })),
    ...(courses || []).map(c => ({
      id: c._id,
      name: c.courseName,
      subtext: `${c.courseCode} · ${c.credits} cr · ${c.courseType}`,
      createdAt: c.createdAt,
      type: 'course',
      icon: BookOpen,
      iconBg: 'bg-[#E1F5EE]',
      iconColor: 'text-[#0F6E56]',
      to: `${ROUTES.COURSES}?id=${c._id}`
    })),
    ...(outcomes || []).map(o => ({
      id: o._id,
      name: o.courseName,
      subtext: `${o.courseCode} · Outcome Mapping`,
      createdAt: o.createdAt,
      type: 'outcome',
      icon: BarChart2,
      iconBg: 'bg-[#FAEEDA]',
      iconColor: 'text-[#B45309]',
      to: ROUTES.OUTCOMES,
      state: { mappingId: o._id }
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const recentActivities = activities.slice(0, 5);
  const loading = loadingPrograms || loadingCourses || loadingOutcomes;

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
        <h2 className="text-base font-medium text-gray-900 mb-4">Quick Actions</h2>
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
        <h2 className="text-base font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : recentActivities.length === 0 ? (
            <div className="p-12 text-center">
              <LayoutGrid className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Generated programs and courses will appear here.</p>
            </div>
          ) : (
            recentActivities.map(act => {
              const Icon = act.icon;
              return (
                <div key={`${act.type}-${act.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${act.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${act.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">{act.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{act.type} · {act.subtext}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-gray-400">{timeAgo(act.createdAt)}</span>
                    <button
                      onClick={() => navigate(act.to, act.state ? { state: act.state } : undefined)}
                      className="px-3 py-1.5 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-medium transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
