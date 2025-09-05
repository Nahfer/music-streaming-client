import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  icon,
  error,
  className = '',
  ...props
}) => {
  // If caller provided any 'rounded-' class, respect it; otherwise default to rounded-lg
  const radiusClass = /rounded-/.test(className) ? '' : 'rounded-lg';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`w-full bg-gray-800 border border-gray-700 ${radiusClass} px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
          icon ? 'pl-10' : ''
        } ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;