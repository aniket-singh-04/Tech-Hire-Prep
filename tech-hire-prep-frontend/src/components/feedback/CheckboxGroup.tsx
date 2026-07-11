// src/components/feedback/CheckboxGroup.tsx

import { Controller, type Control, type FieldPath } from "react-hook-form";

import { FaCheck } from "react-icons/fa";
import type { FeedbackSchema } from "../../schema/feedback.schema";

interface CheckboxOption {
  label: string;
  value: string;
  description?: string;
}

interface CheckboxGroupProps {
  control: Control<FeedbackSchema>;

  name: FieldPath<FeedbackSchema>;

  label?: string;

  description?: string;

  options: readonly CheckboxOption[];

  required?: boolean;

  columns?: 2 | 3 | 4;
}

export default function CheckboxGroup({
  control,
  name,
  label,
  description,
  options,
  required = false,
  columns = 3,
}: CheckboxGroupProps) {
  const gridColumns = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const values = field.value ?? [];

        const toggleValue = (value: string) => {
          if (values.includes(value)) {
            field.onChange(
              values.filter((item: string) => item !== value)
            );
          } else {
            field.onChange([...values, value]);
          }
        };

        return (
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
              className={`grid gap-4 ${gridColumns[columns]}`}
            >
              {options.map((option) => {
                const selected = values.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={`
                      relative
                      rounded-xl
                      border
                      p-4
                      text-left
                      transition-all
                      duration-200

                      ${
                        selected
                          ? "border-blue-600 bg-blue-50 shadow-md dark:border-blue-500 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
                      }
                    `}
                  >
                    {selected && (
                      <FaCheck
                        size={18}
                        className="absolute right-3 top-3 text-blue-600"
                      />
                    )}

                    <div className="font-medium text-slate-900 dark:text-white">
                      {option.label}
                    </div>

                    {option.description && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {option.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-slate-500">
              Selected : {values.length}
            </div>

            {fieldState.error && (
              <p className="text-sm text-red-500">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}