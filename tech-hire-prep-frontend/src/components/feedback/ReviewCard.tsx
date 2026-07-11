// src/components/feedback/ReviewCard.tsx

import {
  Star,
  AlertTriangle,
  Pencil,
  MessageSquare,
} from "lucide-react";
import type { FeedbackSchema } from "../../schema/feedback.schema";


interface ReviewCardProps {
  values: FeedbackSchema;

  onEdit?: (step: number) => void;
}

export default function ReviewCard({
  values,
  onEdit,
}: ReviewCardProps) {
  const technicalAverage = average(
    Object.values(values.technical)
  );

  const communicationAverage = average(
    Object.values(values.communication)
  );

  const softSkillAverage = average(
    Object.values(values.softSkills)
  );

  return (
    <div className="space-y-8">

      {/* Header */}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              Review Feedback
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review all your responses before
              submitting.
            </p>

          </div>

        </div>

      </section>

      {/* Overall */}

      <Card
        title="Overall Experience"
        step={1}
        onEdit={onEdit}
      >
        <ReviewItem
          label="Overall Rating"
          value={
            <RatingStars
              rating={values.overallRating}
            />
          }
        />

        <ReviewItem
          label="Interview Again"
          value={values.interviewAgain}
        />

        <ReviewItem
          label="Difficulty"
          value={values.interviewDifficulty}
        />

        <ReviewItem
          label="Professional"
          value={values.interviewerProfessional}
        />
      </Card>

      {/* Technical */}

      <Card
        title="Technical Skills"
        step={2}
        onEdit={onEdit}
      >
        <ScoreCard
          title="Average Technical Score"
          score={technicalAverage}
        />

        <RatingsTable
          ratings={values.technical}
        />
      </Card>

      {/* Communication */}

      <Card
        title="Communication"
        step={3}
        onEdit={onEdit}
      >
        <ScoreCard
          title="Communication Score"
          score={communicationAverage}
        />

        <RatingsTable
          ratings={values.communication}
        />
      </Card>

      {/* Interview Topics */}

      <Card
        title="Interview Topics"
        step={4}
        onEdit={onEdit}
      >
        <ChipList
          values={values.interviewTopics}
        />
      </Card>

      {/* Coding */}

      <Card
        title="Coding Evaluation"
        step={5}
        onEdit={onEdit}
      >
        <ReviewItem
          label="Problem Understanding"
          value={
            values.codingEvaluation
              .understoodProblem
          }
        />

        <ReviewItem
          label="Working Solution"
          value={
            values.codingEvaluation
              .workingSolution
          }
        />

        <ReviewItem
          label="Asked Clarifying Questions"
          value={
            values.codingEvaluation
              .askedClarifyingQuestions
              ? "Yes"
              : "No"
          }
        />

        <ReviewItem
          label="Explained Approach"
          value={
            values.codingEvaluation
              .explainedApproach
              ? "Yes"
              : "No"
          }
        />

        <ReviewItem
          label="Edge Cases"
          value={
            values.codingEvaluation
              .edgeCases
          }
        />
      </Card>

      {/* Strength */}

      <Card
        title="Strengths"
        step={6}
        onEdit={onEdit}
      >
        <ChipList
          values={values.strengths}
        />
      </Card>

      {/* Improvements */}

      <Card
        title="Areas to Improve"
        step={6}
        onEdit={onEdit}
      >
        <ChipList
          values={values.improvements}
        />
      </Card>

      {/* Soft Skills */}

      <Card
        title="Soft Skills"
        step={6}
        onEdit={onEdit}
      >
        <ScoreCard
          title="Soft Skills Score"
          score={softSkillAverage}
        />

        <RatingsTable
          ratings={values.softSkills}
        />
      </Card>

      {/* Comments */}

      <Card
        title="Written Feedback"
        step={7}
        onEdit={onEdit}
      >
        <Comment
          title="Impressed"
          value={
            values.writtenFeedback
              .impressed
          }
        />

        <Comment
          title="Improvements"
          value={
            values.writtenFeedback
              .improvements
          }
        />

        <Comment
          title="Advice"
          value={
            values.writtenFeedback
              .advice
          }
        />

        {values.writtenFeedback
          .additionalComments && (
          <Comment
            title="Additional"
            value={
              values.writtenFeedback
                .additionalComments
            }
          />
        )}
      </Card>

      {/* Report */}

      {values.report.reported && (
        <Card
          title="Reported Issues"
          step={7}
          onEdit={onEdit}
        >
          <div className="rounded-xl border border-red-300 bg-red-50 p-5">

            <div className="mb-4 flex items-center gap-2 text-red-600">

              <AlertTriangle size={18} />

              <h3 className="font-semibold">
                Report Submitted
              </h3>

            </div>

            <ChipList
              values={values.report.reasons}
            />

            {values.report.description && (
              <p className="mt-5 whitespace-pre-wrap">
                {
                  values.report
                    .description
                }
              </p>
            )}

          </div>
        </Card>
      )}

      {/* Final */}

      <Card
        title="Final Recommendation"
        step={8}
        onEdit={onEdit}
      >
        <ReviewItem
          label="Recommendation"
          value={
            values.overallRecommendation
          }
        />

        <ReviewItem
          label="Public Review"
          value={
            values.publicReview
              .visibility
          }
        />

        <ReviewItem
          label="Terms Accepted"
          value={
            values.agreeTerms
              ? "Yes"
              : "No"
          }
        />
      </Card>

    </div>
  );
}

