import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-900';

  // Hover will show a subtle outlined shadow (matches login/signup) instead of changing the button background
  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:shadow-outline-accent focus:shadow-outline-accent',
    secondary: 'bg-gray-700 text-white hover:shadow-outline-accent focus:shadow-outline-accent',
    outline: 'border border-gray-600 text-gray-300 hover:shadow-outline-accent hover:text-white focus:shadow-outline-accent',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-700 hover:shadow-outline-accent focus:shadow-outline-accent'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;