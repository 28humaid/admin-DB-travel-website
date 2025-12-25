// src/components/pnrComparator/UserIdFilter.jsx
import React from 'react';
import { usePNRStore } from './store';

const UserIdFilter = () => {
  const {
    combinedMasterData,
    selectedUserIds,
    toggleUserId,
    selectAllUserIds
  } = usePNRStore();

  // Only render if USER_ID column exists
  if (!combinedMasterData?.hasUserIds) {
    return null;
  }

  const userIds = Array.from(combinedMasterData.userIds).sort(); // Alphabetical sort
  const allSelected = selectedUserIds.size === userIds.length;
  const someSelected = selectedUserIds.size > 0;

  return (
    <div className="w-full max-w-2xl mt-8">
      <h3 className="text-xl font-semibold mb-4 text-purple-700">
        Select USER_IDs to Compare
      </h3>

      <div className="bg-gray-50 rounded-xl p-4 shadow">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Found <strong>{userIds.length}</strong> unique USER_IDs
          </p>
          <button
            onClick={selectAllUserIds}
            className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
          {userIds.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No USER_IDs found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
              {userIds.map((userId) => (
                <label
                  key={userId}
                  className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.has(userId)}
                    onChange={() => toggleUserId(userId)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {userId || '(empty)'}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {someSelected && (
          <p className="mt-3 text-sm text-gray-600">
            <strong>{selectedUserIds.size}</strong> USER_IDs selected
          </p>
        )}
      </div>
    </div>
  );
};

export default UserIdFilter;