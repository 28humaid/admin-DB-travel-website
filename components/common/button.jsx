const Button = ({
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  loadingText = 'Submitting...',
  children = 'Submit',
  className = '',
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500 disabled:bg-gray-300',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 disabled:bg-green-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:bg-red-300',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 disabled:bg-yellow-300',
  };
  
  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default Button;