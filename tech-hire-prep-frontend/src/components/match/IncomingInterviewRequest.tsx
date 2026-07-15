import React from 'react';
import { FiClock, FiUser, FiZap } from 'react-icons/fi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { InterviewRequest } from '../../types';

interface IncomingInterviewRequestProps {
  request: InterviewRequest;
  onAccept: () => void;
  onReject: () => void;
  accepting?: boolean;
  rejecting?: boolean;
  compact?: boolean;
}

const metaValue = (value?: string | number | null) => (value ?? 'Not specified');

export const IncomingInterviewRequest: React.FC<IncomingInterviewRequestProps> = ({
  request,
  onAccept,
  onReject,
  accepting = false,
  rejecting = false,
  compact = false,
}) => {
  const title = request.requesterName ? `${request.requesterName} invited you` : 'Incoming interview request';

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-sm text-muted">
            Review the interview details, then accept or reject the request.
          </p>
        </div>
        <Badge variant="yellow">Pending</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted mb-2 flex items-center gap-1">
            <FiUser size={12} /> Requester
          </p>
          <p className="font-semibold text-text">{metaValue(request.requesterName)}</p>
          {request.requesterHeadline && (
            <p className="text-sm text-muted mt-1">{request.requesterHeadline}</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted mb-2 flex items-center gap-1">
            <FiClock size={12} /> Duration
          </p>
          <p className="font-semibold text-text">{metaValue(request.duration ? `${request.duration} min` : null)}</p>
          <p className="text-sm text-muted mt-1">{metaValue(request.interviewType)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 text-sm">
        <div className="rounded-2xl border border-border bg-bg p-3">
          <p className="text-muted text-xs">Target role</p>
          <p className="font-medium text-text mt-1">{metaValue(request.preferredRole)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg p-3">
          <p className="text-muted text-xs">Difficulty</p>
          <p className="font-medium text-text mt-1">{metaValue(request.difficulty)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg p-3">
          <p className="text-muted text-xs">Language</p>
          <p className="font-medium text-text mt-1">{metaValue(request.preferredLanguage)}</p>
        </div>
      </div>

      {request.description && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted mb-2 flex items-center gap-1">
            <FiZap size={12} /> Notes
          </p>
          <p className="text-sm text-muted leading-6">{request.description}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button variant="outline" onClick={onReject} isLoading={rejecting}>
          Reject
        </Button>
        <Button onClick={onAccept} isLoading={accepting}>
          Accept interview
        </Button>
      </div>
    </div>
  );
};
