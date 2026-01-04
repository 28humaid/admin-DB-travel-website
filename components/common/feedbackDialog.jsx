import { useEffect, useState } from "react";

const FeedbackDialog = ({ isOpen, message, isError = false, onClose }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  // Handle dialog visibility with animation
  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 30000); // Auto-close after 30 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div
        className={`p-6 rounded-lg shadow-lg max-w-sm w-full transition-all duration-300 transform ${
          isError ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500"
        } border-2`}
      >
        <h3
          className={`text-lg font-semibold mb-2 ${
            isError ? "text-red-700" : "text-green-700"
          }`}
        >
          {isError ? "Error" : ""}
        </h3>
        <p className={`text-sm ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className={`mt-4 px-4 py-2 rounded-md text-white font-medium ${
            isError ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FeedbackDialog;