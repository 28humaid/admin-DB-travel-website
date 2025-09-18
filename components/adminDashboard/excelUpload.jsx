"use client";

import React, { useRef, useState } from 'react';
import { FileUp, FileSpreadsheet } from 'lucide-react';
import { ExcelToJsonConverter } from './excelToJSON';


const ExcelUpload = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleButtonClick = () => {
    console.log('Choose Excel button clicked');
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event) => {
    console.log('handleFileUpload triggered');
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      setSelectedFile(null);
      setFileName('');
      return;
    }
    console.log('Selected file:', file.name, 'Type:', file.type);
    if (
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.xlsx')
    ) {
      console.log('Valid Excel file selected:', file.name);
      setSelectedFile(file);
      setFileName(file.name);
    } else {
      console.error('Invalid file type. Please upload a valid Excel file (.xls, .xlsx)');
      setSelectedFile(null);
      setFileName('');
    }
    // Reset the file input to allow re-uploading the same file
    event.target.value = '';
  };

  const handleUploadClick = () => {
    console.log('Upload File button clicked');
    // The ExcelToJsonConverter component will handle the conversion
  };

  const handleJsonConverted = (jsonData) => {
    console.log('Converted JSON:', jsonData);
    // Reset file selection after conversion (optional, depending on your needs)
    // setSelectedFile(null);
    // setFileName('');
  };

  return (
    <div className="w-full min-h-[90%] flex flex-col items-center justify-center gap-4">
      <button
        onClick={handleButtonClick}
        className="w-1/2 text-left p-2 rounded-md text-lg flex flex-col justify-center items-center gap-2 hover:bg-blue-300 border"
      >
        <FileUp size={40} />
        Choose .xls/xlsx file
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileUpload}
        className="hidden"
      />
      {fileName && (
        <div className="flex items-center gap-2 text-lg">
          <FileSpreadsheet size={24} />
          <span>{fileName}</span>
        </div>
      )}
      {selectedFile && (
        <>
          <button
            onClick={handleUploadClick}
            className="w-1/2 p-2 rounded-md text-lg flex justify-center items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            Upload File
          </button>
          <ExcelToJsonConverter file={selectedFile} onConvert={handleJsonConverted} />
        </>
      )}
    </div>
  );
};

export default ExcelUpload;