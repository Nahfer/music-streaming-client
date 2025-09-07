import React from 'react';

interface LoadingProps {
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading…', className = '' }) => {
  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`} role="status" aria-live="polite">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
