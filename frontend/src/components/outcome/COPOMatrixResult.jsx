import React from "react";
import { Grid, Save } from "lucide-react";

export default function COPOMatrixResult({ matrix, posCount, onSave, saving, loading }) {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800">Calculating Correlation Matrix...</h3>
        <p className="text-gray-500 text-sm mt-2 text-center max-w-md">
          Mapping each Course Outcome to Program Outcomes based on skill and knowledge targets.
        </p>
      </div>
    );
  }

  if (!matrix || matrix.length === 0) return null;

  const renderValue = (val) => {
    if (val === 3) return <span className="text-green-600 font-bold">3</span>;
    if (val === 2) return <span className="text-amber-600 font-bold">2</span>;
    if (val === 1) return <span className="text-blue-600 font-bold">1</span>;
    return <span className="text-gray-300">-</span>;
  };

  const headers = Array.from({ length: posCount }, (_, i) => i + 1);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Grid className="w-6 h-6 text-amber-500" />
          CO-PO Correlation Matrix
        </h3>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-3 text-gray-600 font-semibold w-24">CO \ PO</th>
              {headers.map(num => (
                <th key={num} className="border p-3 text-gray-600 font-semibold w-12">
                  PO{num}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={`co-${row.coNumber}`} className="hover:bg-gray-50/50">
                <td className="border p-3 font-semibold text-gray-700 bg-gray-50">
                  CO{row.coNumber}
                </td>
                {headers.map(num => {
                  const mapping = row.poMappings.find(m => m.poNumber === num);
                  const val = mapping ? mapping.correlationLevel : 0;
                  return (
                    <td key={`co${row.coNumber}-po${num}`} className="border p-3">
                      {renderValue(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600 flex gap-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> 3: High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 2: Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> 1: Low</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
        >
          {saving ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : "Save Mapping"}
        </button>
      </div>
    </div>
  );
}
