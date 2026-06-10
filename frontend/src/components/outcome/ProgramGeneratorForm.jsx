import React, { useState } from "react";
import { Sprout, Zap, Flame, Sparkles, ChevronRight, Trophy, X, Info, AlertTriangle } from "lucide-react";

const ProgramGeneratorForm = ({ onGenerate, isGenerating, programs, onSelectProgram }) => {
  const [formData, setFormData] = useState({
    programName: "",
    difficultyLevel: "",
    numberOfWeeks: ""
  });
  const [includesCapstone, setIncludesCapstone] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.programName) {
      newErrors.programName = "Program name is required";
    } else if (formData.programName.length < 3) {
      newErrors.programName = "Program name must be at least 3 characters";
    }
    if (!formData.difficultyLevel) {
      newErrors.difficultyLevel = "Please select a difficulty level";
    }
    if (!formData.numberOfWeeks) {
      newErrors.numberOfWeeks = "Number of weeks is required";
    } else {
      const weeks = Number(formData.numberOfWeeks);
      if (weeks < 1 || weeks > 50) {
        newErrors.numberOfWeeks = "Weeks must be between 1 and 50";
      } else if (!Number.isInteger(weeks)) {
        newErrors.numberOfWeeks = "Please enter a whole number";
      }
    }
    if (includesCapstone === null) {
      newErrors.capstone = "Please select a capstone option";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onGenerate({ ...formData, includesCapstone });
    }
  };

  const getWeeksLabel = (weeks) => {
    const w = Number(weeks);
    if (!w) return null;
    if (w <= 2) return "Focused crash course";
    if (w <= 6) return "Short program";
    if (w <= 12) return "Standard bootcamp";
    if (w <= 24) return "Extended program";
    return "Full course";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Program Generator</h2>
        <p className="text-sm text-gray-500 mt-1">
          Generate a week-wise learning schedule for any program or workshop
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program Name
          </label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
              errors.programName ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. Agentic AI Workshop, Python Bootcamp, Design Thinking Sprint"
            value={formData.programName}
            onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
          />
          {errors.programName ? (
            <p className="mt-1 text-sm text-red-500">{errors.programName}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Enter the name of your workshop, bootcamp, or program
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Beginner */}
            <div
              onClick={() => setFormData({ ...formData, difficultyLevel: "beginner" })}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                formData.difficultyLevel === "beginner"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-100 hover:border-green-200"
              }`}
            >
              <Sprout className={`w-5 h-5 mb-2 ${
                formData.difficultyLevel === "beginner" ? "text-green-600" : "text-gray-400"
              }`} />
              <div className="font-medium text-sm text-gray-900">Beginner</div>
              <div className="text-xs text-gray-500 mt-1">No prior knowledge assumed</div>
            </div>

            {/* Intermediate */}
            <div
              onClick={() => setFormData({ ...formData, difficultyLevel: "intermediate" })}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                formData.difficultyLevel === "intermediate"
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-100 hover:border-amber-200"
              }`}
            >
              <Zap className={`w-5 h-5 mb-2 ${
                formData.difficultyLevel === "intermediate" ? "text-amber-600" : "text-gray-400"
              }`} />
              <div className="font-medium text-sm text-gray-900">Intermediate</div>
              <div className="text-xs text-gray-500 mt-1">Basic familiarity required</div>
            </div>

            {/* Advanced */}
            <div
              onClick={() => setFormData({ ...formData, difficultyLevel: "advanced" })}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                formData.difficultyLevel === "advanced"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-100 hover:border-red-200"
              }`}
            >
              <Flame className={`w-5 h-5 mb-2 ${
                formData.difficultyLevel === "advanced" ? "text-red-600" : "text-gray-400"
              }`} />
              <div className="font-medium text-sm text-gray-900">Advanced</div>
              <div className="text-xs text-gray-500 mt-1">Strong domain knowledge needed</div>
            </div>
          </div>
          {errors.difficultyLevel && (
            <p className="mt-2 text-sm text-red-500">{errors.difficultyLevel}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Number of Weeks
            </label>
            {formData.numberOfWeeks && !errors.numberOfWeeks && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                {getWeeksLabel(formData.numberOfWeeks)}
              </span>
            )}
          </div>
          <input
            type="number"
            min="1"
            max="50"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
              errors.numberOfWeeks ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="e.g. 8"
            value={formData.numberOfWeeks}
            onChange={(e) => setFormData({ ...formData, numberOfWeeks: e.target.value })}
          />
          {errors.numberOfWeeks && (
            <p className="mt-1 text-sm text-red-500">{errors.numberOfWeeks}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capstone Project
          </label>
          <p className="text-xs text-gray-500 mb-3">
            A capstone dedicates the final week(s) to an integrative project that applies all learned skills.
          </p>
          <div className="flex gap-3">
            <div
              onClick={() => { setIncludesCapstone(true); setErrors({...errors, capstone: null}); }}
              className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-start gap-1 ${
                includesCapstone === true
                  ? "border-amber-500 bg-[#FEF3C7]"
                  : "border-gray-200 bg-white hover:border-amber-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className={`w-4 h-4 ${includesCapstone === true ? "text-amber-600" : "text-gray-400"}`} />
                <span className="font-medium text-sm text-gray-900">Yes, include capstone</span>
              </div>
              <span className="text-xs text-gray-500">Final weeks dedicated to a project</span>
            </div>
            <div
              onClick={() => { setIncludesCapstone(false); setErrors({...errors, capstone: null}); }}
              className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-start gap-1 ${
                includesCapstone === false
                  ? "border-gray-400 bg-[#F9FAFB]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <X className={`w-4 h-4 ${includesCapstone === false ? "text-gray-600" : "text-gray-400"}`} />
                <span className="font-medium text-sm text-gray-900">No capstone</span>
              </div>
              <span className="text-xs text-gray-500">End with review and consolidation</span>
            </div>
          </div>
          {errors.capstone && (
            <p className="mt-2 text-xs text-red-500">{errors.capstone}</p>
          )}
          
          {includesCapstone === true && formData.numberOfWeeks && Number(formData.numberOfWeeks) >= 2 && (
            <div className="mt-3 p-3 bg-[#EFF6FF] rounded-lg flex gap-2 items-start text-[#1D4ED8] text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <p>The last {Number(formData.numberOfWeeks) > 8 ? 3 : 2} week(s) will be reserved for capstone development and presentation.</p>
            </div>
          )}
          {includesCapstone === true && formData.numberOfWeeks && Number(formData.numberOfWeeks) < 2 && (
            <div className="mt-3 p-3 bg-[#FFFBEB] rounded-lg flex gap-2 items-start text-amber-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>A minimum of 2 weeks is recommended for a capstone project.</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating with AI..." : "Generate Program Schedule"}
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">
          ⚡ Powered by Groq AI · Usually takes 10-20 seconds
        </p>
      </form>

      <hr className="my-8 border-gray-100" />

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-4">Your Programs</h3>
        {programs.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No programs generated yet.</p>
        ) : (
          <div className="space-y-2">
            {programs.slice(0, 5).map((prog) => (
              <div
                key={prog._id}
                onClick={() => onSelectProgram(prog._id)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    prog.difficultyLevel === "beginner" ? "bg-green-100 text-green-600" :
                    prog.difficultyLevel === "intermediate" ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {prog.difficultyLevel === "beginner" && <Sprout className="w-4 h-4" />}
                    {prog.difficultyLevel === "intermediate" && <Zap className="w-4 h-4" />}
                    {prog.difficultyLevel === "advanced" && <Flame className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{prog.programName}</div>
                    <div className="text-xs text-gray-500 capitalize flex items-center gap-1">
                      {prog.difficultyLevel} · {prog.numberOfWeeks} weeks
                      {prog.includesCapstone && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-amber-600 flex items-center gap-0.5">
                            <Trophy className="w-3 h-3" /> Capstone
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(prog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>
            ))}
            {programs.length > 5 && (
              <div className="text-center mt-2">
                <span className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                  View all
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramGeneratorForm;