/* ---------------------------------------------------------------- */

function Card({
  title,
  children,
  step,
  onEdit,
}: any) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <h3 className="text-xl font-semibold">
          {title}
        </h3>

        {onEdit && (
          <button
            onClick={() => onEdit(step)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-slate-100"
          >
            <Pencil size={16} />

            Edit
          </button>
        )}

      </div>

      {children}

    </section>
  );
}

/* ---------------------------------------------------------------- */

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b py-3">

      <span className="font-medium text-slate-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}

/* ---------------------------------------------------------------- */

function RatingStars({
  rating,
}: {
  rating: number;
}) {
  return (
    <div className="flex items-center gap-1">

      {Array.from({ length: 5 }).map(
        (_, index) => (
          <Star
            key={index}
            size={18}
            className={
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }
          />
        )
      )}

    </div>
  );
}

/* ---------------------------------------------------------------- */

function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="mb-6 rounded-xl bg-blue-50 p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-blue-700">
        {score.toFixed(1)}
        <span className="text-lg"> / 5</span>
      </h2>

    </div>
  );
}

/* ---------------------------------------------------------------- */

function RatingsTable({
  ratings,
}: {
  ratings: Record<string, number>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">

      {Object.entries(ratings).map(
        ([key, value]) => (
          <ReviewItem
            key={key}
            label={format(key)}
            value={
              <RatingStars
                rating={value}
              />
            }
          />
        )
      )}

    </div>
  );
}

/* ---------------------------------------------------------------- */

function ChipList({
  values,
}: {
  values: string[];
}) {
  return (
    <div className="flex flex-wrap gap-3">

      {values.map((item) => (
        <span
          key={item}
          className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
        >
          {item}
        </span>
      ))}

    </div>
  );
}

/* ---------------------------------------------------------------- */

function Comment({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="mb-6 rounded-xl border p-5">

      <div className="mb-3 flex items-center gap-2">

        <MessageSquare size={18} />

        <h4 className="font-semibold">
          {title}
        </h4>

      </div>

      <p className="whitespace-pre-wrap text-slate-600">
        {value}
      </p>

    </div>
  );
}

/* ---------------------------------------------------------------- */

function average(numbers: number[]) {
  return (
    numbers.reduce(
      (acc, item) => acc + item,
      0
    ) / numbers.length
  );
}

function format(text: string) {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
}