// src/components/feedback/RatingInput.tsx

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;

  max?: number;

  size?: number;

  disabled?: boolean;

  label?: string;

  required?: boolean;

  error?: string;
}

export default function RatingInput({
  value,
  onChange,
  max = 5,
  size = 26,
  disabled = false,
  label,
  required = false,
  error,
}: RatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);

  const currentValue = hover ?? value;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (disabled) return;

    if (e.key === "ArrowRight") {
      onChange(Math.min(value + 1, max));
    }

    if (e.key === "ArrowLeft") {
      onChange(Math.max(value - 1, 1));
    }

    if (e.key >= "1" && e.key <= String(max)) {
      onChange(Number(e.key));
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}

          {required && (
            <span className="text-red-500">*</span>
          )}
        </label>
      )}

      <div
        role="radiogroup"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 outline-none"
      >
        {Array.from({ length: max }).map((_, index) => {
          const rating = index + 1;

          const filled = rating <= currentValue;

          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              aria-label={`${rating} Star`}
              aria-checked={value === rating}
              role="radio"
              onClick={() => onChange(rating)}
              onMouseEnter={() => setHover(rating)}
              onMouseLeave={() => setHover(null)}
              className={`
                transition-all
                duration-200
                hover:scale-110
                active:scale-95
                disabled:cursor-not-allowed
              `}
            >
              <Star
                size={size}
                strokeWidth={2}
                className={
                  filled
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300 dark:text-slate-600"
                }
              />
            </button>
          );
        })}

        <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">
          {value}/{max}
        </span>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}