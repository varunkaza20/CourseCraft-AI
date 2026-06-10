import React from "react";
import { CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { normalizeBloomsLabel, getBloomsColor } from "../../utils/bloomsUtils";

export default function CourseOutcomeResult({ outcomes, onProceedToMatrix, loading, includesMatrix = true }) {
  
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800">Generating Course Outcomes...</h3>
        <p className="text-gray-500 text-sm mt-2 text-center max-w-md">
          Analyzing the syllabus and extracting core competencies mapped to Bloom's Taxonomy.
        </p>
      </div>
    );
  }

  if (!outcomes || outcomes.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Generated Course Outcomes
        </h3>
      </div>

      <div className="space-y-4 mb-8">
        {outcomes.map((co) => (
          <div key={co.coNumber} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-lg font-bold flex-shrink-0">
              CO{co.coNumber}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium mb-2">{co.statement}</p>
              {(() => {
                const label = normalizeBloomsLabel(co.bloomsLevel);
                const colors = getBloomsColor(label);
                return (
                  <span style={{
                    background  : colors.bg,
                    color       : colors.text,
                    border      : `1px solid ${colors.border}`,
                    fontSize    : "11px",
                    padding     : "2px 8px",
                    borderRadius: "9999px",
                    fontWeight  : 500
                  }}>
                    Bloom's: {label}
                  </span>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onProceedToMatrix}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {includesMatrix ? (
            <>Generate CO-PO Matrix <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Save Course Outcomes <CheckCircle2 className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
