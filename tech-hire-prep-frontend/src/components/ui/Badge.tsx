import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
}

const variantStyles: Record<string, string> = {
  blue:   'badge-blue',
  green:  'badge-green',
  yellow: 'badge-yellow',
  red:    'badge-red',
  gray:   'badge-gray',
  purple: 'badge-purple',
};

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'gray',
  children,
  ...props
}) => {
  const base = variantStyles[variant] ?? 'badge-gray';
  return (
    <span className={`badge-base ${base} ${className}`} {...props}>
      {children}
    </span>
  );
};
