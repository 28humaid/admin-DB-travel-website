// src/components/pnrComparator/MasterUpload.jsx
import React, { useRef } from 'react';
import { FileUp, FileSpreadsheet, X, Upload, Combine } from 'lucide-react';
import { usePNRStore } from './store';

const MasterUpload = () => {
  const inputRef = useRef(null);
  const {
    masterFiles,
    combinedMasterData,
    handleMasterFilesSelect,
    removeMasterFile,
    handleCombineMaster,
    clearMaster,
    isCombiningMaster
  } = usePNRStore();

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        1. Upload Master Files (up to 31 days)
      </h2>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={masterFiles.length >= 31}
        className="w-full p-8 rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-4 transition-all"
      >
        <FileUp size={56} className="text-blue-600" />
        <div className="text-center">
          <span className="text-xl font-semibold text-gray-700">
            Choose Master Files
          </span>
          <p className="text-sm text-gray-500 mt-1">
            Supports .xlsx, .xls, and .csv • Max 31 files
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {masterFiles.length}/31 files selected
          </p>
        </div>
      </button>

      <input
        type="file"
        ref={inputRef}
        multiple
        accept=".xls,.xlsx,.csv"
        onChange={handleMasterFilesSelect}
        className="hidden"
      />

      {/* List of uploaded files */}
      {masterFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Uploaded files ({masterFiles.length})
            </p>
            <button
              onClick={clearMaster}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {masterFiles.map((fileObj, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={20} className="text-blue-600" />
                  <span className="text-sm font-medium truncate max-w-xs">
                    {fileObj.name}
                  </span>
                </div>
                <button
                  onClick={() => removeMasterFile(index)}
                  className="text-red-600 hover:bg-red-100 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Combine Button */}
          <button
            onClick={handleCombineMaster}
            disabled={isCombiningMaster || masterFiles.length === 0}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {isCombiningMaster ? (
              <>Combining...</>
            ) : (
              <>
                <Combine size={20} />
                Combine Files & Generate Master Data
              </>
            )}
          </button>
        </div>
      )}

      {/* Combined Preview */}
      {combinedMasterData && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-600">
            <strong>Combined Master Data Ready:</strong>
            <br />
            Total rows (all files): <strong>{combinedMasterData.totalRows}</strong> → 
            Unique PNRs: <strong>{combinedMasterData.pnrs.size}</strong> 
            ({combinedMasterData.duplicatesRemoved} duplicates removed across all files)
          </p>
          {combinedMasterData.hasUserIds && (
            <p className="text-sm text-gray-600 mt-2">
              Unique USER_IDs found: <strong>{combinedMasterData.userIds.size}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MasterUpload;