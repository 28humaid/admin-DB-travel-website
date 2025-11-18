"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileUp, FileSpreadsheet, X } from 'lucide-react';
import { Formik, Form } from 'formik';
import ComboBox from '../common/comboBox';
import { useSession } from 'next-auth/react';
import DataTable from '../common/dataTable';
import FeedbackDialog from '../common/feedbackDialog';
import { getAuthToken } from '@/utils/getAuthToken';

// Client-side Excel parser
import * as XLSX from 'xlsx';
import Loader from '../common/loader';

const ExcelUpload = () => {
  const { data: session } = useSession();
  const [companyOptions, setCompanyOptions] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Client-side preview (before upload)
  const [clientPreview, setClientPreview] = useState(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  const openFeedback = (msg, isError = false) => {
    setFeedbackMessage(msg);
    setFeedbackError(isError);
    setFeedbackOpen(true);
  };

  // === FETCH COMPANIES ===
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/customers/read', {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        if (!res.ok) throw new Error('Failed to fetch companies');
        const { customers } = await res.json();
        const options = customers.map(c => ({
          value: c.clientId,
          label: c.companyName
        }));
        setCompanyOptions(options);
      } catch (err) {
        openFeedback('Failed to load companies.', true);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchCompanies();
  }, [session]);

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setFileName('');
      setClientPreview(null);
      setPreviewData(null);
      return;
    }

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!validTypes.includes(file.type) && !/\.(xls|xlsx)$/i.test(file.name)) {
      openFeedback('Please upload .xls or .xlsx file.', true);
      setSelectedFile(null);
      setFileName('');
      setClientPreview(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      openFeedback('File too large. Max 10MB.', true);
      setSelectedFile(null);
      setFileName('');
      setClientPreview(null);
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setPreviewData(null);
    setClientPreview(null);

    // === CLIENT-SIDE PREVIEW ===
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        const parseSheet = (name) => {
          const sheet = workbook.Sheets[name];
          if (!sheet) return [];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
          return json.slice(0, 10);
        };

        const bookings = 
          parseSheet('Bookings') || 
          parseSheet('Booking') || 
          parseSheet('bookings') || 
          parseSheet('Sheet1') || 
          [];

        const refunds = 
          parseSheet('Refunds') || 
          parseSheet('Refund') || 
          parseSheet('refunds') || 
          parseSheet('Sheet2') || 
          [];

        setClientPreview({ bookings, refunds });
        setActiveTab(bookings.length > 0 ? 'bookings' : 'refunds');
      } catch (err) {
        openFeedback('Failed to read Excel file. Is it corrupted?', true);
        setClientPreview(null);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileName('');
    setPreviewData(null);
    setClientPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (formData) => {
  setIsUploading(true);
  try {
    const res = await fetch('/api/uploads/excel', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData,
    });
    const result = await res.json();

    if (!res.ok) throw new Error(result.error || 'Upload failed');

    const msg = `Inserted ${result.bookings.inserted} bookings (${result.bookings.skipped} skipped) and ${result.refunds.inserted} refunds (${result.refunds.skipped} skipped)`;
    openFeedback(msg, false);
    setPreviewData(result.preview);
    setActiveTab('bookings');
    handleClearFile();
  } catch (err) {
    openFeedback(err.message, true);
  } finally {
    setIsUploading(false);
  }
};

  const handleSubmit = async (values) => {
  if (!selectedFile || !values.company) {
    openFeedback('Please select a file and company.', true);
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('companyId', values.company);

  setIsUploading(true);
  try {
    await uploadFile(formData);
  } catch (err) {
    openFeedback(err.message, true);
  } finally {
    setIsUploading(false);
  }
};

  const TabSwitch = () => (
    <div className="flex border-b border-gray-200 mb-4">
      {['bookings', 'refunds'].map(tab => {
        const hasData = 
          (tab === 'bookings' && (clientPreview?.bookings?.length || previewData?.bookings?.length)) ||
          (tab === 'refunds' && (clientPreview?.refunds?.length || previewData?.refunds?.length));

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={!hasData}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600 border-b-2'
                : hasData
                ? 'text-gray-500 hover:text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            {tab} (Top 10)
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-6 p-6">
      {!session ? (<Loader message="Please wait..."/>) : (
        <>
          <button
            onClick={handleButtonClick}
            className="w-full max-w-lg p-8 rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center gap-4 transition-all"
          >
            <FileUp size={56} className="text-blue-600" />
            <span className="text-xl md:text-2xl font-semibold text-gray-700">Choose .xls/.xlsx file</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".xls,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />

          {fileName && (
            <div className="flex items-center gap-4 text-lg px-4 py-2">
              <FileSpreadsheet size={28} className="text-green-600" />
              <span className="font-medium">{fileName}</span>
              <button
                onClick={handleClearFile}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                title="Clear file"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* CLIENT-SIDE PREVIEW */}
          {clientPreview && (
            <div className="w-full max-w-4xl rounded-xl shadow-lg p-6 bg-white">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Preview (Top 10 rows)</h3>
              <TabSwitch />
              <DataTable
                data={clientPreview[activeTab] || []}
                onEdit={() => {}}
                onDelete={() => {}}
                onDeleteExcel={() => {}}
                hideActions={true}
              />
            </div>
          )}

          {/* SERVER-SIDE PREVIEW */}
          {previewData && (
            <div className="w-full max-w-4xl rounded-xl shadow-lg p-6 bg-white">
              <h3 className="text-lg font-semibold mb-2 text-green-700">Upload Successful – Preview</h3>
              <TabSwitch />
              <DataTable
                data={previewData[activeTab] || []}
                onEdit={() => {}}
                onDelete={() => {}}
                onDeleteExcel={() => {}}
                hideActions={true}
              />
            </div>
          )}

          <Formik
            initialValues={{ company: '' }}
            // validationSchema={getValidationSchema()}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ isValid, dirty, ...props }) => (
              <Form className="w-full max-w-md p-6">
                <ComboBox
                  name="company"
                  label="Select Company"
                  placeholder="Search companies..."
                  options={companyOptions}
                  formik={props}
                  isLoading={loading}
                />
                <button
                  type="submit"
                  disabled={!selectedFile || !isValid || !dirty || isUploading}
                  className={`w-full mt-6 p-3 rounded-lg font-bold text-white transition-all ${
                    selectedFile && isValid && dirty && !isUploading
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Upload Excel'}
                </button>
              </Form>
            )}
          </Formik>
          {isUploading && <Loader message="Uploading..."/>}
        </>
      )}

      <FeedbackDialog
        isOpen={feedbackOpen}
        message={feedbackMessage}
        isError={feedbackError}
        onClose={() => setFeedbackOpen(false)}
      />
      {loading && <Loader message="Please wait..."/> }
    </div>
  );
};

export default ExcelUpload;