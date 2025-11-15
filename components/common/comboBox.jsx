// ComboBox.jsx
"use client";

import React, {useState, useRef, useEffect, useCallback, useMemo,} from "react";

const ComboBox = ({
  name,
  label,
  placeholder = "Select an option",
  options = [], // [{ value: ..., label: ... }]
  formik,
  className = "",
  width = "w-full",
  height = "h-10",
  isLoading = false,
  ...rest
}) => {
  /* ------------------------------- State --------------------------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayLabel, setDisplayLabel] = useState("");

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  /* -------------------------- Helper Functions --------------------------- */
  const getLabel = (value) => {
    const opt = options.find((o) => String(o.value) === String(value));
    return opt ? opt.label : "";
  };

  // Safe filtering – always treat value/label as strings
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lower = searchTerm.toLowerCase();
    return options.filter((opt) => {
      const label = String(opt.label || "").toLowerCase();
      const value = String(opt.value || "").toLowerCase();
      return label.includes(lower) || value.includes(lower);
    });
  }, [options, searchTerm]);

  /* -------------------------- Sync Formik Value -------------------------- */
useEffect(() => {
  const current = formik?.values?.[name] ?? "";

  if (current) {
    const label = getLabel(current);
    setDisplayLabel(label);
  } else {
    setDisplayLabel("");
  }
}, [formik?.values?.[name], getLabel, name, options]);

  /* -------------------------- Keyboard Navigation ------------------------ */
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const items = dropdownRef.current?.querySelectorAll("[role='option']");
    if (!items?.length) return;

    const active = document.activeElement;
    const index = Array.from(items).findIndex((el) => el === active);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        const next = (index + 1) % items.length;
        items[next].focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        const prev = index <= 0 ? items.length - 1 : index - 1;
        items[prev].focus();
        break;
      case "Enter":
        if (index >= 0) {
          e.preventDefault();
          const value = items[index].dataset.value;
          selectOption(value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.focus();
        break;
      default:
        break;
    }
  };

  /* ----------------------------- Selection ------------------------------ */
  const selectOption = (value) => {

  const label = getLabel(value);

  setDisplayLabel(label);
  setSearchTerm("");
  setIsOpen(false);

  formik?.setFieldValue(name, value);
  formik?.setFieldTouched(name, true);
  formik?.validateField(name); // Force validation
};

  /* -------------------------- Click Handlers ----------------------------- */
  const openDropdown = () => {
    if (isLoading) return;
    setIsOpen(true);
    setSearchTerm("");
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const toggleDropdown = () => (isOpen ? setIsOpen(false) : openDropdown());

  const handleOutsideClick = useCallback(
    (e) => {
      if (
        inputRef.current?.contains(e.target) ||
        dropdownRef.current?.contains(e.target)
      )
        return;
      setIsOpen(false);
      setSearchTerm("");
    },
    []
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleOutsideClick]);

  /* ------------------------------- Styles -------------------------------- */
  const baseInput =
    "border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";
  const inputClasses = `${baseInput} ${width} ${height} ${className}`;

  const error = formik?.touched?.[name] && formik?.errors?.[name];

  /* ---------------------------------------------------------------------- */
  return (
    <div className="relative mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* -------------------------- Main Input --------------------------- */}
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          value={displayLabel}
          placeholder={placeholder}
          readOnly
          disabled={isLoading}
          onClick={toggleDropdown}
          onFocus={openDropdown}
          onKeyDown={handleKeyDown}
          className={inputClasses}
          ref={inputRef}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${name}-listbox`}
          {...rest}
        />
        {/* Chevron */}
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          onClick={toggleDropdown}
          disabled={isLoading}
          aria-label="Toggle dropdown"
        >
          <svg
            className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* --------------------------- Dropdown ---------------------------- */}
      {isOpen && (
        <div
          id={`${name}-listbox`}
          ref={dropdownRef}
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {/* Search inside dropdown */}
          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Loading / Options / Empty */}
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-gray-600">
              <svg
                className="animate-spin h-4 w-4 text-blue-500"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                role="option"
                aria-selected={formik?.values?.[name] === opt.value}
                data-value={opt.value}
                onClick={() => selectOption(opt.value)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:outline-none"
                tabIndex={-1}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No options found</div>
          )}
        </div>
      )}

      {/* --------------------------- Error Message -------------------------- */}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default ComboBox;