import React, { useState, useEffect } from 'react';
import { LayoutGrid, BookOpen, Calendar } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import ROUTES from '../../constants/routes';
import { useNavigate } from 'react-router-dom';

export default function ContextSelector({ contextType, contextId, onSelect }) {
  const navigate = useNavigate();
  const [curricula, setCurricula] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // default to contextType or 'curriculum'
  const [activeTab, setActiveTab] = useState(contextType || 'curriculum');

  useEffect(() => {
    if (contextType) setActiveTab(contextType);
  }, [contextType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [currRes, courseRes, progRes] = await Promise.all([
          axiosInstance.get('/api/curriculum/my-programs'),
          axiosInstance.get('/api/courses/my-courses'),
          axiosInstance.get('/api/programs/my-programs')
        ]);
        setCurricula(currRes.data.programs || []);
        setCourses(courseRes.data.courses || []);
        setPrograms(progRes.data.programs || []);
      } catch (err) {
        console.error('Failed to fetch contexts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const getActiveItems = () => {
    if (activeTab === 'curriculum') return curricula;
    if (activeTab === 'course') return courses;
    if (activeTab === 'program') return programs;
    return [];
  };

  const activeItems = getActiveItems();

  const handleSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    
    let data = null;
    if (activeTab === 'curriculum') {
      data = curricula.find(c => c._id === selectedId);
    } else if (activeTab === 'course') {
      data = courses.find(c => c._id === selectedId);
    } else if (activeTab === 'program') {
      data = programs.find(p => p._id === selectedId);
    }

    onSelect(activeTab, selectedId, data);
  };

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-900">Select Context</h3>
        <p className="text-xs text-gray-500">Choose what you want to chat about</p>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        <button
          onClick={() => handleTabClick('curriculum')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'curriculum'
              ? 'border-purple-600 text-purple-700 bg-purple-50'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-purple-600" />
          Curriculum
        </button>
        <button
          onClick={() => handleTabClick('course')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'course'
              ? 'border-green-600 text-green-700 bg-green-50'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-green-600" />
          Course
        </button>
        <button
          onClick={() => handleTabClick('program')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'program'
              ? 'border-amber-600 text-amber-700 bg-amber-50'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-600" />
          Program
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-gray-400 italic">Loading...</div>
      ) : activeItems.length === 0 ? (
        <div className="text-xs text-gray-500 italic mt-2">
          No {activeTab}s generated yet.{' '}
          <button 
            onClick={() => {
              if (activeTab === 'curriculum') navigate(ROUTES.CURRICULUM);
              if (activeTab === 'course') navigate(ROUTES.COURSES);
              if (activeTab === 'program') navigate(ROUTES.PROGRAMS);
            }}
            className="text-primary hover:underline font-medium"
          >
            Generate one →
          </button>
        </div>
      ) : (
        <select
          className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary"
          value={activeTab === contextType ? contextId || '' : ''}
          onChange={handleSelect}
        >
          <option value="" disabled>Select a {activeTab}...</option>
          {activeItems.map(item => (
            <option key={item._id} value={item._id}>
              {activeTab === 'curriculum' && `${item.programName} (${item.department})`}
              {activeTab === 'course' && `${item.courseName} (${item.courseCode})`}
              {activeTab === 'program' && `${item.programName} (${item.difficultyLevel} · ${item.numberOfWeeks} weeks)`}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
