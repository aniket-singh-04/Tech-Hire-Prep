// src/components/feedback/ProgressStepper.tsx

import {
  Check,
  Circle,
} from "lucide-react";

interface ProgressStepperProps {
  steps: readonly string[];

  currentStep: number;

  onStepClick?: (step: number) => void;
}

export default function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
}: ProgressStepperProps) {
  const progress =
    ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full">

      {/* Progress */}

      <div className="mb-10">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-sm font-medium text-slate-500">
            Step {currentStep} of {steps.length}
          </span>

          <span className="text-sm font-semibold text-blue-600">
            {Math.round(progress)}%
          </span>

        </div>

        <div className="h-2 w-full rounded-full bg-slate-200">

          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* Stepper */}

      <div className="relative">

        {/* Line */}

        <div className="absolute left-0 right-0 top-5 h-[2px] bg-slate-200" />

        <div
          className="absolute left-0 top-5 h-[2px] bg-blue-600 transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

        <div className="relative flex justify-between">

          {steps.map((step, index) => {
            const number = index + 1;

            const completed =
              number < currentStep;

            const active =
              number === currentStep;

            return (
              <button
                key={step}
                type="button"
                onClick={() =>
                  onStepClick?.(number)
                }
                className="group flex flex-col items-center"
              >
                <div
                  className={`
                    z-10
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    bg-white
                    transition-all

                    ${
                      completed
                        ? "border-blue-600 bg-blue-600 text-white"
                        : ""
                    }

                    ${
                      active
                        ? "border-blue-600 text-blue-600 ring-4 ring-blue-100"
                        : ""
                    }

                    ${
                      !completed && !active
                        ? "border-slate-300 text-slate-400"
                        : ""
                    }
                  `}
                >
                  {completed ? (
                    <Check size={18} />
                  ) : (
                    <Circle
                      size={16}
                      fill={
                        active
                          ? "currentColor"
                          : "transparent"
                      }
                    />
                  )}
                </div>

                <span
                  className={`
                    mt-3
                    max-w-[90px]
                    text-center
                    text-xs
                    font-medium

                    ${
                      active
                        ? "text-blue-600"
                        : completed
                        ? "text-slate-700"
                        : "text-slate-400"
                    }
                  `}
                >
                  {step}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}