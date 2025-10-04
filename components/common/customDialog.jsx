import React from 'react';

const CustomDialog = ({ 
  open, 
  onClose, 
  type, 
  message, 
  onConfirm,
  title: customTitle,
  confirmButtonText: customConfirmText,
  cancelButtonText: customCancelText,
  confirmButtonClass: customConfirmClass = 'bg-red-500 hover:bg-red-600' // Default to red for deletes
}) => {
  if (!open) return null;

  // Backward-compatible title logic
  const getTitle = () => {
    if (customTitle) return customTitle;
    return type === 'confirmDelete' ? 'Confirm Deletion' : 'Error';
  };

  // Backward-compatible button texts and visibility
  const isConfirmType = type === 'confirmDelete' || type === 'confirmOverwrite';
  const showConfirmButtons = isConfirmType && onConfirm;

  const cancelText = customCancelText || (isConfirmType ? 'Cancel' : null);
  const confirmText = customConfirmText || (type === 'confirmDelete' ? 'Delete' : 'Confirm');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">
          {getTitle()}
        </h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          {showConfirmButtons ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-white rounded ${
                  type === 'confirmOverwrite' 
                    ? 'bg-blue-500 hover:bg-blue-600'  // Blue for overwrite (non-destructive)
                    : customConfirmClass || 'bg-red-500 hover:bg-red-600'  // Red default for delete
                }`}
              >
                {confirmText}
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