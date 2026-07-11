import React from 'react';
import { VscLoading } from 'react-icons/vsc';

interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes: Record<string, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  ...props
}) => (
  <VscLoading
    className={`animate-spin ${sizes[size] ?? sizes.md} ${className}`}
    style={{ color: 'var(--accent)' }}
    aria-label="Loading"
    role="status"
    {...props}
  />
);
