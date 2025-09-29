"use client";

import React, { useEffect, useRef, useState } from 'react';
import { FileUp, FileSpreadsheet, X } from 'lucide-react';
import { ExcelToJsonConverter } from '../../utils/excelToJSON';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import ComboBox from '../common/comboBox';
import { useSession } from 'next-auth/react';

const ExcelUpload = () => {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers/read', {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch customers');
        const { customers } = await response.json();
        const formattedCustomers = customers.map(cust => ({ ...cust, id: cust._id }));
        setCustomers(formattedCustomers);
        const options = formattedCustomers.map(cust => ({
          value: cust._id,
          label: cust.companyName
        }));
        setCompanyOptions(options);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchCustomers();
  }, [session]);

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
    event.target.value = ''; // Reset input
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
    console.log('File selection cleared');
  };

  const handleJsonConverted = (jsonData) => {
    console.log('Converted JSON:', jsonData);
  };

  const validationSchema = Yup.object({
    company: Yup.string()
      .oneOf(companyOptions.map((option) => option.value), 'Must select a valid company'),
  });

  return (
    <div className="w-full min-h-[90%] flex flex-col items-center justify-center gap-4">
      {!session && <div className="container mx-auto p-4 text-red-500">Please log in</div>}
      {error && <div className="container mx-auto p-4 text-red-500">Error: {error}</div>}
      {session && (
        <>
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
            <div className="relative flex items-center gap-2 text-lg">
              <FileSpreadsheet size={24} />
              <span>{fileName}</span>
              <button
                onClick={handleClearFile}
                className="absolute -right-7 top-0 p-1 border text-red-500 rounded-full bg-white"
                title="Clear file"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <Formik
            initialValues={{ company: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              console.log('Selected company:', values.company);
              if (selectedFile) {
                console.log('Uploading file:', fileName);
                // Trigger ExcelToJsonConverter manually if needed
                // For now, assume it's handled by the component below
              }
            }}
          >
            {({ isValid, dirty, ...formikProps }) => (
              <Form className="w-1/2">
                <ComboBox
                  name="company"
                  label="Select Company Name"
                  placeholder="Type to filter companies"
                  options={companyOptions}
                  formik={formikProps}
                  isLoading={loading}
                />
                <button
                  type="submit"
                  disabled={!selectedFile || !isValid || !dirty}
                  className={`w-full p-2 rounded-md text-lg flex justify-center items-center gap-2 text-white ${
                    selectedFile && isValid && dirty
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit
                </button>
              </Form>
            )}
          </Formik>
          {selectedFile && (
            <ExcelToJsonConverter file={selectedFile} onConvert={handleJsonConverted} />
          )}
        </>
      )}
    </div>
  );
};

export default ExcelUpload;