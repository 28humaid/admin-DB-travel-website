import React from 'react';

// Reusable InputField component for Formik
const InputField = ({
    type = 'text',
    name,
    label,
    placeholder,
    width = 'w-full',
    height = 'h-10',
    options = [], // For dropdowns
    formik, // Formik context passed from parent
    className = '',
    icon, // Optional icon component or JSX element
    ...props
    }) => {
    const isSelect = type === 'select';
    const inputStyles = `border border-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${width} ${height} ${
        icon && !isSelect ? 'pr-10' : ''
    } ${className}`;
    const error = formik?.touched[name] && formik?.errors[name];

    return (
        <div className="mb-4">
        {label && (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            </label>
        )}
        <div className="relative">
            {isSelect ? (
            <select
                id={name}
                name={name}
                value={formik?.values[name] || ''}
                onChange={formik?.handleChange}
                onBlur={formik?.handleBlur}
                className={inputStyles}
                {...props}
            >
                <option value="" disabled>
                {placeholder || 'Select an option'}
                </option>
                {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
                ))}
            </select>
            ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={formik?.values[name] || ''}
                onChange={formik?.handleChange}
                onBlur={formik?.handleBlur}
                placeholder={placeholder}
                className={inputStyles}
                {...props}
            />
            )}
            {icon && !isSelect && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {icon}
            </div>
            )}
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default InputField;