'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  avatarUrl?: string;
  username?: string;
  isOnline?: boolean;
  className?: string;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({
  avatarUrl,
  username,
  isOnline = false,
  className = '',
  showStatus = true,
  size = 'md',
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  const statusSize = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className='bg-gradient-to-r from-lendr-yellow/20 to-lendr-green/20 text-white bg-lendr-600'>
          {username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-background ${
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          } ${statusSize[size]}`}
        />
      )}
    </div>
  );
}
