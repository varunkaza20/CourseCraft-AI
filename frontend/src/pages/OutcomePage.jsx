import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OutcomeInputForm from "../components/outcome/OutcomeInputForm";
import { useOutcomes } from "../hooks/useOutcomes";
import COPOMatrixResult from "../components/outcome/COPOMatrixResult";
import CourseOutcomeResult from "../components/outcome/CourseOutcomeResult";

export default function OutcomePage() {
  const location = useLocation();
  const { getMappingById, loading } = useOutcomes();
  const [viewingMapping, setViewingMapping] = useState(null);

  // If we navigated here with a mappingId in state, load it for viewing
  useEffect(() => {
    if (location.state?.mappingId) {
      loadMapping(location.state.mappingId);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const loadMapping = async (id) => {
    try {
      const mapping = await getMappingById(id);
      setViewingMapping(mapping);
    } catch (err) {
      console.error("Failed to load mapping", err);
    }
  };

  if (loading && !viewingMapping) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If viewing an existing mapping
  if (viewingMapping) {
    const cos = viewingMapping.generatedOutcomes?.courseOutcomes || [];
    const matrix = viewingMapping.generatedOutcomes?.copoMatrix || [];
    const posCount = viewingMapping.programOutcomes?.length || 12;

    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{viewingMapping.courseName}</h2>
          <p className="text-gray-500 text-lg">{viewingMapping.courseCode} · Outcome Mapping</p>
        </div>

        <CourseOutcomeResult 
          outcomes={cos} 
          loading={false} 
          onProceedToMatrix={() => {}} // Not needed in view mode
        />

        <COPOMatrixResult 
          matrix={matrix} 
          posCount={posCount} 
          loading={false}
          onSave={() => {}} // Hide or disable save in view mode
          saving={false}
        />
        
        {/* CSS to hide "Generate CO-PO matrix" button and "Save mapping" button in view mode */}
        <style>
          {`
            button:has(.lucide-chevron-right), 
            button:has(.lucide-save) {
              display: none;
            }
          `}
        </style>
      </div>
    );
  }

  // If creating a new mapping
  return (
    <div className="w-full">
      <OutcomeInputForm />
    </div>
  );
}
