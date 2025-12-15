// src/components/pnrComparator/MasterUpload.jsx
import React, { useRef } from 'react';
import { FileUp, FileSpreadsheet, X } from 'lucide-react';
import { usePNRStore } from './store';

const MasterUpload = () => {
  const inputRef = useRef(null);
  const { masterFileName, setMasterFileName, handleFileUpload, handleClearFile, masterData } = usePNRStore();

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">1. Upload Master Data (Sheet: BOOKING)</h2>
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full p-8 rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center gap-4 transition-all"
      >
        <FileUp size={56} className="text-blue-600" />
        <span className="text-xl font-semibold text-gray-700">Choose Master Excel File</span>
      </button>
      <input
        type="file"
        ref={inputRef}
        accept=".xls,.xlsx"
        onChange={(e) => handleFileUpload(e, 'master')}
        className="hidden"
      />

      {masterFileName && (
        <div className="mt-4 flex items-center justify-between bg-blue-100 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={28} className="text-blue-600" />
            <span className="font-medium">{masterFileName}</span>
          </div>
          <button onClick={() => handleClearFile('master')} className="text-red-600 hover:bg-red-100 p-2 rounded">
            <X size={20} />
          </button>
        </div>
      )}

      {masterData && (
        <div className="mt-4 p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-600">
            Total rows: <strong>{masterData.totalRows}</strong> → 
            Unique PNRs: <strong>{masterData.pnrs.size}</strong> 
            ({masterData.duplicatesRemoved} duplicates removed)
          </p>
        </div>
      )}
    </div>
  );
};

export default MasterUpload;