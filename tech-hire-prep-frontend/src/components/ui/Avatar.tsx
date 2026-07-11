import React from 'react';

interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

const sizeMap: Record<string, { wh: string; text: string }> = {
  xs: { wh: 'w-6 h-6',  text: 'text-xs' },
  sm: { wh: 'w-8 h-8',  text: 'text-xs' },
  md: { wh: 'w-10 h-10', text: 'text-sm' },
  lg: { wh: 'w-12 h-12', text: 'text-base' },
  xl: { wh: 'w-16 h-16', text: 'text-xl' },
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const { wh, text } = sizeMap[size] ?? sizeMap.md;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'Avatar'}
        className={`${wh} rounded-full object-cover flex-shrink-0 ring-2 ring-white/10 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${wh} ${text} rounded-full flex items-center justify-center flex-shrink-0 font-bold select-none ${className}`}
      style={{
        background: 'var(--accent-gradient)',
        color: '#fff',
        letterSpacing: '0.03em',
      }}
      aria-label={name ?? 'User avatar'}
    >
      {getInitials(name)}
    </div>
  );
};
