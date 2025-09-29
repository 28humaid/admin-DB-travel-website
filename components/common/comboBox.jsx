"use client"

import React, { useState, useRef, useEffect } from 'react';

const ComboBox = ({
  name,
  label,
  placeholder,
  options = [], // Array of { value, label } objects
  formik, // Formik context
  className = '',
  width = 'w-full',
  height = 'h-10',
  isLoading = false, // New prop to handle loading state
  ...props
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [displayValue, setDisplayValue] = useState(''); // Local state for main input display
  const [dropdownSearch, setDropdownSearch] = useState(''); // State for dropdown search input
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update filtered options when options prop changes
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Find label for a given value
  const getLabelForValue = (value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : '';
  };

  // Filter options based on dropdown search value
  const filterOptions = (searchValue) => {
    const newFilteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.value.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredOptions(newFilteredOptions);
  };

  // Handle dropdown search input change
  const handleDropdownSearchChange = (e) => {
    const searchValue = e.target.value;
    setDropdownSearch(searchValue);
    filterOptions(searchValue);
  };

  // Handle selection from dropdown
  const handleOptionSelect = (value) => {
    const label = getLabelForValue(value);
    setDisplayValue(label);
    setDropdownSearch(''); // Clear dropdown search
    formik?.setFieldValue(name, value);
    formik?.setFieldTouched(name, true);
    setIsDropdownOpen(false);
    setFilteredOptions(options); // Reset filtered options
  };

  // Handle main input click to open dropdown
  const handleInputClick = () => {
    setIsDropdownOpen(true);
    setFilteredOptions(options); // Show all options
    setDropdownSearch(''); // Clear dropdown search
  };

  // Handle blur
  const handleBlur = (e) => {
    const currentValue = formik?.values[name] || '';
    if (!currentValue) {
      setDisplayValue('');
    }
    formik?.handleBlur(e);
  };

  // Close dropdown on outside click
  const handleOutsideClick = (e) => {
    if (
      inputRef.current &&
      dropdownRef.current &&
      !inputRef.current.contains(e.target) &&
      !dropdownRef.current.contains(e.target)
    ) {
      setIsDropdownOpen(false);
      const currentValue = formik?.values[name] || '';
      if (!currentValue) {
        setDisplayValue('');
      }
      setDropdownSearch('');
      setFilteredOptions(options);
    }
  };

  // Add/remove outside click listener
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [formik, name, options]);

  const inputStyles = `border border-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${width} ${height} ${className}`;

  const error = formik?.touched[name] && formik?.errors[name];

  return (
    <div className="mb-4 relative">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          value={displayValue}
          onClick={handleInputClick}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={inputStyles}
          ref={inputRef}
          readOnly // Prevent typing in main input
          disabled={isLoading} // Disable input during loading
          {...props}
        />
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <div className="px-4 py-2">
              <input
                type="text"
                value={dropdownSearch}
                onChange={handleDropdownSearchChange}
                placeholder="Search options..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus // Auto-focus dropdown search input
                disabled={isLoading} // Disable search during loading
              />
            </div>
            {isLoading ? (
              <div className="px-4 py-2 text-gray-500 flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading companies...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default ComboBox;