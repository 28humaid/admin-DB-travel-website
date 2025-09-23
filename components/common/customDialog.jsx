import React from 'react';

const CustomDialog = ({ open, onClose, type, message, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">
          {type === 'confirmDelete' ? 'Confirm Deletion' : 'Error'}
        </h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          {type === 'confirmDelete' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;