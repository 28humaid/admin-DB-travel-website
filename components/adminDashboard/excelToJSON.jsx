import { useEffect } from 'react';
import * as XLSX from 'xlsx';

export const ExcelToJsonConverter = ({ file, onConvert }) => {
  const convertExcelToJson = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert to JSON with first row as keys
      const headers = json[0];
      const rows = json.slice(1);
      const jsonData = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      onConvert(jsonData);
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