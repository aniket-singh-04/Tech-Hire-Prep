import React from 'react';

interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

const colors = [
  'bg-blue-500', 'bg-success', 'bg-purple-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];

const getColor = (name?: string) => {
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 'md', className }) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0  ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
};
