import React, { useState } from "react";
import { Plus, Trash2, Target, AlertCircle } from "lucide-react";

export default function POInputPanel({ onPOsProvided, initialPOs = [] }) {
  const [pos, setPos] = useState(
    initialPOs.length > 0
      ? initialPOs
      : Array.from({ length: 12 }, (_, i) => ({ poNumber: i + 1, statement: "" }))
  );
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (initialPOs && initialPOs.length > 0) {
      setPos(initialPOs);
    }
  }, [initialPOs]);

  const handleUpdatePO = (index, statement) => {
    const updated = [...pos];
    updated[index].statement = statement;
    setPos(updated);
  };

  const handleAddPO = () => {
    if (pos.length >= 15) return;
    setPos([...pos, { poNumber: pos.length + 1, statement: "" }]);
  };

  const handleRemovePO = (index) => {
    if (pos.length <= 8) return;
    const updated = pos.filter((_, i) => i !== index).map((po, i) => ({
      ...po,
      poNumber: i + 1
    }));
    setPos(updated);
  };

  const handleGenerateCOs = () => {
    // Validate POs
    const validPOs = pos.filter(po => po.statement.trim() !== "");
    if (validPOs.length < 8) {
      setError("Please provide at least 8 valid Program Outcomes.");
      return;
    }
    setError(null);
    onPOsProvided(validPOs);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Program Outcomes (POs)
        </h3>
        <button
          onClick={handleAddPO}
          disabled={pos.length >= 15}
          className="flex items-center gap-1 text-sm text-primary font-medium hover:text-indigo-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add PO
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Define the Program Outcomes. Usually, there are 12 POs for engineering programs (NBA format).
        You must provide at least 8.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {pos.map((po, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-12 h-10 flex items-center justify-center bg-gray-100 rounded-lg font-semibold text-gray-700 flex-shrink-0">
              PO{po.poNumber}
            </div>
            <input
              type="text"
              value={po.statement}
              onChange={(e) => handleUpdatePO(idx, e.target.value)}
              placeholder={`Enter statement for PO${po.poNumber}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={() => handleRemovePO(idx)}
              disabled={pos.length <= 8}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerateCOs}
          className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Generate Course Outcomes
        </button>
      </div>
    </div>
  );
}
