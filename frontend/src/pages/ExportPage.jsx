import React, { useEffect, useState } from 'react';
import { useOutcomes } from '../hooks/useOutcomes';
import { useCourses } from '../hooks/useCourses';
import { usePrograms } from '../hooks/usePrograms';
import ExportSection from '../components/export/ExportSection';
import { Loader2 } from 'lucide-react';

export default function ExportPage() {
  const { getMyMappings, getMappingById, loading: loadingMappings } = useOutcomes();
  const { courses, getCourseById, loadingCourses } = useCourses();
  const { programs, fetchProgramById, loadingPrograms } = usePrograms();

  const [mappings, setMappings] = useState([]);
  
  // sourceSelection will be string like "mapping_ID", "course_ID", "program_ID"
  const [selectedSource, setSelectedSource] = useState("");
  const [curriculumData, setCurriculumData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const m = await getMyMappings();
        setMappings(m || []);
      } catch (err) {
        console.error("Failed to fetch mappings", err);
      }
    };
    fetchMappings();
  }, [getMyMappings]);

  useEffect(() => {
    if (!selectedSource) {
      setCurriculumData(null);
      return;
    }

    const [type, id] = selectedSource.split("_");
    
    const fetchFullData = async () => {
      setFetchingData(true);
      try {
        if (type === "mapping") {
          const fullMapping = await getMappingById(id);
          if (fullMapping) {
            setCurriculumData({ docType: "mapping", data: fullMapping });
          }
        } else if (type === "course") {
          const fullCourse = await getCourseById(id);
          if (fullCourse) {
            setCurriculumData({ docType: "course", data: fullCourse });
          }
        } else if (type === "program") {
          const fullProgram = await fetchProgramById(id);
          if (fullProgram) {
            setCurriculumData({ docType: "program", data: fullProgram });
          }
        }
      } catch (err) {
        console.error("Failed to fetch full data", err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchFullData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource]);

  const isLoading = loadingMappings || loadingCourses || loadingPrograms;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Export and Download</h2>
        <p className="text-gray-500">Select an existing generated program, course, or mapped outcome to export to PDF.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 max-w-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Source</h3>
        {isLoading && !mappings.length && !courses.length && !programs.length ? (
          <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="">-- Choose a Source to Export --</option>
            
            {programs.length > 0 && (
              <optgroup label="Generated Curriculums (Programs)">
                {programs.map(p => (
                  <option key={`program_${p._id}`} value={`program_${p._id}`}>{p.programName}</option>
                ))}
              </optgroup>
            )}

            {courses.length > 0 && (
              <optgroup label="Generated Courses">
                {courses.map(c => (
                  <option key={`course_${c._id}`} value={`course_${c._id}`}>{c.courseCode} - {c.courseName}</option>
                ))}
              </optgroup>
            )}

            {mappings.length > 0 && (
              <optgroup label="Mapped Outcomes">
                {mappings.map(m => (
                  <option key={`mapping_${m._id}`} value={`mapping_${m._id}`}>{m.courseCode} - {m.courseName}</option>
                ))}
              </optgroup>
            )}
          </select>
        )}
      </div>

      {fetchingData && (
        <div className="flex items-center gap-3 text-gray-500 mb-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading details...</span>
        </div>
      )}

      {curriculumData && !fetchingData && (
        <div className="animate-fade-in">
          <ExportSection curriculumData={curriculumData} />
        </div>
      )}
    </div>
  );
}
