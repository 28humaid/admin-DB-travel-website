// src/components/pnrComparator/CompanyUpload.jsx
import React, { useRef } from 'react';
import { FileUp, FileSpreadsheet, X } from 'lucide-react';
import { usePNRStore } from './store';

const CompanyUpload = () => {
  const inputRef = useRef(null);
  const { companyFileName, setCompanyFileName, handleFileUpload, handleClearFile, companyData } = usePNRStore();

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-indigo-700">2. Upload Company Data</h2>
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full p-8 rounded-2xl border-2 border-dashed border-indigo-400 hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center gap-4 transition-all"
      >
        <FileUp size={56} className="text-indigo-600" />
        <div className="text-center">
          <span className="text-xl font-semibold text-gray-700">Choose Company File</span>
          <p className="text-sm text-gray-500 mt-1">Supports .xlsx, .xls, and .csv</p>
        </div>
      </button>
      <input
        type="file"
        ref={inputRef}
        accept=".xls,.xlsx,.csv"
        onChange={(e) => handleFileUpload(e, 'company')}
        className="hidden"
      />

      {companyFileName && (
        <div className="mt-4 flex items-center justify-between bg-indigo-100 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={28} className="text-indigo-600" />
            <span className="font-medium">{companyFileName}</span>
          </div>
          <button onClick={() => handleClearFile('company')} className="text-red-600 hover:bg-red-100 p-2 rounded">
            <X size={20} />
          </button>
        </div>
      )}

      {companyData && (
        <div className="mt-4 p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-600">
            Total rows: <strong>{companyData.totalRows}</strong> → 
            Unique PNRs: <strong>{companyData.pnrs.size}</strong> 
            ({companyData.duplicatesRemoved} duplicates removed)
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyUpload;