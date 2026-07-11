// src/components/feedback/NavigationButtons.tsx

import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Loader2,
} from "lucide-react";

interface NavigationButtonsProps {
  isFirstStep: boolean;

  isLastStep: boolean;

  loading?: boolean;

  canProceed?: boolean;

  onPrevious: () => void;

  onNext: () => void;

  onSaveDraft?: () => void;

  onSubmit?: () => void;
}

export default function NavigationButtons({
  isFirstStep,
  isLastStep,
  loading = false,
  canProceed = true,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
}: NavigationButtonsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl + S

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "s"
      ) {
        e.preventDefault();

        onSaveDraft?.();
      }

      // Ctrl + Enter

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter"
      ) {
        e.preventDefault();

        if (isLastStep) {
          onSubmit?.();
        } else {
          onNext();
        }
      }
    };

    window.addEventListener("keydown", handler);

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
  }, [
    isLastStep,
    onNext,
    onSaveDraft,
    onSubmit,
  ]);

  return (
    <div
      className="
        sticky
        bottom-0
        z-40
        mt-10
        border-t
        bg-white/90
        backdrop-blur
        px-6
        py-4
      "
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* Left */}

        <div className="flex gap-3">

          <button
            type="button"
            disabled={isFirstStep || loading}
            onClick={onPrevious}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              px-5
              py-3
              font-medium
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <ArrowLeft size={18} />

            Previous
          </button>

          {onSaveDraft && (
            <button
              type="button"
              disabled={loading}
              onClick={onSaveDraft}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                px-5
                py-3
                font-medium
                transition
                hover:bg-slate-100
                disabled:opacity-50
              "
            >
              <Save size={18} />

              Save Draft
            </button>
          )}
        </div>

        {/* Right */}

        {!isLastStep ? (
          <button
            type="button"
            disabled={!canProceed || loading}
            onClick={onNext}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:bg-blue-300
            "
          >
            Next

            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={onSubmit}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-green-600
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-green-700
              disabled:bg-green-300
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />

                Submit Feedback
              </>
            )}
          </button>
        )}
      </div>

      {/* Shortcut Help */}

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

        <span>

          <kbd className="rounded bg-slate-200 px-1">
            Ctrl
          </kbd>

          +

          <kbd className="rounded bg-slate-200 px-1">
            S
          </kbd>

          {" "}
          Save Draft

        </span>

        <span>

          <kbd className="rounded bg-slate-200 px-1">
            Ctrl
          </kbd>

          +

          <kbd className="rounded bg-slate-200 px-1">
            Enter
          </kbd>

          {" "}
          {isLastStep
            ? "Submit"
            : "Next Step"}

        </span>

      </div>
    </div>
  );
}