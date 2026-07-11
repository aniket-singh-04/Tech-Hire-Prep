import React, {type  TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-muted mb-1">{label}</label>}
      <textarea
        className={`flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none',
           ${className}`}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
