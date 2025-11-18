// components/DisplayContainer.jsx
import React, { useState } from 'react';
import Bookings from '../viewExcel/bookings';
import Refunds from '../viewExcel/refunds';

const DisplayContainer = ({ bookings = [], refunds = [] }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookingsError, setBookingsError] = useState(null);
  const [refundsError, setRefundsError] = useState(null);

  if (bookings.length === 0 && refunds.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex border-b border-blue-300 mb-6 justify-center">
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
          <Bookings bookings={bookings} error={bookingsError} />
        )}

        {activeTab === 'refunds' && refunds.length > 0 && (
          <Refunds refunds={refunds} error={refundsError} />
        )}
      </div>
    </div>
  );
};

export default DisplayContainer;