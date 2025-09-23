import React from 'react';
import { Formik, Form, Field } from 'formik';

const EditDialog = ({ open, onClose, customer, onSave }) => {
  if (!open) return null;

  const initialValues = {
    emails: customer?.emails?.join(', ') || '',
    companyName: customer?.companyName || '',
    phoneNumber: customer?.phoneNumber || '',
    subEntity: customer?.subEntity || '',
    gstNumber: customer?.gstNumber || '',
    address: customer?.address || '',
  };

  const handleSubmit = (values) => {
    onSave({
      id: customer.id,
      ...values,
      emails: values.emails.split(',').map(email => email.trim()).filter(email => email),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)'}}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form className="space-y-4">
            <div>
              <label htmlFor="emails" className="block text-sm font-medium text-gray-700">
                Emails (comma-separated)
              </label>
              <Field
                id="emails"
                name="emails"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <Field
                id="companyName"
                name="companyName"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Field
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="subEntity" className="block text-sm font-medium text-gray-700">
                Sub Entity
              </label>
              <Field
                id="subEntity"
                name="subEntity"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                GST Number
              </label>
              <Field
                id="gstNumber"
                name="gstNumber"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <Field
                id="address"
                name="address"
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default EditDialog;