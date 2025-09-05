import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback = 'U',
  size = 'md',
  className = ''
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  };

  const textSizeClasses: Record<string, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  if (src) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes={`${size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '64px' : '128px'}`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} rounded-full bg-teal-600 text-white font-semibold ${textSizeClasses[size]} ${className}`}>
      {fallback}
    </div>
  );
};

export default Avatar;