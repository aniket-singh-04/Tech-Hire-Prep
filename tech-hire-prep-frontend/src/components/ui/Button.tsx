import React, { type  ButtonHTMLAttributes } from 'react';
import { VscLoading } from 'react-icons/vsc';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary: 'bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent-soft-strong',
    secondary: 'bg-surface-hover text-text hover:bg-surface-hover focus-visible:ring-border',
    outline: 'border border-border hover:bg-surface-hover focus-visible:ring-border',
    danger: 'bg-danger text-white hover:bg-danger focus-visible:ring-danger',
    ghost: 'hover:bg-surface-hover hover:text-text focus-visible:ring-border',
  };

  const sizes: Record<string, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 py-2 px-4',
    lg: 'h-11 px-8 text-lg',
  };

  const composed = [baseStyles, variants[variant] ?? '', sizes[size] ?? '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={composed}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <VscLoading className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};
