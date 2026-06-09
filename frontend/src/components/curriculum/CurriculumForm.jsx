import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';

export default function CurriculumForm({ onGenerate, isGenerating, pastPrograms, onLoadProgram }) {
  const [formData, setFormData] = useState({
    programName: '',
    degreeType: 'Bachelor of Technology',
    department: '',
    specialization: '',
    durationYears: 4,
    totalCredits: 160,
    electivePreference: 30,
    careerGoals: ''
  });

  const [validationError, setValidationError] = useState('');

  const degreeOptions = [
    "Bachelor of Technology", "Bachelor of Science", "Bachelor of Engineering",
    "Master of Technology", "Master of Science", "Master of Business Administration",
    "Bachelor of Commerce", "Bachelor of Arts", "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationYears' || name === 'totalCredits' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (formData.durationYears < 2 || formData.durationYears > 5) {
      return setValidationError('Duration must be between 2 and 5 years');
    }
    if (formData.totalCredits < 120 || formData.totalCredits > 240) {
      return setValidationError('Total credits must be between 120 and 240');
    }

    onGenerate({
      ...formData,
      durationSemesters: formData.durationYears * 2
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Generate curriculum</h2>
          <p className="text-sm text-gray-500">Fill in your program details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
            <input
              type="text"
              name="programName"
              required
              value={formData.programName}
              onChange={handleChange}
              placeholder="e.g. Computer Science and Engineering"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree Type</label>
            <select
              name="degreeType"
              value={formData.degreeType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              {degreeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              name="specialization"
              required
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g. Artificial Intelligence and Machine Learning"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Years</label>
              <input
                type="number"
                name="durationYears"
                min="2"
                max="5"
                required
                value={formData.durationYears}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Semesters</label>
              <input
                type="number"
                disabled
                value={formData.durationYears * 2}
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Credits</label>
            <input
              type="number"
              name="totalCredits"
              min="120"
              max="240"
              required
              value={formData.totalCredits}
              onChange={handleChange}
              placeholder="e.g. 160"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Elective Preference</label>
            <div className="flex gap-3">
              {[30, 40, 50].map(val => (
                <div
                  key={val}
                  onClick={() => setFormData({ ...formData, electivePreference: val })}
                  className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.electivePreference === val
                      ? 'border-primary text-primary bg-primary-light'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl font-semibold">{val}%</span>
                  <span className="text-xs">Electives</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Career Goals <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="careerGoals"
              rows={3}
              value={formData.careerGoals}
              onChange={handleChange}
              placeholder="e.g. Software engineer roles in AI/ML companies..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {validationError && (
            <p className="text-red-500 text-sm font-medium">{validationError}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex justify-center items-center gap-2 h-11 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate curriculum
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              ⚡ Powered by Gemini AI &middot; Usually takes 10-20 seconds
            </p>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Your programs</h3>
        {pastPrograms.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No programs generated yet.</p>
        ) : (
          <div className="space-y-3">
            {pastPrograms.map(p => (
              <div 
                key={p._id} 
                onClick={() => onLoadProgram(p._id)}
                className="group border border-gray-200 rounded-lg p-3 hover:border-primary/30 hover:bg-primary-light/30 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{p.programName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.department} &middot; {p.degreeType}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary mt-1 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
