import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'gray', children, ...props }) => {
  const variants: Record<string, string> = {
    blue:   'badge-blue',
    green:  'badge-green',
    yellow: 'badge-yellow',
    red:    'badge-red',
    gray:   'badge-gray',
    purple: 'badge-purple',
  };
  return (
    <span className={` variants[variant]  ${className}`} {...props}>
      {children}
    </span>
  );
};
