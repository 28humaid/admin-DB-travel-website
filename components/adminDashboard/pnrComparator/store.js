// src/components/pnrComparator/store.js
import { create } from 'zustand';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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

  // Helper to find column name case-insensitively with common variations
  findColumnName: (headers, possibleNames) => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    for (const name of possibleNames) {
      const lowered = name.toLowerCase().trim();
      const index = lowerHeaders.findIndex(h => h === lowered || h.replace(/[^\w]/g, '') === lowered.replace(/[^\w]/g, ''));
      if (index !== -1) return headers[index];
    }
    return null;
  },

  handleFileUpload: (e, type) => {
    const file = e.target.files[0];
    set({ 
      ...(type === 'master' ? { isParsingMaster: true } : { isParsingCompany: false }) 
    });
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      get().openFeedback('File too large. Maximum size is 10MB.', true);
      set({ 
        ...(type === 'master' ? { isParsingMaster: false } : { isParsingCompany: false }) 
      });
      return;
    }

    const isCSV = /\.csv$/i.test(file.name);
    const isExcel = /\.(xls|xlsx)$/i.test(file.name);

    if (!isCSV && !isExcel) {
      get().openFeedback('Please upload a valid .xls, .xlsx, or .csv file.', true);
      set({ 
        ...(type === 'master' ? { isParsingMaster: false } : { isParsingCompany: false }) 
      });
      return;
    }

    const processData = (json, headers) => {
      if (json.length === 0) {
        get().openFeedback('File is empty.', true);
        return false;
      }

      let pnrColumn, sheetNameHint;
      if (type === 'master') {
        pnrColumn = get().findColumnName(headers, ['PNR_NO', 'PNR NO', 'PNRNO', 'PNR']);
        sheetNameHint = 'BOOKING';
      } else {
        pnrColumn = get().findColumnName(headers, ['PNR/Ticket #', 'PNR/Ticket', 'PNR Ticket #', 'PNR', 'Ticket']);
        sheetNameHint = 'Bookings';
      }

      if (!pnrColumn) {
        get().openFeedback(`Required PNR column not found. Expected in ${sheetNameHint} sheet.`, true);
        return false;
      }

      const pnrSet = new Set();
      const seen = new Set();
      let duplicates = 0;

      json.forEach(row => {
        const pnr = row[pnrColumn] ? String(row[pnrColumn]).trim() : '';
        if (pnr && !seen.has(pnr)) {
          seen.add(pnr);
          pnrSet.add(pnr);
        } else if (pnr) {
          duplicates++;
        }
      });

      if (type === 'master') {
        const userIdColumn = get().findColumnName(headers, ['USER_ID', 'USER ID', 'UserId', 'User ID']);
        const userIdSet = new Set();
        let hasUserIds = false;

        if (userIdColumn) {
          hasUserIds = true;
          json.forEach(row => {
            const userId = row[userIdColumn];
            if (userId !== undefined && userId !== '' && userId !== null) {
              userIdSet.add(String(userId).trim());
            }
          });
        }

        set({
          masterData: {
            rows: json,
            pnrs: pnrSet,
            userIds: userIdSet,
            hasUserIds, // NEW: Flag to indicate if USER_ID column exists
            duplicatesRemoved: duplicates,
            totalRows: json.length
          },
          masterFileName: file.name,
          selectedUserIds: hasUserIds ? new Set(userIdSet) : new Set(), // Select all if exists, else empty
          comparisonResult: null
        });

        get().openFeedback(
          `Master file loaded: ${pnrSet.size} unique PNRs (${duplicates} duplicates removed)`,
          false
        );
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
        get().openFeedback(
          `Company file loaded: ${pnrSet.size} unique PNRs (${duplicates} duplicates removed)`,
          false
        );
      }

      return true;
    };

    if (isCSV) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0 && result.data.length === 0) {
            get().openFeedback('Failed to parse CSV file.', true);
          } else {
            processData(result.data, result.meta.fields);
          }
          set({ 
            ...(type === 'master' ? { isParsingMaster: false } : { isParsingCompany: false }) 
          });
        },
        error: () => {
          get().openFeedback('Failed to read CSV file.', true);
          set({ 
            ...(type === 'master' ? { isParsingMaster: false } : { isParsingCompany: false }) 
          });
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = ev.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });

          let sheet, possibleSheetNames;
          if (type === 'master') {
            possibleSheetNames = ['BOOKING', 'Booking', 'booking'];
          } else {
            possibleSheetNames = ['Bookings', 'BOOKINGS', 'bookings'];
          }

          sheet = get().findSheetCaseInsensitive(workbook, possibleSheetNames);
          if (!sheet) {
            get().openFeedback(`Sheet "${possibleSheetNames[0]}" (case-insensitive) not found.`, true);
            return;
          }

          const json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
          const headers = Object.keys(json[0] || {});

          if (!processData(json, headers)) {
            return;
          }
        } catch (err) {
          get().openFeedback('Failed to parse Excel file. It may be corrupted.', true);
        } finally {
          set({ 
            ...(type === 'master' ? { isParsingMaster: false } : { isParsingCompany: false }) 
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }

    e.target.value = '';
  },

  handleClearFile: (type) => {
    if (type === 'master') {
      set({ 
        masterFileName: '', 
        masterData: null, 
        selectedUserIds: new Set(), 
        comparisonResult: null 
      });
    } else {
      set({ 
        companyFileName: '', 
        companyData: null, 
        comparisonResult: null 
      });
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
    if (masterData?.hasUserIds) {
      if (selectedUserIds.size === masterData.userIds.size) {
        set({ selectedUserIds: new Set(), comparisonResult: null });
      } else {
        set({ selectedUserIds: new Set(masterData.userIds), comparisonResult: null });
      }
    }
  },

  handleCompare: () => {
    const { masterData, companyData, selectedUserIds } = get();
    if (!masterData || !companyData) {
      get().openFeedback('Please upload both files.', true);
      return;
    }

    // Only require user ID selection if USER_ID column exists
    if (masterData.hasUserIds && selectedUserIds.size === 0) {
      get().openFeedback('Please select at least one USER_ID to compare.', true);
      return;
    }

    set({ isComparing: true });

    let filteredRows = masterData.rows;

    // Only filter by USER_ID if the column exists and some are selected
    if (masterData.hasUserIds && selectedUserIds.size > 0) {
      filteredRows = masterData.rows.filter(row => {
        const userId = row['USER_ID']; // Note: actual column name may vary, but we already stored rows with original keys
        return userId !== undefined && selectedUserIds.has(String(userId).trim());
      });
    }

    const filteredPnrSet = new Set();
    filteredRows.forEach(row => {
      const pnr = String(row['PNR_NO'] || '').trim();
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
        selectedCount: masterData.hasUserIds ? selectedUserIds.size : filteredPnrSet.size
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