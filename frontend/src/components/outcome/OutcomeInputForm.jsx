import React, { useState } from "react";
import OutcomeSourceSelector from "./OutcomeSourceSelector";
import SyllabusInputPanel from "./SyllabusInputPanel";
import POInputPanel from "./POInputPanel";
import CourseOutcomeResult from "./CourseOutcomeResult";
import COPOMatrixResult from "./COPOMatrixResult";
import { useOutcomes } from "../../hooks/useOutcomes";
import { usePrograms } from "../../hooks/usePrograms";
import { useCourses } from "../../hooks/useCourses";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";
import { ChevronLeft } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const formatSyllabus = (syllabus) => {
  if (!syllabus) return "";
  let text = `Course Description: ${syllabus.courseDescription || ""}\n`;
  text += `Prerequisites: ${(syllabus.prerequisites || []).join(", ")}\n`;
  text += `Course Objectives: ${(syllabus.courseObjectives || []).join("; ")}\n\n`;
  (syllabus.units || []).forEach(u => {
    text += `Unit ${u.unitNumber}: ${u.unitTitle}\n`;
    text += `Topics: ${(u.topics || []).join(", ")}\n\n`;
  });
  return text;
};

export default function OutcomeInputForm() {
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState(null);
  
  // Data state
  const [courseDetails, setCourseDetails] = useState({ courseName: "", courseCode: "", syllabusText: "" });
  const [pos, setPos] = useState([]);
  const [cos, setCos] = useState([]);
  const [matrix, setMatrix] = useState([]);

  // Selections
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const { generateCOs, generateMatrix, saveMapping, loading } = useOutcomes();
  const { courses } = useCourses();
  const navigate = useNavigate();

  const handleSourceSelect = (type) => {
    setSourceType(type);
    if (type === "manual") {
      setStep(3);
    } else {
      setStep(2); // Step 2 is for selecting existing entity
    }
  };

  const handleEntitySelection = () => {
    if (sourceType === "existing_course") {
      if (!selectedCourseId) return;
      axiosInstance.get(`/api/courses/${selectedCourseId}`)
        .then(res => {
          const fullCourse = res.data.course;
          setCourseDetails({
            courseName: fullCourse.courseName,
            courseCode: fullCourse.courseCode,
            syllabusText: formatSyllabus(fullCourse.generatedSyllabus)
          });
          setStep(3);
        })
        .catch(err => {
          console.error("Failed to fetch full course details", err);
          alert("Failed to fetch course details.");
        });
    }
  };

  const renderSelectionStep = () => {

    if (sourceType === "existing_course") {
      return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
          <button onClick={() => setStep(1)} className="flex items-center text-sm text-gray-500 hover:text-primary mb-6"><ChevronLeft className="w-4 h-4 mr-1"/> Back</button>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Select Existing Course</h3>
          <select 
            value={selectedCourseId} 
            onChange={e => setSelectedCourseId(e.target.value)}
            className="w-full mb-6 px-4 py-2 border rounded-lg"
          >
            <option value="">-- Choose Course --</option>
            {(courses || []).map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>)}
          </select>

          <div className="flex justify-end">
            <button 
              onClick={handleEntitySelection} 
              disabled={!selectedCourseId}
              className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
            >
              Proceed
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const handlePOsProvided = async (providedPOs) => {
    setPos(providedPOs);
    setStep(5);
    try {
      const generatedCos = await generateCOs(courseDetails.syllabusText);
      setCos(generatedCos);
    } catch (err) {
      setStep(4); // Go back if failed
    }
  };

  const handleProceedToMatrix = async () => {
    setStep(6);
    try {
      const generatedMatrix = await generateMatrix(cos, pos);
      setMatrix(generatedMatrix);
    } catch (err) {
      setStep(5); // Go back if failed
    }
  };

  const handleSave = async () => {
    try {
      await saveMapping({
        sourceType,
        ...courseDetails,
        programOutcomes: pos,
        generatedOutcomes: {
          courseOutcomes: cos,
          copoMatrix: matrix,
        }
      });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Start Outcome Mapping</h2>
            <p className="text-gray-500">Choose the source of your course syllabus to begin.</p>
          </div>
          <OutcomeSourceSelector onSelect={handleSourceSelect} />
        </div>
      )}

      {step === 2 && renderSelectionStep()}

      {step === 3 && (
        <div className="space-y-6 animate-fade-in bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={courseDetails.courseName}
                onChange={(e) => setCourseDetails({...courseDetails, courseName: e.target.value})}
                placeholder="e.g. Data Structures"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                value={courseDetails.courseCode}
                onChange={(e) => setCourseDetails({...courseDetails, courseCode: e.target.value})}
                placeholder="e.g. CS201"
              />
            </div>
          </div>

          <SyllabusInputPanel 
            syllabusText={courseDetails.syllabusText} 
            onChange={(text) => setCourseDetails({...courseDetails, syllabusText: text})} 
          />

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                if (!courseDetails.courseName.trim() || !courseDetails.courseCode.trim() || !courseDetails.syllabusText.trim()) {
                  alert("Please provide the Course Name, Course Code, and Syllabus Text.");
                  return;
                }
                setStep(4);
              }}
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Proceed to Program Outcomes
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-fade-in">
          <POInputPanel 
            onPOsProvided={handlePOsProvided} 
            initialPOs={pos} 
          />
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 animate-fade-in">
          <CourseOutcomeResult 
            outcomes={cos} 
            onProceedToMatrix={handleProceedToMatrix} 
            loading={loading} 
          />
        </div>
      )}

      {step === 6 && (
        <div className="space-y-6 animate-fade-in">
          <COPOMatrixResult 
            matrix={matrix} 
            posCount={pos.length} 
            onSave={handleSave} 
            saving={loading} 
          />
        </div>
      )}

    </div>
  );
}
