// EditDialog.jsx
import React from 'react';
import { Formik, Form, Field } from 'formik';
import { editCustomerValidationSchema } from '@/utils/validationSchema';
import InputField from '../common/inputField';

const EditDialog = ({ open, onClose, customer, onSave }) => {
  if (!open || !customer) return null;

  const initialValues = {
    companyName: customer.companyName || '',
    mobileNo: customer.mobileNo || '',
    subCorporate:customer.subCorporate || '',
    subEntity: customer.subEntity || '',
    gstNo: customer.gstNo || '',
    address: customer.address || '',
  };

  const handleSubmit = (values) => {
    const payload = {
      clientId: customer.clientId,
      companyName: values.companyName.trim(),
      mobileNo: values.mobileNo.trim() || null,
      subEntity: values.subEntity.trim(),
      subCorporate:values.subCorporate.trim() || null,
      gstNo: values.gstNo.trim() || null,
      address: values.address.trim() || null,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 h-[600px] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Read-only Emails Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Emails (cannot be edited)</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {customer.email1 && <li>• {customer.email1}</li>}
            {customer.email2 && <li>• {customer.email2}</li>}
            {customer.email3 && <li>• {customer.email3}</li>}
            {!customer.email1 && !customer.email2 && !customer.email3 && (
              <li className="italic">No emails</li>
            )}
          </ul>
        </div>

        <Formik initialValues={initialValues} validationSchema={editCustomerValidationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, ...formik }) => (
            <Form className="space-y-5">

              <div>
                <InputField
                  type="text"
                  name="companyName"
                  label="Company Name"
                  placeholder="Enter company name"
                  formik={formik}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  type="tel"
                  name="mobileNo"
                  label="Phone no."
                  placeholder="Enter phone no."
                  formik={formik}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <InputField
                  type="text"
                  name="subCorporate"
                  label="Sub-Corporate"
                  placeholder="Enter sub-corporate name"
                  formik={formik}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <InputField
                  type="text"
                  name="subEntity"
                  label="Sub entity"
                  placeholder="Enter sub entity"
                  formik={formik}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  type="text"
                  name="gstNo"
                  label="GST no."
                  placeholder="Enter GST no."
                  formik={formik}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <InputField
                  type="text"
                  name="address"
                  label="Address"
                  placeholder="Enter address line 1"
                  formik={formik}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditDialog;