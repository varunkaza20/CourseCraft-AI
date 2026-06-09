import React, { useState } from 'react';
import CourseGeneratorForm from '../components/course/CourseGeneratorForm';
import CourseResult from '../components/course/CourseResult';
import { useCourses } from '../hooks/useCourses';

export default function CoursePage() {
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [isGenerating, setIsGenerating]       = useState(false);
  const [error, setError]                     = useState(null);
  const { generateCourse } = useCourses();

  const handleGenerate = async (formData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const course = await generateCourse(formData);
      setGeneratedCourse(course);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNew = () => setGeneratedCourse(null);

  return (
    <div className="flex gap-6 h-full min-h-[calc(100vh-120px)]">
      {/* Left: Form */}
      <div className="w-[40%] shrink-0 overflow-y-auto">
        <CourseGeneratorForm
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          error={error}
        />
      </div>

      {/* Right: Result */}
      <div className="flex-1 overflow-y-auto">
        {generatedCourse ? (
          <CourseResult course={generatedCourse} onNew={handleNew} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">No course generated yet</h3>
            <p className="text-xs text-gray-400">Fill in the form on the left and click Generate</p>
          </div>
        )}
      </div>
    </div>
  );
}
