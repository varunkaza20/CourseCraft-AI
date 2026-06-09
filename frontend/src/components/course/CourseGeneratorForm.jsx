import { useState } from 'react';
import { Sparkles, LayoutGrid, BookOpen, Loader2 } from 'lucide-react';
import { usePrograms } from '../../hooks/usePrograms';
import axiosInstance from '../../utils/axiosInstance';

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];
const TYPE_OPTIONS        = ['core', 'elective', 'open_elective'];
const TYPE_LABELS         = { core: 'Core', elective: 'Elective', open_elective: 'Open Elective' };
const DIFF_LABELS         = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export default function CourseGeneratorForm({ onGenerate, isGenerating, error }) {
  const { programs } = usePrograms();
  const defaultMode = programs && programs.length > 0 ? 'existing' : 'manual';
  const [mode, setMode]                     = useState(defaultMode);
  const [selectedProgramId, setProgId]      = useState('');
  const [loadingProgram, setLoadingProg]    = useState(false);
  const [programCourses, setProgramCourses] = useState([]);
  const [selectedCourseCode, setSelCourse]  = useState('');

  const [form, setForm] = useState({
    courseName: '', courseCode: '', credits: 3,
    difficultyLevel: 'intermediate', numberOfUnits: 5,
    courseType: 'core', includesLab: false, numberOfExperiments: 0,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleProgramChange = (progId) => {
    setProgId(progId);
    setSelCourse('');
    if (!progId) {
      setProgramCourses([]);
      return;
    }
    setLoadingProg(true);
    axiosInstance.get(`/api/curriculum/${progId}`)
      .then(r => {
        const allCourses = r.data.program?.generatedCurriculum?.semesters?.flatMap(s => s.courses) || [];
        setProgramCourses(allCourses);
      })
      .catch(() => setProgramCourses([]))
      .finally(() => setLoadingProg(false));
  };

  const handleCourseChange = (courseCode) => {
    setSelCourse(courseCode);
    if (!courseCode) return;
    const c = programCourses.find(x => x.courseCode === courseCode);
    if (c) {
      setForm(f => ({
        ...f,
        courseName: c.courseName || '',
        courseCode: c.courseCode || '',
        credits: c.credits || 3,
        difficultyLevel: c.difficultyLevel || 'intermediate',
        courseType: c.type || 'core',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      ...form,
      programId: mode === 'existing' ? selectedProgramId : null,
    });
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1.5";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-medium text-gray-900 mb-1">Course Syllabus Generator</h2>
      <p className="text-xs text-gray-400 mb-5">Generate a complete AI-powered course syllabus</p>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { val: 'existing', icon: LayoutGrid, title: 'From existing curriculum', desc: 'Pick a course from a generated curriculum' },
          { val: 'manual',   icon: BookOpen,   title: 'Manual course entry',       desc: 'Enter course details manually' },
        ].map(({ val, icon: Icon, title, desc }) => (
          <button
            key={val}
            type="button"
            onClick={() => setMode(val)}
            className={`text-left p-3 rounded-xl border-2 transition-all ${mode === val ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <Icon className={`w-5 h-5 mb-1.5 ${mode === val ? 'text-primary' : 'text-gray-400'}`} />
            <p className={`text-xs font-medium ${mode === val ? 'text-primary' : 'text-gray-700'}`}>{title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing mode fields */}
        {mode === 'existing' && (
          <>
            <div>
              <label className={labelCls}>Select Curriculum</label>
              <div className="relative">
                <select className={inputCls} value={selectedProgramId} onChange={e => handleProgramChange(e.target.value)}>
                  <option value="">-- Select a curriculum --</option>
                  {(programs || []).map(p => (
                    <option key={p._id} value={p._id}>{p.programName} ({p.degreeType} · {p.department})</option>
                  ))}
                </select>
                {loadingProgram && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />}
              </div>
            </div>
            {programCourses.length > 0 && (
              <div>
                <label className={labelCls}>Select Course</label>
                <select className={inputCls} value={selectedCourseCode} onChange={e => handleCourseChange(e.target.value)}>
                  <option value="">-- Select a course --</option>
                  {programCourses.map(c => (
                    <option key={c.courseCode} value={c.courseCode}>{c.courseCode} — {c.courseName} ({c.credits} cr)</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Common fields */}
        <div className="pt-2 border-t border-gray-50 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Course Name *</label>
              <input className={inputCls} value={form.courseName} onChange={e => set('courseName', e.target.value)} placeholder="e.g. Machine Learning" required />
            </div>
            <div>
              <label className={labelCls}>Course Code *</label>
              <input className={inputCls} value={form.courseCode} onChange={e => set('courseCode', e.target.value)} placeholder="e.g. CS401" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Credits (1–6) *</label>
              <input type="number" min={1} max={6} className={inputCls} value={form.credits} onChange={e => set('credits', +e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Number of Units (1–10) *</label>
              <input type="number" min={1} max={10} className={inputCls} value={form.numberOfUnits} onChange={e => set('numberOfUnits', +e.target.value)} required />
              <p className="text-[11px] text-gray-400 mt-1">Each unit covers a major topic area</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Difficulty Level</label>
              <select className={inputCls} value={form.difficultyLevel} onChange={e => set('difficultyLevel', e.target.value)}>
                {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{DIFF_LABELS[d]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Course Type</label>
              <select className={inputCls} value={form.courseType} onChange={e => set('courseType', e.target.value)}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>

          {/* Lab toggle */}
          <div>
            <label className={labelCls}>Includes Lab</label>
            <div className="flex gap-3">
              {[false, true].map(v => (
                <button key={String(v)} type="button"
                  onClick={() => set('includesLab', v)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.includesLab === v ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {form.includesLab && (
            <div>
              <label className={labelCls}>Number of Lab Experiments (1–20)</label>
              <input type="number" min={1} max={20} className={inputCls} value={form.numberOfExperiments} onChange={e => set('numberOfExperiments', +e.target.value)} />
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating with AI...</> : <><Sparkles className="w-4 h-4" />Generate course syllabus</>}
        </button>
        <p className="text-center text-[11px] text-gray-400">⚡ Powered by Groq AI · Usually takes 10–15 seconds</p>
      </form>
    </div>
  );
}
