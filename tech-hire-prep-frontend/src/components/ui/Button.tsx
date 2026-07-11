import React, { type ButtonHTMLAttributes } from 'react';
import { VscLoading } from 'react-icons/vsc';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-lg focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap';

const variantClasses: Record<string, string> = {
  primary:   'text-white hover:opacity-90 active:scale-[0.98]',
  secondary: 'hover:opacity-90 active:scale-[0.98]',
  outline:   'border bg-transparent hover:opacity-90 active:scale-[0.98]',
  danger:    'text-white hover:opacity-90 active:scale-[0.98]',
  ghost:     'bg-transparent hover:opacity-90 active:scale-[0.98]',
  link:      'bg-transparent underline-offset-4 hover:underline p-0 h-auto',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

const getVariantStyle = (variant: string): React.CSSProperties => {
  switch (variant) {
    case 'primary':
      return { background: 'var(--accent-gradient)', color: '#fff', boxShadow: '0 2px 8px var(--accent-soft)' };
    case 'secondary':
      return { background: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' };
    case 'outline':
      return { borderColor: 'var(--border-strong)', color: 'var(--text-primary)' };
    case 'danger':
      return { background: 'var(--danger)', color: '#fff' };
    case 'ghost':
      return { color: 'var(--text-primary)' };
    case 'link':
      return { color: 'var(--accent)' };
    default:
      return {};
  }
};

export const Button: React.FC<ButtonProps> = ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, style, ...props }) => {
  const composed = [baseStyles, variantClasses[variant] ?? '', sizeClasses[size] ?? '', className].filter(Boolean).join(' ');

  return (
    <button className={composed} disabled={disabled || isLoading} style={{ ...getVariantStyle(variant), ...style }} {...props}>
      {isLoading && <VscLoading className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
};
