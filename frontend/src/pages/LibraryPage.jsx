import React, { useState, useEffect, useRef } from 'react';
import { usePrograms } from '../hooks/usePrograms';
import { useCourses } from '../hooks/useCourses';
import { useOutcomes } from '../hooks/useOutcomes';
import { useGeneratedPrograms } from '../hooks/useGeneratedPrograms';
import { LayoutGrid, BookOpen, BarChart2, Calendar, Loader2, Trash2, CalendarCheck, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { timeAgo } from '../utils/timeAgo';
import Modal from '../components/common/Modal';
import CurriculumResult from '../components/curriculum/CurriculumResult';
import CourseResult from '../components/course/CourseResult';
import MappingResult from '../components/outcome/MappingResult';
import ProgramResult from '../components/outcome/ProgramResult';

const Section = ({ title, icon: Icon, items, loading, type, renderCard, handleCardClick, isKeyboardActive }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -336 : 336, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => {
    const isRight = e.key === 'ArrowRight';
    const isLeft = e.key === 'ArrowLeft';
    
    if (isRight || isLeft) {
      e.preventDefault();
      const cards = Array.from(scrollRef.current.querySelectorAll('.carousel-card'));
      if (cards.length === 0) return;

      const currentIndex = cards.indexOf(document.activeElement);

      if (currentIndex === -1) {
        cards[0].focus({ preventScroll: true });
      } else {
        const nextIndex = isRight 
          ? Math.min(currentIndex + 1, cards.length - 1)
          : Math.max(currentIndex - 1, 0);
        cards[nextIndex].focus();
      }
    }
  };

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className="w-6 h-6 text-primary" />
        {title}
      </h2>
      
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="w-80 h-32 shrink-0 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center text-gray-500">
          No {title.toLowerCase()} found.
        </div>
      ) : (
        <div className={`relative group/carousel ${isKeyboardActive ? 'pointer-events-none' : ''}`}>
          {items.length > 3 && (
            <button 
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary opacity-0 group-hover/carousel:opacity-100 transition-all focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div 
            ref={scrollRef} 
            onKeyDown={handleKeyDown}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x relative z-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map(item => renderCard(item, () => handleCardClick(type, item._id)))}
          </div>
          {items.length > 3 && (
            <button 
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary opacity-0 group-hover/carousel:opacity-100 transition-all focus:outline-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <style>{`.scrollbar-none::-webkit-scrollbar { display: none; }`}</style>
        </div>
      )}
    </div>
  );
};

export default function LibraryPage() {
  const { programs, loadingPrograms, fetchProgramById, deleteProgram } = usePrograms();
  const { courses, loadingCourses, getCourseById, deleteCourse } = useCourses();
  const { getMyMappings, getMappingById, deleteMapping } = useOutcomes();
  const { programs: generatedPrograms, loading: loadingGeneratedPrograms, getProgramById: getGeneratedProgramById, deleteProgram: deleteGeneratedProgram } = useGeneratedPrograms();
  
  const [mappings, setMappings] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(true);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null); // { type, data }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingFull, setIsFetchingFull] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  useEffect(() => {
    getMyMappings()
      .then(m => setMappings(m || []))
      .catch(() => {})
      .finally(() => setLoadingMappings(false));
  }, [getMyMappings]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
        setIsKeyboardActive(true);
      }
    };
    const handleGlobalMouseMove = () => setIsKeyboardActive(false);

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    window.addEventListener('mousemove', handleGlobalMouseMove, true);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      window.removeEventListener('mousemove', handleGlobalMouseMove, true);
    };
  }, []);

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
      } else if (type === 'generated_program') {
        fullData = await getGeneratedProgramById(id);
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
      } else if (type === 'generated_program') {
        await deleteGeneratedProgram(id);
      }
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleCardKeyDown = (e, onClick) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onClick();
    }
  };



  const renderProgramCard = (p, onClick) => (
    <div 
      key={p._id} 
      onClick={onClick}
      onKeyDown={(e) => handleCardKeyDown(e, onClick)}
      onMouseEnter={(e) => e.currentTarget.focus({ preventScroll: true })}
      tabIndex={0}
      className="carousel-card w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-primary/50 focus:outline-none focus:shadow-lg focus:border-primary/50 transition-all snap-start flex flex-col h-40 group relative"
    >
      <button 
        onClick={(e) => handleDelete(e, 'program', p._id)}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all z-10"
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
      onKeyDown={(e) => handleCardKeyDown(e, onClick)}
      onMouseEnter={(e) => e.currentTarget.focus({ preventScroll: true })}
      tabIndex={0}
      className="carousel-card w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-emerald-500/50 focus:outline-none focus:shadow-lg focus:border-emerald-500/50 transition-all snap-start flex flex-col h-40 group relative"
    >
      <button 
        onClick={(e) => handleDelete(e, 'course', c._id)}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all z-10"
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
      onKeyDown={(e) => handleCardKeyDown(e, onClick)}
      onMouseEnter={(e) => e.currentTarget.focus({ preventScroll: true })}
      tabIndex={0}
      className="carousel-card w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-amber-500/50 focus:outline-none focus:shadow-lg focus:border-amber-500/50 transition-all snap-start flex flex-col h-40 group relative"
    >
      <button 
        onClick={(e) => handleDelete(e, 'mapping', m._id)}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all z-10"
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

  const renderGeneratedProgramCard = (p, onClick) => (
    <div 
      key={p._id} 
      onClick={onClick}
      onKeyDown={(e) => handleCardKeyDown(e, onClick)}
      onMouseEnter={(e) => e.currentTarget.focus({ preventScroll: true })}
      tabIndex={0}
      className="carousel-card w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-purple-500/50 focus:outline-none focus:shadow-lg focus:border-purple-500/50 transition-all snap-start flex flex-col h-40 group relative"
    >
      <button 
        onClick={(e) => handleDelete(e, 'generated_program', p._id)}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all z-10"
        title="Delete Program Schedule"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 pr-6 group-hover:text-purple-600 transition-colors">{p.programName}</h3>
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-auto capitalize line-clamp-2">
        {p.difficultyLevel} · {p.numberOfWeeks} weeks
        {p.includesCapstone && (
          <>
            <span className="text-gray-300 ml-1">·</span>
            <span className="text-amber-600 flex items-center gap-0.5 ml-1 text-xs font-medium">
              <Trophy className="w-3 h-3" /> Capstone
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
        <Calendar className="w-3.5 h-3.5" />
        {timeAgo(p.createdAt)}
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
        handleCardClick={handleCardClick}
        isKeyboardActive={isKeyboardActive}
      />

      <Section 
        title="Courses" 
        icon={BookOpen} 
        items={courses || []} 
        loading={loadingCourses} 
        type="course" 
        renderCard={renderCourseCard} 
        handleCardClick={handleCardClick}
        isKeyboardActive={isKeyboardActive}
      />

      <Section 
        title="Mapped Outcomes" 
        icon={BarChart2} 
        items={mappings || []} 
        loading={loadingMappings} 
        type="mapping" 
        renderCard={renderMappingCard} 
        handleCardClick={handleCardClick}
        isKeyboardActive={isKeyboardActive}
      />

      <Section 
        title="Program Schedules Generated" 
        icon={CalendarCheck} 
        items={generatedPrograms || []} 
        loading={loadingGeneratedPrograms} 
        type="generated_program" 
        renderCard={renderGeneratedProgramCard} 
        handleCardClick={handleCardClick}
        isKeyboardActive={isKeyboardActive}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={
          selectedItem?.type === 'program' ? 'Program Curriculum' :
          selectedItem?.type === 'course' ? 'Course Syllabus' :
          selectedItem?.type === 'generated_program' ? 'Program Schedule' :
          'Mapped Outcomes'
        }
      >
        {selectedItem && (
          <div className="bg-white rounded-xl p-2 sm:p-6">
            {selectedItem.type === 'program' && <CurriculumResult program={selectedItem.data} onNew={closeModal} />}
            {selectedItem.type === 'course' && <CourseResult course={selectedItem.data} onNew={closeModal} />}
            {selectedItem.type === 'generated_program' && <ProgramResult program={selectedItem.data} onNew={closeModal} />}
            {selectedItem.type === 'mapping' && <MappingResult mapping={selectedItem.data} />}
          </div>
        )}
      </Modal>
    </div>
  );
}
