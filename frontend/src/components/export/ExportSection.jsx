import React, { useState } from 'react';
import { generateCurriculumPDF } from '../../utils/pdfGenerator';
import { FileDown } from 'lucide-react';

export default function ExportSection({ curriculumData }) {
  const [fileName, setFileName] = useState("");

  const handleExport = () => {
    if (!curriculumData) {
      alert("No curriculum data available to export.");
      return;
    }
    generateCurriculumPDF(curriculumData, fileName);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full max-w-xl">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Export to PDF</h3>
      <p className="text-sm text-gray-500 mb-6">
        Download your fully formatted curriculum as a PDF document.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fileName">
            File Name (Optional)
          </label>
          <input
            id="fileName"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="CourseCraft_Curriculum"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <button
          onClick={handleExport}
          className="w-full sm:w-auto mt-6 sm:mt-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shrink-0 self-end"
        >
          <FileDown className="w-5 h-5" />
          Export to PDF
        </button>
      </div>
    </div>
  );
}
