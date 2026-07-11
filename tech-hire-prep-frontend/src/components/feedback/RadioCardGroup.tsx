// src/components/feedback/RadioCardGroup.tsx

import { Controller  } from "react-hook-form";
import type {Control, FieldPath } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import type { FeedbackSchema } from "../../schema/feedback.schema";


interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

interface RadioCardGroupProps {
  control: Control<FeedbackSchema>;

  name: FieldPath<FeedbackSchema>;

  label?: string;

  description?: string;

  options: readonly RadioOption[];

  required?: boolean;

  columns?: 2 | 3 | 4;
}

export default function RadioCardGroup({
  control,
  name,
  label,
  description,
  options,
  required = false,
  columns = 3,
}: RadioCardGroupProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-4">
          {(label || description) && (
            <div>
              {label && (
                <label className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {label}

                  {required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
              )}

              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
          )}

          <div
            className={`
              grid
              gap-4
              ${gridCols[columns]}
            `}
          >
            {options.map((option) => {
              const selected =
                field.value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    field.onChange(option.value)
                  }
                  className={`
                    relative
                    rounded-xl
                    border
                    p-5
                    text-left
                    transition-all
                    duration-200

                    ${
                      selected
                        ? "border-blue-600 bg-blue-50 shadow-md dark:border-blue-500 dark:bg-blue-950/40"
                        : "border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    }
                  `}
                >
                  {selected && (
                    <CheckCircle2
                      className="absolute right-3 top-3 text-blue-600"
                      size={20}
                    />
                  )}

                  <div className="font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </div>

                  {option.description && (
                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {fieldState.error && (
            <p className="text-sm text-red-500">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}