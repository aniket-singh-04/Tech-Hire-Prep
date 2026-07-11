import React from 'react';
import { VscLoading } from 'react-icons/vsc';

interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <VscLoading
      className={`animate-spin text-brand-blue ${className}`}
      {...props}
    />
  );
};
