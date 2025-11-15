import React from 'react'

const Loader = ({message}) => {
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-lg shadow-xl">
            {/* Spinner */}
            <svg
            className="animate-spin h-12 w-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
            />
            </svg>
            <p className="text-gray-800 text-lg font-medium">{message}</p>
        </div>
        </div>
    )
}

export default Loader