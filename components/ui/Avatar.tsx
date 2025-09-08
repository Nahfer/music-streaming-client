import React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';

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

  return (
    <RadixAvatar.Root className={`inline-block align-middle ${className}`}>
      {src ? (
        <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <img src={src} alt={alt} className="object-cover w-full h-full" />
        </div>
      ) : (
        <RadixAvatar.Fallback className={`flex items-center justify-center ${sizeClasses[size]} rounded-full bg-teal-600 text-white font-semibold ${textSizeClasses[size]}`}>
          {fallback}
        </RadixAvatar.Fallback>
      )}
    </RadixAvatar.Root>
  );
};

export default Avatar;