// src/components/pnrComparator/CompareButton.jsx
import React from 'react';
import { usePNRStore } from './store';

const CompareButton = () => {
  const {
    combinedMasterData,
    companyData,
    selectedUserIds,
    handleCompare,
    isComparing
  } = usePNRStore();

  // Smart disable logic
  const hasMaster = !!combinedMasterData;
  const hasCompany = !!companyData;
  const hasUserIds = combinedMasterData?.hasUserIds;

  const isDisabled =
    !hasMaster ||
    !hasCompany ||
    (hasUserIds && selectedUserIds.size === 0);

  const getButtonText = () => {
    if (!hasMaster) return 'Combine Master Files First';
    if (!hasCompany) return 'Upload Company File';
    if (hasUserIds && selectedUserIds.size === 0) return 'Select at Least One USER_ID';
    return 'Compare PNRs';
  };

  return (
    <div className="w-full max-w-2xl mt-8">
      <button
        onClick={handleCompare}
        disabled={isDisabled || isComparing}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg transition-all
          ${isDisabled || isComparing
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isComparing ? 'Comparing... Please wait' : getButtonText()}
      </button>

      {/* Helpful hint when disabled */}
      {isDisabled && !isComparing && (
        <p className="mt-3 text-center text-sm text-red-600">
          {getButtonText()}
        </p>
      )}
    </div>
  );
};

export default CompareButton;