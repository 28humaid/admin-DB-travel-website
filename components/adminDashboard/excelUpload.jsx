"use client";

import React, { useEffect, useRef, useState } from 'react';
import { FileUp, FileSpreadsheet, X } from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import ComboBox from '../common/comboBox';
import { useSession } from 'next-auth/react';
import DataTable from '../common/dataTable';
import { ExcelToJsonConverter } from '@/utils/excelToJSON';
import { apiRequest } from '@/utils/apiRequest';
import CustomDialog from '../common/customDialog';
import FeedbackDialog from '../common/feedbackDialog';

const ExcelUpload = () => {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingCompanyId, setPendingCompanyId] = useState(null);
  const [pendingJsonData, setPendingJsonData] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isFeedbackError, setIsFeedbackError] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { customers } = await apiRequest({
          url: '/api/customers/read',
          token: session?.accessToken,
        });
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
      setJsonData(null);
    } else {
      console.error('Invalid file type. Please upload a valid Excel file (.xls, .xlsx)');
      setSelectedFile(null);
      setFileName('');
      setFeedbackMessage('Invalid file type. Please upload a valid Excel file (.xls, .xlsx)');
      setIsFeedbackError(true);
      setShowFeedback(true);
    }
    event.target.value = '';
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileName('');
    setJsonData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('File selection cleared');
  };

  const handleJsonConverted = (data) => {
    console.log('Converted JSON:', data);
    setJsonData(data);
  };

  const handleConfirmOverwrite = async () => {
    setShowConfirmDialog(false);
    const companyId = pendingCompanyId;
    const jsonDataToUpload = pendingJsonData;
    const companyName = companyOptions.find(option => option.value === companyId)?.label || 'the company';

    setIsUploading(true);

    try {
      const result = await apiRequest({
        url: '/api/uploads/excel',
        method: 'POST',
        body: {
          jsonData: jsonDataToUpload,
          companyId,
          overwrite: true,
        },
        token: session?.accessToken,
      });

      if (result.success) {
        const bookingCount = result.bookings.inserted + result.bookings.updated;
        const refundCount = result.refunds.inserted + result.refunds.updated;
        const successMsg = `Uploaded ${bookingCount} bookings (${result.bookings.skipped} skipped) and ${refundCount} refunds (${result.refunds.skipped} skipped)`;
        setFeedbackMessage(successMsg);
        setIsFeedbackError(false);
        setShowFeedback(true);
        handleClearFile();
        setActiveTab('bookings');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      setFeedbackMessage(`Error: ${err.message}`);
      setIsFeedbackError(true);
      setShowFeedback(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelOverwrite = () => {
    setShowConfirmDialog(false);
    setFeedbackMessage('Upload cancelled.');
    setIsFeedbackError(true);
    setShowFeedback(true);
    setIsUploading(false);
    setPendingCompanyId(null);
    setPendingJsonData(null);
  };

  const handleSubmit = async (values) => {
    if (!jsonData || !selectedFile || !values.company) {
      setFeedbackMessage('Please select a file and company first.');
      setIsFeedbackError(true);
      setShowFeedback(true);
      return;
    }

    const companyId = values.company;
    const companyName = companyOptions.find(option => option.value === companyId)?.label || 'the company';

    setIsUploading(true);

    try {
      // Check if bookings exist
      const { exists } = await apiRequest({
        url: `/api/uploads/excel?companyId=${companyId}`,
        token: session?.accessToken,
      });

      if (exists) {
        setPendingCompanyId(companyId);
        setPendingJsonData(jsonData);
        setConfirmMessage(`Do you want to update existing records for ${companyName}?`);
        setShowConfirmDialog(true);
        setIsUploading(false);
        return;
      }

      const result = await apiRequest({
        url: '/api/uploads/excel',
        method: 'POST',
        body: {
          jsonData,
          companyId,
          overwrite: false,
        },
        token: session?.accessToken,
      });

      if (result.success) {
        const bookingCount = result.bookings.inserted + result.bookings.updated;
        const refundCount = result.refunds.inserted + result.refunds.updated;
        const successMsg = `Uploaded ${bookingCount} bookings (${result.bookings.skipped} skipped) and ${refundCount} refunds (${result.refunds.skipped} skipped)`;
        setFeedbackMessage(successMsg);
        setIsFeedbackError(false);
        setShowFeedback(true);
        handleClearFile();
        setActiveTab('bookings');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      setFeedbackMessage(`Error: ${err.message}`);
      setIsFeedbackError(true);
      setShowFeedback(true);
    } finally {
      setIsUploading(false);
    }
  };

  const validationSchema = Yup.object({
    company: Yup.string()
      .oneOf(companyOptions.map((option) => option.value), 'Must select a valid company'),
  });

  const TabSwitch = ({ activeTab, setActiveTab }) => (
    <div className="flex border-b border-gray-200 mb-4">
      <button
        onClick={() => setActiveTab('bookings')}
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === 'bookings'
            ? 'border-blue-500 text-blue-600 border-b-2'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Bookings (Top 10)
      </button>
      <button
        onClick={() => setActiveTab('refunds')}
        className={`px-4 py-2 text-sm font-medium ml-1 ${
          activeTab === 'refunds'
            ? 'border-blue-500 text-blue-600 border-b-2'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Refunds (Top 10)
      </button>
    </div>
  );

  const previewData = activeTab === 'bookings' 
    ? (jsonData?.bookings || []).slice(0, 10) 
    : (jsonData?.refunds || []).slice(0, 10);

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    setFeedbackMessage('');
  };

  return (
    <div className="w-full min-h-[90%] flex flex-col items-center justify-center gap-4">
      {!session && <div className="container mx-auto p-4 text-red-500">Please log in</div>}
      {error && <div className="container mx-auto p-4 text-red-500">Error: {error}</div>}
      {session && (
        <>
          <button
            onClick={handleButtonClick}
            className="w-3/4 md:w-1/2 text-left p-2 rounded-md text-sm md:text-lg flex flex-col justify-center items-center gap-2 hover:bg-blue-300 border"
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
            <div className="relative flex items-center gap-1 text-sm md:text-lg">
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
          {jsonData && (
            <>
              <TabSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
              <DataTable 
                data={previewData} 
                onEdit={() => {}} 
                onDelete={() => {}} 
                hideActions={true} 
              />
            </>
          )}
          <Formik
            initialValues={{ company: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
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
                  disabled={!selectedFile || !jsonData || !isValid || !dirty || isUploading}
                  className={`w-full p-2 rounded-md text-lg flex justify-center items-center gap-2 text-white ${
                    selectedFile && jsonData && isValid && dirty && !isUploading
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Submit'}
                </button>
              </Form>
            )}
          </Formik>
          {selectedFile && !jsonData && (
            <ExcelToJsonConverter file={selectedFile} onConvert={handleJsonConverted} />
          )}
        </>
      )}
      <CustomDialog
        open={showConfirmDialog}
        onClose={handleCancelOverwrite}
        type="confirmOverwrite"
        message={confirmMessage}
        onConfirm={handleConfirmOverwrite}
        title="Confirm Update"
        confirmButtonText="Update"
        cancelButtonText="Cancel"
      />
      <FeedbackDialog
        isOpen={showFeedback}
        message={feedbackMessage}
        isError={isFeedbackError}
        onClose={handleFeedbackClose}
      />
    </div>
  );
};

export default ExcelUpload;