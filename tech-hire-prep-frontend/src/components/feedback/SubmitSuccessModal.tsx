// src/components/feedback/SubmitSuccessModal.tsx

import {
  CheckCircle2,
  Trophy,
  Download,
  LayoutDashboard,
  FileText,
  Sparkles,
  X,
} from "lucide-react";

interface SubmitSuccessModalProps {
  open: boolean;

  earnedPoints: number;

  overallScore: number;

  technicalScore: number;

  communicationScore: number;

  professionalismScore: number;

  onClose: () => void;

  onDashboard: () => void;

  onViewScorecard: () => void;

  onDownloadReport: () => void;
}

export default function SubmitSuccessModal({
  open,
  earnedPoints,
  overallScore,
  technicalScore,
  communicationScore,
  professionalismScore,
  onClose,
  onDashboard,
  onViewScorecard,
  onDownloadReport,
}: SubmitSuccessModalProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-4
      "
    >
      <div
        className="
          relative
          w-full
          max-w-2xl
          rounded-3xl
          bg-white
          shadow-2xl
        "
      >
        {/* Close */}

        <button
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            rounded-lg
            p-2
            hover:bg-slate-100
          "
        >
          <X size={20} />
        </button>

        {/* Header */}

        <div className="border-b p-8 text-center">

          <div
            className="
              mx-auto
              flex
              h-24
              w-24
              animate-pulse
              items-center
              justify-center
              rounded-full
              bg-green-100
            "
          >
            <CheckCircle2
              size={52}
              className="text-green-600"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Feedback Submitted
          </h1>

          <p className="mt-3 text-slate-500">
            Thank you for helping improve the
            Tech-Hire-Prep community.
          </p>

        </div>

        {/* Reward */}

        <div className="border-b p-8">

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">

            <div className="flex items-center gap-3">

              <Trophy size={32} />

              <div>

                <p className="text-sm opacity-80">
                  Reward Earned
                </p>

                <h2 className="text-4xl font-bold">
                  +{earnedPoints} Points
                </h2>

              </div>

            </div>

          </div>

        </div>

        {/* Scores */}

        <div className="grid gap-4 border-b p-8 md:grid-cols-2">

          <ScoreCard
            title="Overall Score"
            value={overallScore}
          />

          <ScoreCard
            title="Technical"
            value={technicalScore}
          />

          <ScoreCard
            title="Communication"
            value={communicationScore}
          />

          <ScoreCard
            title="Professionalism"
            value={professionalismScore}
          />

        </div>

        {/* AI */}

        <div className="border-b p-8">

          <div className="flex items-start gap-4 rounded-2xl bg-blue-50 p-5">

            <Sparkles
              className="text-blue-600"
              size={28}
            />

            <div>

              <h3 className="font-semibold">
                AI Summary
              </h3>

              <p className="mt-2 text-sm text-slate-600">

                Thank you for submitting structured
                feedback.

                Your review will help improve future
                interview quality and interviewer
                rankings.

              </p>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="grid gap-4 p-8 md:grid-cols-3">

          <button
            onClick={onDashboard}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-3
              font-semibold
              text-white
              hover:bg-blue-700
            "
          >
            <LayoutDashboard size={18} />

            Dashboard
          </button>

          <button
            onClick={onViewScorecard}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-5
              py-3
              font-semibold
              hover:bg-slate-100
            "
          >
            <FileText size={18} />

            Scorecard
          </button>

          <button
            onClick={onDownloadReport}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-5
              py-3
              font-semibold
              hover:bg-slate-100
            "
          >
            <Download size={18} />

            Report
          </button>

        </div>

      </div>
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  value: number;
}

function ScoreCard({
  title,
  value,
}: ScoreCardProps) {
  return (
    <div className="rounded-xl border bg-slate-50 p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-blue-600">
        {value}
        <span className="text-lg text-slate-500">
          /100
        </span>
      </h2>

    </div>
  );
}