// src/components/pnrComparator/ComparisonResults.jsx

import React from 'react';
import DataTable from '../../common/dataTable'; // Adjust path if needed
import ExcelDownloadButton from '../../common/excelDownloadButton';
import { usePNRStore } from './store';
import {
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';

const ComparisonResults = () => {
  const { comparisonResult } = usePNRStore();

  // === ALL HOOKS MUST BE CALLED HERE UNCONDITIONALLY ===
  // 1. Prepare data for your simple DataTable
  const missingPnrsData = comparisonResult?.missingPnrs 
    ? comparisonResult.missingPnrs.map(pnr => ({ 'Missing PNR': pnr }))
    : [];

  // 2. Prepare TanStack table for ExcelDownloadButton (always created, even if empty)
  const tableInstance = useReactTable({
    data: comparisonResult?.missingPnrs 
      ? comparisonResult.missingPnrs.map(pnr => ({ pnr }))
      : [],
    columns: [
      {
        accessorKey: 'pnr',
        header: 'Missing PNR',
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const exportColumns = [
    { accessorKey: 'pnr', header: 'Missing PNR' }
  ];

  // === NOW SAFE TO EARLY RETURN OR CONDITIONAL RENDER ===
  if (!comparisonResult) {
    return null;
  }

  const hasMissingPnrs = comparisonResult.missingPnrs.length > 0;

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-green-800 mb-4">Comparison Results</h3>
        <ul className="space-y-2 text-green-700">
          <li>• Master Data: {comparisonResult.masterDuplicates} duplicate PNRs removed</li>
          <li>• Company Data: {comparisonResult.companyDuplicates} duplicate PNRs removed</li>
          <li>• Filtered by {comparisonResult.selectedCount} USER_ID(s): {comparisonResult.filteredUniqueCount} unique PNRs</li>
          <li className="text-lg font-bold">
            • <span className="text-red-600">{comparisonResult.missingPnrs.length}</span> PNRs present in Master but missing in Company data
          </li>
        </ul>
      </div>

      {hasMissingPnrs && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Missing PNRs</h3>
            <ExcelDownloadButton
              table={tableInstance}
              columns={exportColumns}
              filename="Missing_PNRs.xlsx"
              greetingsMessage="PNRs present in Master Data but not in Company Data"
            />
          </div>

          <div>
            <DataTable data={missingPnrsData} hideActions={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonResults;