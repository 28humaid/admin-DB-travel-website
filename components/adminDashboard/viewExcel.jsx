import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getAuthToken } from '@/utils/getAuthToken';
import ComboBox from '../common/comboBox';
import { fetchBookings, fetchRefunds } from '@/utils/fetchData';
import Loader from '../common/loader';
import CustomDialog from '../common/customDialog';
import DisplayContainer from './bookingsNrefunds/displayContainer';
import { useQuery } from '@tanstack/react-query';

const ViewExcel = () => {
  const { data: session } = useSession();
//   const [companyOptions, setCompanyOptions] = useState([]);
//   const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Dialog state
  const [dialog, setDialog] = useState({
    open: false,
    type: 'error', // 'error' | 'success'
    message: '',
    title: 'Error'
  });

  // Helper to open dialog
  const openDialog = (message, type = 'error', title = type === 'error' ? 'Error' : 'Success') => {
    setDialog({ open: true, type, message, title });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, open: false }));
  };

  // Fetch companies on session load
  const {
    data: companyOptions = [],
    isLoading: loading,
    error,
    } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
        const res = await fetch('/api/customers/read', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch companies');
      }
      const { customers } = await res.json();
        return customers.map(c => ({
        value: c.clientId,
        label: c.companyName,
        }));
    },
    enabled: !!session,
    onError: (err) => {
        openDialog(err.message || 'Failed to load companies.', 'error', 'Load Failed');
    },
    });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting: formikSetSubmitting }) => {
    const { company } = values;
    if (!company) {
      openDialog('Please select a company.', 'error', 'Validation Error');
      formikSetSubmitting(false);
      return;
    }

    setSubmitting(true);
    setBookings([]);
    setRefunds([]);

    try {
      const [bookingsData, refundsData] = await Promise.all([
        fetchBookings({ company }).catch(err => { throw err; }),
        fetchRefunds({ company }).catch(err => { throw err; })
      ]);

      setBookings(bookingsData || []);
      setRefunds(refundsData || []);

      if (bookingsData.length === 0 && refundsData.length === 0) {
        openDialog('No data available. Both bookings and refunds are empty.', 'error', 'No Data');
      }
    } catch (err) {
      openDialog(
        err.message || 'Failed to fetch bookings or refunds.',
        'error',
        'Fetch Error'
      );
    } finally {
      setSubmitting(false);
      formikSetSubmitting(false);
    }
  };

  return (
    <>
      {/* Main Form */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <Formik
            initialValues={{ company: '' }}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ isSubmitting, isValid, dirty, ...props }) => (
              <Form className="space-y-4">
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
                  disabled={!isValid || !dirty}
                  className={`w-full mt-6 p-3 rounded-lg font-bold text-white transition-all ${isValid && dirty && !isSubmitting ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? 'Fetching...' : 'Fetch Details'}
                </button>
              </Form>
            )}
          </Formik>
          {/* Loading Overlay */}
          {(loading || submitting) && (<Loader message={loading ? "Loading companies..." : "Fetching data..."} />
          )}
        </div>
      </div>

      {/* Results Section - Using Tabs Component */}
      {(bookings.length > 0 || refunds.length > 0) && (
        <DisplayContainer bookings={bookings} refunds={refunds} />
      )}

      {/* Custom Dialog for Feedback */}
      <CustomDialog
        open={dialog.open}
        onClose={closeDialog}
        type={'Error'}
        message={dialog.message}
        title={dialog.title}
      />
    </>
  );
};

export default ViewExcel;