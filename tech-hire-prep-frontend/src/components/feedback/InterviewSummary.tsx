// src/components/feedback/InterviewSummary.tsx

import {
  CalendarDays,
  Clock3,
  Video,
  UserRound,
  BriefcaseBusiness,
  CheckCircle2,
} from "lucide-react";

interface Person {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface InterviewSummaryProps {
  candidate: Person;
  interviewer: Person;

  company?: string;

  interviewType: string;

  status: "Completed" | "Cancelled" | "Scheduled";

  duration: number;

  interviewDate: string;

  interviewTime: string;
}

const statusStyles = {
  Completed:
    "bg-green-100 text-green-700 border-green-200",

  Scheduled:
    "bg-blue-100 text-blue-700 border-blue-200",

  Cancelled:
    "bg-red-100 text-red-700 border-red-200",
};

export default function InterviewSummary({
  candidate,
  interviewer,
  company,
  interviewType,
  duration,
  interviewDate,
  interviewTime,
  status,
}: InterviewSummaryProps) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Interview Summary
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Review the interview information before
            submitting your feedback.
          </p>

        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusStyles[status]}`}
        >
          <CheckCircle2 size={16} />

          {status}
        </div>

      </div>

      {/* Divider */}

      <div className="my-6 border-t" />

      {/* Candidate + Interviewer */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Candidate */}

        <div className="rounded-xl border p-5">

          <div className="flex items-center gap-4">

            <img
              src={
                candidate.avatar ??
                `https://ui-avatars.com/api/?name=${candidate.name}`
              }
              alt={candidate.name}
              className="h-16 w-16 rounded-full object-cover"
            />

            <div>

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Candidate
              </p>

              <h3 className="text-lg font-semibold">
                {candidate.name}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                <UserRound size={15} />

                {candidate.role}

              </div>

            </div>

          </div>

        </div>

        {/* Interviewer */}

        <div className="rounded-xl border p-5">

          <div className="flex items-center gap-4">

            <img
              src={
                interviewer.avatar ??
                `https://ui-avatars.com/api/?name=${interviewer.name}`
              }
              alt={interviewer.name}
              className="h-16 w-16 rounded-full object-cover"
            />

            <div>

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Interviewer
              </p>

              <h3 className="text-lg font-semibold">
                {interviewer.name}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                <UserRound size={15} />

                {interviewer.role}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Divider */}

      <div className="my-6 border-t" />

      {/* Interview Information */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <InfoCard
          icon={<BriefcaseBusiness size={18} />}
          label="Company"
          value={company ?? "Community Interview"}
        />

        <InfoCard
          icon={<Video size={18} />}
          label="Interview Type"
          value={interviewType}
        />

        <InfoCard
          icon={<CalendarDays size={18} />}
          label="Interview Date"
          value={`${interviewDate} • ${interviewTime}`}
        />

        <InfoCard
          icon={<Clock3 size={18} />}
          label="Duration"
          value={`${duration} Minutes`}
        />

      </div>

    </section>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({
  icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-blue-600">

        {icon}

        <span className="text-sm font-medium">
          {label}
        </span>

      </div>

      <p className="mt-3 text-base font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}