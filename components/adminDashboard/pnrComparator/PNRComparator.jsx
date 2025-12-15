// src/components/pnrComparator/PNRComparator.jsx

"use client";

import React from 'react';
import MasterUpload from './MasterUpload';
import CompanyUpload from './CompanyUpload';
import UserIdFilter from './UserIdFilter';
import CompareButton from './CompareButton';
import ComparisonResults from './ComparisonResults';
import Loader from '@/components/common/loader'; // Adjust path as needed
import { usePNRStore } from './store';

const PNRComparator = () => {
  const { isParsingMaster, isParsingCompany, isComparing, isShowingResults } = usePNRStore();

  const isLoading = isParsingMaster || isParsingCompany || isComparing || isShowingResults;

  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-center justify-start gap-8 p-6">
        {/* <h1 className="text-3xl font-bold text-gray-800">PNR Comparator Tool</h1> */}
        <MasterUpload />
        <UserIdFilter />
        <CompanyUpload />
        <CompareButton />
        <ComparisonResults />
      </div>

      {/* Global Loader Overlay */}
      {isLoading && (
        <Loader 
          message={
            isParsingMaster 
              ? 'Parsing Master Data file...' 
              : isParsingCompany 
              ? 'Parsing Company Data file...' 
              : isComparing
              ? 'Comparing PNRs, please wait...'
              : 'Preparing results...'  // ← This shows when results are displaying
          } 
        />
      )}
    </>
  );
};

export default PNRComparator;