import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { VscArrowLeft, VscPlay, VscClose, VscCalendar, VscFeedback, VscStarFull } from 'react-icons/vsc';
import { sessionApi } from '../../services/sessionApi';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { FeedbackForm } from '../../components/feedback/FeedbackForm';
import type { Session } from '../../types';
import { useNavigate } from 'react-router-dom';

const statusColor: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
  live: 'green', matched: 'blue', scheduled: 'purple',
  completed: 'gray', cancelled: 'red', pending: 'yellow',
};

const RubricBar: React.FC<{ label: string; value: number; max?: number }> = ({ label, value, max = 5 }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-text">{value}/{max}</span>
    </div>
    <div className="h-2 rounded-full bg-surface-hover">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

export const SessionDetail: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const reload = () => {
    if (!sessionId) return;
    setLoading(true);
    sessionApi.getById(sessionId).then((res: any) => setSession(res?.data ?? res)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!sessionId) return;
    // Defer to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setLoading(true);
      sessionApi.getById(sessionId).then((res: any) => setSession(res?.data ?? res)).catch(() => {}).finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [sessionId]);

  const myParticipant = session?.participants.find(p => p.userId === user?.id);
  const canJoin = session?.status === 'live' || session?.status === 'matched' || session?.status === 'scheduled';
  const canFeedback = session?.status === 'completed' && myParticipant && !myParticipant.feedbackSubmitted;
  const canCancel = session?.status !== 'completed' && session?.status !== 'cancelled';

  const handleCancel = async () => {
    if (!sessionId) return;
    if (!confirm('Cancel this session?')) return;
    await sessionApi.cancel(sessionId);
    reload();
  };

  const handleRate = async () => {
    if (!sessionId || !rating) return;
    setRatingSubmitting(true);
    await sessionApi.rate(sessionId, rating);
    setRatingOpen(false);
    setRatingSubmitting(false);
    reload();
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  if (!session) return <div className="text-center py-16 text-muted">Session not found.</div>;

  const fmt = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) : '—';

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-surface-hover text-muted">
          <VscArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-text capitalize">{myParticipant?.role} Interview</h1>
            <Badge variant={statusColor[session.status] ?? 'gray'} className="capitalize">{session.status}</Badge>
          </div>
          <p className="text-sm text-muted mt-0.5">Room: {session.roomId}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {canJoin && (
            <Button onClick={() => navigate(`/room/${session.id}`)}>
              <VscPlay size={14} /> {session.status === 'live' ? 'Join' : 'Enter Room'}
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" onClick={handleCancel}>
              <VscClose size={14} /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Scheduled', value: fmt(session.scheduledAt) },
          { label: 'Started', value: fmt(session.startedAt) },
          { label: 'Ended', value: fmt(session.endedAt) },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-muted mb-1 flex items-center gap-1"><VscCalendar size={11} />{label}</p>
            <p className="text-sm font-medium text-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Participants */}
      <Card>
        <CardHeader><CardTitle className="text-base">Participants</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session.participants.map(p => (
              <div key={p.userId} className="flex items-center gap-3 p-3 rounded-lg bg-bg">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary font-bold text-sm">
                  {p.role === 'candidate' ? '🎯' : '🧑‍💻'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text text-sm capitalize">{p.role}{p.userId === user?.id ? ' (You)' : ''}</p>
                  <p className="text-xs text-muted">{p.feedbackSubmitted ? '✅ Feedback submitted' : '⏳ Feedback pending'}</p>
                </div>
                <Badge variant={p.feedbackSubmitted ? 'green' : 'yellow'}>{p.feedbackSubmitted ? 'Done' : 'Pending'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scorecard */}
      {session.scorecard && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <VscStarFull className="text-yellow-500" />
              Scorecard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{session.scorecard.overallScore}</span>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(session.scorecard.rubric).map(([key, val]) => (
                <RubricBar key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={val} />
              ))}
            </div>
            {session.scorecard.strengths.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-success mb-2">💪 Strengths</p>
                <ul className="space-y-1">{session.scorecard.strengths.map((s, i) => <li key={i} className="text-sm text-muted">• {s}</li>)}</ul>
              </div>
            )}
            {session.scorecard.improvements.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-orange-600 mb-2">🎯 Areas to Improve</p>
                <ul className="space-y-1">{session.scorecard.improvements.map((s, i) => <li key={i} className="text-sm text-muted">• {s}</li>)}</ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {(canFeedback || session.status === 'completed') && (
        <div className="flex gap-3 flex-wrap">
          {canFeedback && (
            <Button onClick={() => setFeedbackOpen(true)} className="gap-2">
              <VscFeedback size={14} /> Submit Feedback
            </Button>
          )}
          <Button variant="outline" onClick={() => setRatingOpen(true)} className="gap-2">
            <VscStarFull size={14} /> Rate Session
          </Button>
        </div>
      )}

      {/* Feedback Modal */}
      <Modal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Submit Feedback" size="lg">
        {session && (
          <FeedbackForm
            sessionId={session.id}
            onSuccess={() => { setFeedbackOpen(false); reload(); }}
          />
        )}
      </Modal>

      {/* Rating Modal */}
      <Modal isOpen={ratingOpen} onClose={() => setRatingOpen(false)} title="Rate this Session" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">How was the overall experience?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setRating(v)}
                className={`text-3xl transition-transform hover:scale-110 ${v <= rating ? 'opacity-100' : 'opacity-30'}`}>
                ⭐
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={handleRate} isLoading={ratingSubmitting} disabled={!rating}>
            Submit Rating
          </Button>
        </div>
      </Modal>
    </div>
  );
};
