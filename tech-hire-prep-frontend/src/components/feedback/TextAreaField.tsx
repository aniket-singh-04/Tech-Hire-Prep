// src/components/feedback/TextAreaField.tsx

import { useEffect, useRef } from "react";
import {
  Controller
} from "react-hook-form";
import type {Control, FieldPath } from "react-hook-form";
import type { FeedbackSchema } from "../../schema/feedback.schema";
import { Textarea } from "../ui/Textarea";


interface TextAreaFieldProps {
  control: Control<FeedbackSchema>;

  name: FieldPath<FeedbackSchema>;

  label: string;

  placeholder?: string;

  description?: string;

  rows?: number;

  maxLength?: number;

  minLength?: number;

  required?: boolean;

  disabled?: boolean;
}

export default function TextAreaField({
  control,
  name,
  label,
  placeholder,
  description,
  rows = 5,
  maxLength = 500,
  minLength,
  required = false,
  disabled = false,
}: TextAreaFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const textareaRef =
          useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
          if (!textareaRef.current) return;

          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height =
            textareaRef.current.scrollHeight + "px";
        }, [field.value]);

        const currentLength =
          field.value?.length ?? 0;

        return (
          <div className="space-y-2">
            {/* Label */}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white">
                {label}

                {required && (
                  <span className="text-red-500">*</span>
                )}
              </label>

              <span
                className={`
                  text-xs

                  ${
                    currentLength >= maxLength
                      ? "text-red-500"
                      : "text-slate-500"
                  }
                `}
              >
                {currentLength}/{maxLength}
              </span>
            </div>

            {/* Description */}

            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}

            {/* TextArea */}

            <Textarea
              {...field}
              ref={textareaRef}
              rows={rows}
              disabled={disabled}
              maxLength={maxLength}
              placeholder={placeholder}
              className={` w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900
                 ${
                  fieldState.error
                    ? "border-red-500 focus:ring-red-200"
                    : ""
                }

                ${
                  disabled
                    ? "cursor-not-allowed opacity-70"
                    : ""
                }
              `}
            />

            {/* Footer */}

            <div className="flex items-center justify-between">
              <div>
                {fieldState.error && (
                  <p className="text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>

              {minLength && (
                <span className="text-xs text-slate-500">
                  Minimum {minLength} characters
                </span>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}