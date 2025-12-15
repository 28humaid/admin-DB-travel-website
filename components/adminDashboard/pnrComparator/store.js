// src/components/pnrComparator/store.js
import { create } from 'zustand';
import * as XLSX from 'xlsx';
import FeedbackDialog from '@/components/common/feedbackDialog'; // For openFeedback, but we'll manage state here
// Note: FeedbackDialog is rendered in PNRComparator, but we can trigger via store if needed. For simplicity, we'll pass openFeedback as a prop or manage locally.

export const usePNRStore = create((set, get) => ({
  masterFileName: '',
  companyFileName: '',
  masterData: null,
  companyData: null,
  selectedUserIds: new Set(),
  comparisonResult: null,
  isParsingMaster: false,
  isParsingCompany: false,
  isComparing: false,
  isShowingResults: false,

  setMasterFileName: (name) => set({ masterFileName: name }),
  setCompanyFileName: (name) => set({ companyFileName: name }),

  openFeedback: (msg, isError = false) => {
    // Since FeedbackDialog is in parent, we'll assume it's handled in components or add a callback.
    // For now, we'll use alert as fallback, but in real app, lift state up or use context.
    alert(isError ? `Error: ${msg}` : msg);
  },

  findSheetCaseInsensitive: (workbook, possibleNames) => {
    const sheetNames = workbook.SheetNames;
    for (const name of possibleNames) {
      const found = sheetNames.find(sn => sn.toLowerCase() === name.toLowerCase());
      if (found) return workbook.Sheets[found];
    }
    return null;
  },

  handleFileUpload: (e, type) => {
    const file = e.target.files[0];
    set({ 
      ...(type === 'master' ? { isParsingMaster: true } : { isParsingCompany: true }) 
    });
    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!validTypes.includes(file.type) && !/\.(xls|xlsx)$/i.test(file.name)) {
      get().openFeedback('Please upload a valid .xls or .xlsx file.', true);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      get().openFeedback('File too large. Maximum size is 10MB.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        let sheet, pnrColumn, sheetNames;

        if (type === 'master') {
          sheetNames = ['BOOKING', 'Booking', 'booking'];
          sheet = get().findSheetCaseInsensitive(workbook, sheetNames);
          pnrColumn = 'PNR_NO';
          if (!sheet) {
            get().openFeedback('Sheet named "BOOKING" not found in Master file.', true);
            return;
          }
        } else {
          sheetNames = ['Bookings', 'BOOKINGS', 'bookings'];
          sheet = get().findSheetCaseInsensitive(workbook, sheetNames);
          pnrColumn = 'PNR/Ticket #';
          if (!sheet) {
            get().openFeedback('Sheet named "Bookings" not found in Company file.', true);
            return;
          }
        }

        const json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

        if (json.length === 0) {
          get().openFeedback('Selected sheet is empty.', true);
          return;
        }

        const firstRow = json[0];
        if (!(pnrColumn in firstRow)) {
          get().openFeedback(`Column "${pnrColumn}" not found in the sheet.`, true);
          return;
        }

        const pnrSet = new Set();
        const seen = new Set();
        let duplicates = 0;

        json.forEach(row => {
          const pnr = String(row[pnrColumn]).trim();
          if (pnr && !seen.has(pnr)) {
            seen.add(pnr);
            pnrSet.add(pnr);
          } else if (pnr) {
            duplicates++;
          }
        });

        if (type === 'master') {
          const userIdSet = new Set();
          json.forEach(row => {
            const userId = row['USER_ID'];
            if (userId !== undefined && userId !== '') {
              userIdSet.add(String(userId).trim());
            }
          });

          set({
            masterData: {
              rows: json,
              pnrs: pnrSet,
              userIds: userIdSet,
              duplicatesRemoved: duplicates,
              totalRows: json.length
            },
            masterFileName: file.name,
            selectedUserIds: new Set(userIdSet), // Select all by default
            comparisonResult: null
          });
          get().openFeedback(`Master file loaded: ${pnrSet.size} unique PNRs (${duplicates} duplicates removed)`, false);
        } else {
          set({
            companyData: {
              pnrs: pnrSet,
              duplicatesRemoved: duplicates,
              totalRows: json.length
            },
            companyFileName: file.name,
            comparisonResult: null
          });
          get().openFeedback(`Company file loaded: ${pnrSet.size} unique PNRs (${duplicates} duplicates removed)`, false);
        }
      } catch (err) {
        get().openFeedback('Failed to parse Excel file. It may be corrupted.', true);
      } finally{
        set({ 
          ...(type === 'master' ? { isParsingMaster: false } : { isParsingCompany: false }) 
        });
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = '';
  },

  handleClearFile: (type) => {
    if (type === 'master') {
      set({ masterFileName: '', masterData: null, selectedUserIds: new Set(), comparisonResult: null });
    } else {
      set({ companyFileName: '', companyData: null, comparisonResult: null });
    }
  },

  toggleUserId: (userId) => {
    const newSet = new Set(get().selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    set({ selectedUserIds: newSet, comparisonResult: null });
  },

  selectAllUserIds: () => {
    const { masterData, selectedUserIds } = get();
    if (selectedUserIds.size === masterData?.userIds.size) {
      set({ selectedUserIds: new Set(), comparisonResult: null });
    } else {
      set({ selectedUserIds: new Set(masterData.userIds), comparisonResult: null });
    }
  },

  handleCompare: () => {
    const { masterData, companyData, selectedUserIds } = get();
    if (!masterData || !companyData) {
      get().openFeedback('Please upload both files.', true);
      return;
    }

    if (selectedUserIds.size === 0) {
      get().openFeedback('Please select at least one USER_ID to compare.', true);
      return;
    }

    set({ isComparing: true });

    const filteredRows = masterData.rows.filter(row => {
      const userId = row['USER_ID'];
      return userId !== undefined && selectedUserIds.has(String(userId).trim());
    });

    const filteredPnrSet = new Set();
    filteredRows.forEach(row => {
      const pnr = String(row['PNR_NO']).trim();
      if (pnr) filteredPnrSet.add(pnr);
    });

    const missing = [];
    for (const pnr of filteredPnrSet) {
      if (!companyData.pnrs.has(pnr)) {
        missing.push(pnr);
      }
    }

    set({
      comparisonResult: {
        missingPnrs: missing,
        masterDuplicates: masterData.duplicatesRemoved,
        companyDuplicates: companyData.duplicatesRemoved,
        filteredUniqueCount: filteredPnrSet.size,
        selectedCount: selectedUserIds.size
      },
      isComparing: false,
      isShowingResults: true
    });
    setTimeout(() => {
      set({ isShowingResults: false });
    }, 800);

    get().openFeedback(
      `Comparison complete: ${missing.length} PNRs missing from Company data`,
      false
    );
  }
}));