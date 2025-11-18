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
  confirmButtonClass: customConfirmClass = 'bg-red-500 hover:bg-red-600' // default red
}) => {
  if (!open) return null;

  const getTitle = () => {
    if (customTitle) return customTitle;

    // Add support for the new type
    if (type === 'confirmDeleteExcel') return 'Delete Uploaded Excel?';
    if (type === 'confirmDelete') return 'Confirm Deletion';
    if (type === 'confirmOverwrite') return 'Confirm Overwrite';
    return 'Error';
  };

  // Updated: recognize the new confirm type
  const isConfirmType = 
    type === 'confirmDelete' || 
    type === 'confirmOverwrite' || 
    type === 'confirmDeleteExcel';   // ← ADD THIS

  const showConfirmButtons = isConfirmType && onConfirm;

  const cancelText = customCancelText || 'Cancel';
  const confirmText = customConfirmText || (
    type === 'confirmDelete'      ? 'Delete User' :
    type === 'confirmDeleteExcel' ? 'Delete Excel Only' :
    type === 'confirmOverwrite'   ? 'Overwrite' : 'Confirm'
  );

  // Optional: make Excel delete button orange instead of red (safer feel)
  const getConfirmClass = () => {
    if (customConfirmClass) return customConfirmClass;

    if (type === 'confirmDeleteExcel') {
      return 'bg-orange-500 hover:bg-orange-600';     // Orange = less scary than red
    }
    if (type === 'confirmOverwrite') {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    return 'bg-red-500 hover:bg-red-600'; // full delete = red
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {getTitle()}
        </h2>
        <p className="mb-6 text-gray-700 leading-relaxed">{message}</p>

        <div className="flex justify-end gap-3">
          {showConfirmButtons ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2.5 text-white font-medium rounded-lg transition ${getConfirmClass()}`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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