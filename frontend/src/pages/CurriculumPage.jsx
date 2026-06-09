import React, { useState } from 'react';
import CurriculumForm from '../components/curriculum/CurriculumForm';
import CurriculumResult from '../components/curriculum/CurriculumResult';
import { usePrograms } from '../hooks/usePrograms';
import { LayoutGrid } from 'lucide-react';

export default function CurriculumPage() {
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const {
    programs: pastPrograms,
    fetchProgramById,
    generateProgram,
    fetchPrograms
  } = usePrograms();

  const loadProgram = async (programId) => {
    try {
      const program = await fetchProgramById(programId);
      setGeneratedProgram(program);
      setError(null);
    } catch (err) {
      console.error("Failed to load program", err);
    }
  };

  const handleGenerate = async (formData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const program = await generateProgram(formData);
      setGeneratedProgram(program);
      fetchPrograms(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate curriculum');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
        <CurriculumForm 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          pastPrograms={pastPrograms}
          onLoadProgram={loadProgram}
        />
      </div>

      {/* Right Panel: Results */}
      <div className="w-full lg:w-[60%] bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
        {generatedProgram || isGenerating || error ? (
          <div className="p-6">
            <CurriculumResult 
              program={generatedProgram} 
              isGenerating={isGenerating} 
              error={error} 
              onNew={() => {
                setGeneratedProgram(null);
                setError(null);
              }} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center min-h-[400px]">
            <LayoutGrid className="w-16 h-16 text-primary opacity-30 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No curriculum generated yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Fill in the form and click generate to create your first program.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
