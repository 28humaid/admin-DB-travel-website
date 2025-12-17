// src/components/pnrComparator/CompareButton.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePNRStore } from './store';

const CompareButton = () => {
  const { masterData, companyData, selectedUserIds, isComparing, handleCompare } = usePNRStore();

  const disabled = !masterData || !companyData || isComparing;

  return (
    <button
      onClick={handleCompare}
      disabled={disabled}
      className={`px-6 py-2 text-md font-bold rounded-lg transition-all ${
        !disabled
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
      }`}
    >
      {isComparing ? (
        <>
          <Loader2 className="inline animate-spin mr-2" size={24} />
          Comparing...
        </>
      ) : (
        'Compare PNRs'
      )}
    </button>
  );
};

export default CompareButton;