import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscArrowRight, VscCalendar } from 'react-icons/vsc';
import { paymentApi, sessionApi } from '../../services/backendApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import type { Session } from '../../types';

const statusColor: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
  live: 'green',
  matched: 'blue',
  scheduled: 'purple',
  completed: 'gray',
  cancelled: 'red',
  pending: 'yellow',
};

type PaymentState = 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled' | 'due';

const fmt = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled';

const normalizePaymentState = (status?: string): PaymentState | undefined => {
  switch ((status ?? '').toUpperCase()) {
    case 'PAID':
      return 'paid';
    case 'PENDING':
    case 'CREATED':
      return 'pending';
    case 'FAILED':
      return 'failed';
    case 'REFUNDED':
      return 'refunded';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return undefined;
  }
};

const buildPaymentMap = (items: any[]) => {
  const bySessionId: Record<string, PaymentState> = {};
  for (const item of items) {
    const sessionId = String(item?.metadata?.sessionId ?? item?.sessionId ?? '');
    if (!sessionId || bySessionId[sessionId]) continue;
    const state = normalizePaymentState(item?.status);
    if (state) bySessionId[sessionId] = state;
  }
  return bySessionId;
};

const getPaymentBadge = (session: Session, paymentState?: PaymentState) => {
  const requiresPayment = ['matched', 'scheduled', 'live'].includes(session.status);
  if (paymentState === 'paid') return { label: 'Paid', variant: 'green' as const };
  if (paymentState === 'failed') return { label: 'Payment failed', variant: 'red' as const };
  if (paymentState === 'refunded') return { label: 'Refunded', variant: 'gray' as const };
  if (paymentState === 'cancelled') return { label: 'Payment cancelled', variant: 'red' as const };
  if (paymentState === 'pending') return { label: 'Payment pending', variant: 'yellow' as const };
  if (requiresPayment) return { label: 'Payment due', variant: 'yellow' as const };
  return null;
};

const SessionRow: React.FC<{
  session: Session;
  paymentState?: PaymentState;
  onClick: () => void;
  onJoin?: () => void;
}> = ({ session, paymentState, onClick, onJoin }) => {
  const role = session.participants[0]?.role ?? 'participant';
  const paymentBadge = getPaymentBadge(session, paymentState);

  return (
    <div className="flex items-center gap-4 py-3.5 px-4 hover:bg-bg cursor-pointer rounded-xl transition-colors" onClick={onClick}>
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
        {role === 'candidate' ? 'C' : 'I'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-text text-sm capitalize">{role} Interview</p>
          <Badge variant={statusColor[session.status] ?? 'gray'} className="capitalize">{session.status}</Badge>
          {paymentBadge && <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>}
        </div>
        <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
          <VscCalendar size={11} />
          {fmt(session.scheduledAt ?? session.startedAt ?? session.endedAt)}
        </p>
      </div>
      {session.status === 'live' && onJoin && (
        <Button size="sm" onClick={e => { e.stopPropagation(); onJoin(); }} className="bg-success hover:bg-green-700">Join</Button>
      )}
      {session.scorecard && (
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-text">{session.scorecard.overallScore}/10</p>
          <p className="text-xs text-subtle">Score</p>
        </div>
      )}
      <VscArrowRight className="text-subtle shrink-0" size={14} />
    </div>
  );
};

export const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<Session[]>([]);
  const [paymentBySession, setPaymentBySession] = useState<Record<string, PaymentState>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [sessionsRes, paymentsRes] = await Promise.all([
          sessionApi.getUpcoming(),
          paymentApi.getHistory({ limit: 100, page: 1 }),
        ]);

        const sessions = Array.isArray(sessionsRes) ? sessionsRes : Array.isArray((sessionsRes as any)?.data) ? (sessionsRes as any).data : [];
        const paymentsPayload = Array.isArray(paymentsRes)
          ? paymentsRes
          : Array.isArray((paymentsRes as any)?.data)
            ? (paymentsRes as any).data
            : Array.isArray((paymentsRes as any)?.data?.data)
              ? (paymentsRes as any).data.data
              : [];

        if (!active) return;
        setUpcoming(sessions);
        setPaymentBySession(buildPaymentMap(paymentsPayload));
      } catch {
        if (!active) return;
        setUpcoming([]);
        setPaymentBySession({});
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text">Upcoming Sessions</h1>
          <p className="text-muted text-sm mt-0.5">Your scheduled interviews and payment state</p>
        </div>
        <Button size="sm" onClick={() => navigate('/match')} variant="outline">Find Match</Button>
      </div>

      <Card>
        <CardContent className="pt-2">
          {upcoming.length === 0 ? (
            <div className="text-center py-16">
              <VscCalendar size={40} className="mx-auto mb-4 text-muted" />
              <p className="font-semibold text-muted">No upcoming sessions</p>
              <p className="text-sm text-subtle mt-1">Match with a peer to start practicing</p>
              <Button className="mt-4" onClick={() => navigate('/match')}>Find a Match</Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map(s => (
                <SessionRow
                  key={s.id}
                  session={s}
                  paymentState={paymentBySession[s.id]}
                  onClick={() => navigate(`/sessions/${s.id}`)}
                  onJoin={s.status === 'live' ? () => navigate(`/room/${s.id}`) : undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Session[]>([]);
  const [paymentBySession, setPaymentBySession] = useState<Record<string, PaymentState>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [sessionsRes, paymentsRes] = await Promise.all([
          sessionApi.getHistory(),
          paymentApi.getHistory({ limit: 100, page: 1 }),
        ]);

        const sessions = Array.isArray(sessionsRes) ? sessionsRes : Array.isArray((sessionsRes as any)?.data) ? (sessionsRes as any).data : [];
        const paymentsPayload = Array.isArray(paymentsRes)
          ? paymentsRes
          : Array.isArray((paymentsRes as any)?.data)
            ? (paymentsRes as any).data
            : Array.isArray((paymentsRes as any)?.data?.data)
              ? (paymentsRes as any).data.data
              : [];

        if (!active) return;
        setHistory(sessions);
        setPaymentBySession(buildPaymentMap(paymentsPayload));
      } catch {
        if (!active) return;
        setHistory([]);
        setPaymentBySession({});
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">Session History</h1>
        <p className="text-muted text-sm mt-0.5">Past interviews, outcomes, and payment records</p>
      </div>

      <Card>
        <CardContent className="pt-2">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 w-11 h-11 rounded-2xl bg-surface-strong flex items-center justify-center text-lg font-bold text-muted">H</div>
              <p className="font-semibold text-muted">No history yet</p>
              <p className="text-sm text-subtle mt-1">Complete interviews to see your history here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map(s => (
                <SessionRow
                  key={s.id}
                  session={s}
                  paymentState={paymentBySession[s.id]}
                  onClick={() => navigate(`/sessions/${s.id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
