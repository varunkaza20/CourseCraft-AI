import React from "react";
import { BookOpen, FileText, PenTool } from "lucide-react";

export default function OutcomeSourceSelector({ onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <button
        onClick={() => onSelect("existing_course")}
        className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-indigo-50 transition-colors"
      >
        <FileText className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">From Course</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          Select an existing individual course syllabus.
        </p>
      </button>

      <button
        onClick={() => onSelect("manual")}
        className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-indigo-50 transition-colors"
      >
        <PenTool className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold text-gray-800">Manual Entry</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          Upload a PDF syllabus or paste syllabus text manually.
        </p>
      </button>
    </div>
  );
}
