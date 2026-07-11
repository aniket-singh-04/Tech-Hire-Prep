// src/components/feedback/SectionCard.tsx

import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;

  icon?: ReactNode;

  className?: string;

  headerAction?: ReactNode;

  required?: boolean;
}

export default function SectionCard({
  title,
  description,
  children,
  icon,
  className,
  headerAction,
  required = false,
}: SectionCardProps) {
  return (
    <section
      className={`
        rounded-2xl border border-slate-200 bg-white shadow-sm transition-all 
        dark:border-slate-800 dark:bg-slate-950
        ${ className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              {icon}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {title}
              </h2>

              {required && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  Required
                </span>
              )}
            </div>

            {description && (
              <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {headerAction && (
          <div className="shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-6 p-6">
        {children}
      </div>
    </section>
  );
}