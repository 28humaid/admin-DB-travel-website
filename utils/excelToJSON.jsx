import { useEffect } from 'react';
import * as XLSX from 'xlsx';

export const ExcelToJsonConverter = ({ file, onConvert }) => {
  // Helper to convert Excel serial date to readable string (YYYY-MM-DD)
  const excelSerialToDateString = (serial) => {
    if (!serial || typeof serial !== 'number' || serial < 1 || serial > 100000) return serial; // Not a date serial
    try {
      const date = new Date((serial - 25569) * 86400 * 1000); // Convert to JS Date
      if (isNaN(date.getTime())) return serial;
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return serial;
    }
  };

  // Helper to convert Excel serial date to month-year string (MMM-YY)
  const excelSerialToMonthYear = (serial) => {
    if (!serial || typeof serial !== 'number' || serial < 1 || serial > 100000) return serial; // Not a date serial
    try {
      const date = new Date((serial - 25569) * 86400 * 1000); // Convert to JS Date
      if (isNaN(date.getTime())) return serial;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = (date.getFullYear() % 100).toString().padStart(2, '0');
      return `${month}-${year}`;
    } catch {
      return serial;
    }
  };

  const convertExcelToJson = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Find sheets by name (case-insensitive)
        const sheetNames = workbook.SheetNames;
        const bookingsSheet = sheetNames.find(name => 
          name.toLowerCase().includes('booking')
        );
        const refundsSheet = sheetNames.find(name => 
          name.toLowerCase().includes('refund')
        );

        let bookings = [];
        let refunds = [];

        // Process Bookings sheet if found
        if (bookingsSheet) {
          const worksheet = workbook.Sheets[bookingsSheet];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json.length > 0) {
            const headers = json[0];
            const rows = json.slice(1);
            
            // Filter rows with non-empty PNR/Ticket # before conversion
            const filteredRows = rows.filter(row => {
              const pnrIndex = headers.indexOf('PNR/Ticket #');
              if (pnrIndex !== -1) {
                const pnrValue = row[pnrIndex];
                return pnrValue && pnrValue.toString().trim() !== '';
              }
              return false; // Skip if no PNR column found
            });

            bookings = filteredRows.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                let value = row[index];
                // Convert serial dates to readable strings for preview
                if (header === 'Date of Booking' || header === 'Date of Travel') {
                  value = excelSerialToDateString(value);
                } else if (header === 'Statement Period') {
                  value = excelSerialToMonthYear(value);
                }
                obj[header] = value;
              });
              return obj;
            });
          }
        }

        // Process Refunds sheet if found
        if (refundsSheet) {
          const worksheet = workbook.Sheets[refundsSheet];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json.length > 0) {
            const headers = json[0];
            const rows = json.slice(1);
            
            // Filter rows with non-empty PNR_NO before conversion
            const filteredRows = rows.filter(row => {
              const pnrIndex = headers.indexOf('PNR_NO');
              if (pnrIndex !== -1) {
                const pnrValue = row[pnrIndex];
                return pnrValue && pnrValue.toString().trim() !== '';
              }
              return false; // Skip if no PNR column found
            });

            refunds = filteredRows.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                let value = row[index];
                // Convert serial dates to readable strings for preview
                if (header === 'REFUND DATE') {
                  value = excelSerialToDateString(value);
                }
                obj[header] = value;
              });
              return obj;
            });
          }
        }

        // Prepare data for preview (top 10 rows) and full upload
        const result = {
          bookings: bookings, // Full filtered data for upload (with raw serial dates for backend conversion)
          refunds: refunds,   // Full filtered data for upload (with raw serial dates for backend conversion)
          preview: {
            bookings: bookings.slice(0, 10), // Top 10 filtered rows for preview (readable dates)
            refunds: refunds.slice(0, 10)    // Top 10 filtered rows for preview (readable dates)
          }
        };

        onConvert(result);
      } catch (error) {
        console.error('Error converting Excel to JSON:', error);
        onConvert({ bookings: [], refunds: [], preview: { bookings: [], refunds: [] } });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Call conversion when component mounts with a valid file
  useEffect(() => {
    if (file) {
      convertExcelToJson(file);
    }
  }, [file]);

  return null; // This component doesn't render anything
};