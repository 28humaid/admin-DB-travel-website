// components/DisplayContainer.jsx
import React, { useState } from 'react';

const DisplayContainer = ({ bookings = [], refunds = [] }) => {
  const [activeTab, setActiveTab] = useState('bookings');

  if (bookings.length === 0 && refunds.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex border-b border-blue-300 mb-6">
        {bookings.length > 0 && (
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bookings ({bookings.length})
          </button>
        )}
        {refunds.length > 0 && (
          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-6 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'refunds'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Refunds ({refunds.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'bookings' && bookings.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Bookings</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(bookings, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'refunds' && refunds.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Refunds</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(refunds, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayContainer;