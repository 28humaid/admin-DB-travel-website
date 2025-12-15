// src/components/pnrComparator/UserIdFilter.jsx
import React from 'react';
import { usePNRStore } from './store';

const UserIdFilter = () => {
  const { masterData, selectedUserIds, toggleUserId, selectAllUserIds } = usePNRStore();

  if (!masterData || masterData.userIds.size === 0) return null;

  return (
    <div className="w-full max-w-2xl p-4 bg-white rounded-xl shadow">
      <h4 className="font-medium mb-2">Filter by USER_ID ({selectedUserIds.size}/{masterData.userIds.size} selected)</h4>
      <button
        onClick={selectAllUserIds}
        className="mb-3 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {selectedUserIds.size === masterData.userIds.size ? 'Deselect All' : 'Select All'}
      </button>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
        {[...masterData.userIds].sort().map(userId => (
          <label key={userId} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedUserIds.has(userId)}
              onChange={() => toggleUserId(userId)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">{userId}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default UserIdFilter;