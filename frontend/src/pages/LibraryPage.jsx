import React, { useState, useEffect } from 'react';
import { usePrograms } from '../hooks/usePrograms';
import { useCourses } from '../hooks/useCourses';
import { useOutcomes } from '../hooks/useOutcomes';
import { LayoutGrid, BookOpen, BarChart2, Calendar, Loader2, Trash2 } from 'lucide-react';
import { timeAgo } from '../utils/timeAgo';
import Modal from '../components/common/Modal';
import CurriculumResult from '../components/curriculum/CurriculumResult';
import CourseResult from '../components/course/CourseResult';
import MappingResult from '../components/outcome/MappingResult';

export default function LibraryPage() {
  const { programs, loadingPrograms, fetchProgramById, deleteProgram } = usePrograms();
  const { courses, loadingCourses, getCourseById, deleteCourse } = useCourses();
  const { getMyMappings, getMappingById, deleteMapping } = useOutcomes();
  
  const [mappings, setMappings] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(true);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null); // { type, data }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingFull, setIsFetchingFull] = useState(false);

  useEffect(() => {
    getMyMappings()
      .then(m => setMappings(m || []))
      .catch(() => {})
      .finally(() => setLoadingMappings(false));
  }, [getMyMappings]);

  const handleCardClick = async (type, id) => {
    setIsFetchingFull(true);
    try {
      let fullData = null;
      if (type === 'program') {
        fullData = await fetchProgramById(id);
      } else if (type === 'course') {
        fullData = await getCourseById(id);
      } else if (type === 'mapping') {
        fullData = await getMappingById(id);
      }

      if (fullData) {
        setSelectedItem({ type, data: fullData });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load full document details:", err);
    } finally {
      setIsFetchingFull(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300); // clear after animation
  };

  const handleDelete = async (e, type, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      if (type === 'program') {
        await deleteProgram(id);
      } else if (type === 'course') {
        await deleteCourse(id);
      } else if (type === 'mapping') {
        await deleteMapping(id);
        setMappings(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const Section = ({ title, icon: Icon, items, loading, type, renderCard }) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className="w-6 h-6 text-primary" />
        {title}
      </h2>
      
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-80 h-32 shrink-0 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center text-gray-500">
          No {title.toLowerCase()} found.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x relative z-0">
          {items.map(item => renderCard(item, () => handleCardClick(type, item._id)))}
        </div>
      )}
    </div>
  );

  const renderProgramCard = (p, onClick) => (
    <div 
      key={p._id} 
      onClick={onClick}
      className="w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all snap-start flex flex-col h-40 group relative"
    >
      <button 
        onClick={(e) => handleDelete(e, 'program', p._id)}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Delete Program"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 pr-6 group-hover:text-primary transition-colors">{p.programName}</h3>
      <p className="text-sm text-gray-500 mb-auto line-clamp-2">{p.degreeType} · {p.department}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
        <Calendar className="w-3.5 h-3.5" />
        {timeAgo(p.createdAt)}
      </div>
    </div>
  );

  const renderCourseCard = (c, onClick) => (
    <div 
      key={c._id} 
      onClick={onClick}
      className="w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-emerald-500/50 transition-all snap-start flex flex-col h-40 group relative"
    >
      <button 
        onClick={(e) => handleDelete(e, 'course', c._id)}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Delete Course"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 pr-6 group-hover:text-emerald-600 transition-colors">{c.courseName}</h3>
      <p className="text-sm text-gray-500 mb-auto line-clamp-2">{c.courseCode} · {c.credits} Credits · {c.courseType}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
        <Calendar className="w-3.5 h-3.5" />
        {timeAgo(c.createdAt)}
      </div>
    </div>
  );

  const renderMappingCard = (m, onClick) => (
    <div 
      key={m._id} 
      onClick={onClick}
      className="w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-amber-500/50 transition-all snap-start flex flex-col h-40 group relative"
    >
      <button 
        onClick={(e) => handleDelete(e, 'mapping', m._id)}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Delete Mapping"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 pr-6 group-hover:text-amber-600 transition-colors">{m.courseName}</h3>
      <p className="text-sm text-gray-500 mb-auto line-clamp-2">{m.courseCode} · Source: {m.sourceType?.replace('_', ' ')}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
        <Calendar className="w-3.5 h-3.5" />
        {timeAgo(m.createdAt)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generated Content Library</h1>
          <p className="text-gray-500 mt-2">Browse and view all your generated curriculums, courses, and mapped outcomes.</p>
        </div>
        {isFetchingFull && (
          <div className="flex items-center gap-2 text-primary bg-primary-light px-4 py-2 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Loading details...</span>
          </div>
        )}
      </div>

      <Section 
        title="Curriculums" 
        icon={LayoutGrid} 
        items={programs || []} 
        loading={loadingPrograms} 
        type="program" 
        renderCard={renderProgramCard} 
      />

      <Section 
        title="Courses" 
        icon={BookOpen} 
        items={courses || []} 
        loading={loadingCourses} 
        type="course" 
        renderCard={renderCourseCard} 
      />

      <Section 
        title="Mapped Outcomes" 
        icon={BarChart2} 
        items={mappings || []} 
        loading={loadingMappings} 
        type="mapping" 
        renderCard={renderMappingCard} 
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={
          selectedItem?.type === 'program' ? 'Program Curriculum' :
          selectedItem?.type === 'course' ? 'Course Syllabus' :
          'Mapped Outcomes'
        }
      >
        {selectedItem && (
          <div className="bg-white rounded-xl p-2 sm:p-6">
            {selectedItem.type === 'program' && <CurriculumResult program={selectedItem.data} onNew={closeModal} />}
            {selectedItem.type === 'course' && <CourseResult course={selectedItem.data} onNew={closeModal} />}
            {selectedItem.type === 'mapping' && <MappingResult mapping={selectedItem.data} />}
          </div>
        )}
      </Modal>
    </div>
  );
}
