// src/components/pnrComparator/store.js
import { create } from 'zustand';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const usePNRStore = create((set, get) => ({
  // Old single-file states (kept for compatibility)
  masterFileName: '',
  companyFileName: '',

  // NEW: Multi-file Master states
  masterFiles: [], // Array of File objects
  combinedMasterData: null, // Final combined data (replaces old masterData)
  isCombiningMaster: false,

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

  findColumnName: (headers, possibleNames) => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    for (const name of possibleNames) {
      const lowered = name.toLowerCase().trim();
      const index = lowerHeaders.findIndex(h => 
        h === lowered || h.replace(/[^\w]/g, '') === lowered.replace(/[^\w]/g, '')
      );
      if (index !== -1) return headers[index];
    }
    return null;
  },

  // NEW: Handle multiple file selection
  handleMasterFilesSelect: (e) => {
    const newFiles = Array.from(e.target.files);
    const currentFiles = get().masterFiles;

    if (currentFiles.length + newFiles.length > 31) {
      get().openFeedback('Maximum 31 files allowed.', true);
      e.target.value = '';
      return;
    }

    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        get().openFeedback(`File "${file.name}" is too large (max 10MB).`, true);
        e.target.value = '';
        return;
      }
      if (!/\.(xls|xlsx|csv)$/i.test(file.name)) {
        get().openFeedback(`Invalid file type: ${file.name}`, true);
        e.target.value = '';
        return;
      }
    }

    set({ masterFiles: [...currentFiles, ...newFiles] });
    e.target.value = '';
  },

  removeMasterFile: (index) => {
    set(state => ({
      masterFiles: state.masterFiles.filter((_, i) => i !== index),
      combinedMasterData: null
    }));
  },

  clearMaster: () => {
    set({
      masterFiles: [],
      combinedMasterData: null,
      selectedUserIds: new Set(),
      comparisonResult: null
    });
  },

  // NEW: Combine all uploaded files into one master dataset
  handleCombineMaster: async () => {
    const { masterFiles, openFeedback } = get();
    if (masterFiles.length === 0) return;

    set({ isCombiningMaster: true });

    let allRows = [];
    let totalDuplicates = 0;

    try {
      for (const file of masterFiles) {
        const isCSV = /\.csv$/i.test(file.name);

        const fileRows = await new Promise((resolve, reject) => {
          if (isCSV) {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (result) => {
                if (result.errors.length > 0 && result.data.length === 0) {
                  reject(new Error(`Failed to parse CSV: ${file.name}`));
                } else {
                  resolve(result.data);
                }
              },
              error: () => reject(new Error(`Error reading CSV: ${file.name}`))
            });
          } else {
            const reader = new FileReader();
            reader.onload = (ev) => {
              try {
                const data = ev.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = get().findSheetCaseInsensitive(workbook, ['BOOKING', 'Booking', 'booking']);
                if (!sheet) {
                  reject(new Error(`Sheet "BOOKING" not found in ${file.name}`));
                  return;
                }
                const json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
                resolve(json);
              } catch (err) {
                reject(err);
              }
            };
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsArrayBuffer(file);
          }
        });

        allRows = allRows.concat(fileRows);
      }

      if (allRows.length === 0) {
        openFeedback('No data found in uploaded files.', true);
        return;
      }

      const headers = Object.keys(allRows[0]);

      const pnrColumn = get().findColumnName(headers, ['PNR_NO', 'PNR NO', 'PNRNO', 'PNR']);
      if (!pnrColumn) {
        openFeedback('PNR column not found in one or more files.', true);
        return;
      }

      const pnrSet = new Set();
      const seen = new Set();
      let duplicates = 0;

      allRows.forEach(row => {
        const pnr = row[pnrColumn] ? String(row[pnrColumn]).trim() : '';
        if (pnr && !seen.has(pnr)) {
          seen.add(pnr);
          pnrSet.add(pnr);
        } else if (pnr) {
          duplicates++;
        }
      });

      totalDuplicates = duplicates;

      // USER_ID detection
      const userIdColumn = get().findColumnName(headers, ['USER_ID', 'USER ID', 'UserId']);
      const userIdSet = new Set();
      const hasUserIds = !!userIdColumn;

      if (hasUserIds) {
        allRows.forEach(row => {
          const userId = row[userIdColumn];
          if (userId !== undefined && userId !== '' && userId !== null) {
            userIdSet.add(String(userId).trim());
          }
        });
      }

      const combinedData = {
        rows: allRows,
        pnrs: pnrSet,
        userIds: userIdSet,
        hasUserIds,
        duplicatesRemoved: totalDuplicates,
        totalRows: allRows.length
      };

      set({
        combinedMasterData: combinedData,
        selectedUserIds: new Set() // Nothing selected by default
      });

      openFeedback(
        `Successfully combined ${masterFiles.length} files: ${pnrSet.size} unique PNRs (${totalDuplicates} duplicates removed)`,
        false
      );
    } catch (err) {
      openFeedback(err.message || 'Failed to combine files.', true);
    } finally {
      set({ isCombiningMaster: false });
    }
  },

  // Company upload (single file)
  handleFileUpload: (e, type) => {
    if (type === 'master') return;

    const file = e.target.files[0];
    if (!file) return;

    set({ isParsingCompany: true });

    if (file.size > 10 * 1024 * 1024) {
      get().openFeedback('File too large. Maximum size is 10MB.', true);
      set({ isParsingCompany: false });
      return;
    }

    const isCSV = /\.csv$/i.test(file.name);
    const isExcel = /\.(xls|xlsx)$/i.test(file.name);

    if (!isCSV && !isExcel) {
      get().openFeedback('Please upload a valid .xls, .xlsx, or .csv file.', true);
      set({ isParsingCompany: false });
      return;
    }

    const processCompanyData = (json, headers) => {
      if (json.length === 0) {
        get().openFeedback('File is empty.', true);
        return;
      }

      const pnrColumn = get().findColumnName(headers, ['PNR/Ticket #', 'PNR/Ticket', 'PNR Ticket #', 'PNR', 'Ticket']);
      if (!pnrColumn) {
        get().openFeedback('Required PNR column not found in Company file.', true);
        return;
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
    };

    if (isCSV) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0 && result.data.length === 0) {
            get().openFeedback('Failed to parse CSV file.', true);
          } else {
            processCompanyData(result.data, result.meta.fields || []);
          }
          set({ isParsingCompany: false });
        },
        error: () => {
          get().openFeedback('Failed to read CSV file.', true);
          set({ isParsingCompany: false });
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = ev.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = get().findSheetCaseInsensitive(workbook, ['Bookings', 'BOOKINGS', 'bookings']);
          if (!sheet) {
            get().openFeedback('Sheet "Bookings" (case-insensitive) not found in Company file.', true);
            set({ isParsingCompany: false });
            return;
          }
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
          const headers = Object.keys(json[0] || {});
          processCompanyData(json, headers);
        } catch (err) {
          get().openFeedback('Failed to parse Excel file. It may be corrupted.', true);
        } finally {
          set({ isParsingCompany: false });
        }
      };
      reader.readAsArrayBuffer(file);
    }

    e.target.value = '';
  },

  handleClearFile: (type) => {
    if (type === 'master') {
      get().clearMaster();
    } else {
      set({ companyFileName: '', companyData: null, comparisonResult: null });
    }
  },

  // === FIXED: Added missing USER_ID actions ===
  toggleUserId: (userId) => {
    set((state) => {
      const newSet = new Set(state.selectedUserIds);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return { selectedUserIds: newSet, comparisonResult: null };
    });
  },

  selectAllUserIds: () => {
    set((state) => {
      const { combinedMasterData } = state;
      if (!combinedMasterData?.hasUserIds) {
        return state;
      }
      const allSelected = state.selectedUserIds.size === combinedMasterData.userIds.size;
      return {
        selectedUserIds: allSelected ? new Set() : new Set(combinedMasterData.userIds),
        comparisonResult: null
      };
    });
  },

  // Comparison logic (unchanged)
  handleCompare: () => {
    const { combinedMasterData, companyData, selectedUserIds } = get();
    const masterData = combinedMasterData;

    if (!masterData || !companyData) {
      get().openFeedback('Please upload and combine Master files, and upload Company file.', true);
      return;
    }

    if (masterData.hasUserIds && selectedUserIds.size === 0) {
      get().openFeedback('Please select at least one USER_ID to compare.', true);
      return;
    }

    set({ isComparing: true });

    let filteredRows = masterData.rows;
    if (masterData.hasUserIds && selectedUserIds.size > 0) {
      filteredRows = masterData.rows.filter(row => {
        const userId = row['USER_ID'];
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

    setTimeout(() => set({ isShowingResults: false }), 800);

    get().openFeedback(
      `Comparison complete: ${missing.length} PNRs missing from Company data`,
      false
    );
  }
}));