import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, Calendar, AlertCircle } from "lucide-react";
import { useGeneratedPrograms } from "../hooks/useGeneratedPrograms";
import ProgramGeneratorForm from "../components/outcome/ProgramGeneratorForm";
import ProgramResult from "../components/outcome/ProgramResult";

export default function ProgramPage() {
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const {
    programs,
    loading,
    generateProgram,
    getProgramById,
    fetchPrograms
  } = useGeneratedPrograms();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.generatedProgramId) {
      handleLoadProgram(location.state.generatedProgramId);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const handleLoadProgram = async (id) => {
    setIsGenerating(true);
    setError(null);
    try {
      const prog = await getProgramById(id);
      setGeneratedProgram(prog);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load program."
      );
    } finally { 
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (formData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const prog = await generateProgram(formData);
      setGeneratedProgram(prog);
      fetchPrograms();
    } catch (err) {
      setError(
        err.response?.data?.message || "AI generation failed."
      );
    } finally { 
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">

      {/* Left panel */}
      <div className="lg:w-2/5 flex-shrink-0 overflow-y-auto custom-scrollbar">
        <ProgramGeneratorForm
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          programs={programs}
          loadingPrograms={loading}
          onSelectProgram={handleLoadProgram}
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <AlertCircle size={16} />
            {error}
            <button
              className="ml-auto text-xs underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isGenerating && (
          <div className="space-y-4 animate-pulse p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl" />
              ))}
            </div>
            <div className="h-32 bg-gray-100 rounded-xl" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
            <p className="text-center text-sm text-purple-500 animate-pulse mt-6 font-medium">
              Groq is building your program schedule...
            </p>
          </div>
        )}

        {/* Result */}
        {generatedProgram && !isGenerating && (
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <ProgramResult
              program={generatedProgram}
              onNew={() => {
                setGeneratedProgram(null);
                setError(null);
              }}
            />
          </div>
        )}

        {/* Empty state */}
        {!generatedProgram && !isGenerating && !error && (
          <div className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
            <Calendar
              size={48}
              className="text-purple-300 opacity-50"
            />
            <p className="text-base font-medium text-gray-600">
              No program generated yet
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
              Enter your program details and click generate to create a week-wise schedule.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
