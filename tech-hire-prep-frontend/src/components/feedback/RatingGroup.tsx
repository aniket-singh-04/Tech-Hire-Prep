// src/components/feedback/RatingGroup.tsx

import { Controller } from "react-hook-form";
import type {Control, FieldPath } from "react-hook-form";
import RatingInput from "./RatingInput";
import type { FeedbackSchema } from "../../schema/feedback.schema";

interface RatingField {
  key: string;
  label: string;
}

interface RatingGroupProps {
  title?: string;

  description?: string;

  control: Control<FeedbackSchema>;

  fields: readonly RatingField[];

  parent:
    | "technical"
    | "communication"
    | "softSkills";

  required?: boolean;
}

export default function RatingGroup({
  title,
  description,
  control,
  fields,
  parent,
  required = false,
}: RatingGroupProps) {
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <Controller
            key={field.key}
            control={control}
            name={
              `${parent}.${field.key}` as FieldPath<FeedbackSchema>
            }
            render={({ field: controllerField, fieldState }) => (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <RatingInput
                  label={field.label}
                  value={controllerField.value}
                  onChange={controllerField.onChange}
                  required={required}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}