import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiClock, FiMapPin, FiMessageSquare, FiPlayCircle, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { paymentApi, sessionApi } from '../../services/backendApi';
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

const paymentColor: Record<PaymentState, 'green' | 'yellow' | 'red' | 'gray'> = {
  paid: 'green',
  pending: 'yellow',
  failed: 'red',
  refunded: 'gray',
  cancelled: 'red',
  due: 'yellow',
};

const formatDate = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '?';

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

const resolvePaymentBadge = (session: Session, paymentState?: PaymentState) => {
  const requiresPayment = ['matched', 'scheduled', 'live'].includes(session.status);
  if (paymentState === 'paid') return { label: 'Paid', variant: paymentColor.paid };
  if (paymentState === 'failed') return { label: 'Payment failed', variant: paymentColor.failed };
  if (paymentState === 'refunded') return { label: 'Refunded', variant: paymentColor.refunded };
  if (paymentState === 'cancelled') return { label: 'Payment cancelled', variant: paymentColor.cancelled };
  if (paymentState === 'pending') return { label: 'Payment pending', variant: paymentColor.pending };
  if (requiresPayment) return { label: 'Payment due', variant: paymentColor.due };
  return null;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
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
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const liveSession = upcoming.find((s) => s.status === 'live');
  const scheduled = upcoming.filter((s) => s.status === 'scheduled');
  const paymentDueCount = upcoming.filter((s) => ['matched', 'scheduled', 'live'].includes(s.status) && paymentBySession[s.id] !== 'paid').length;

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <section className="rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-900 text-white p-6 md:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 bg-[radial-linear(circle_at_top_right,rgba(56,189,248,0.22),transparent_35%),radial-linear(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] ?? 'there'}</h1>
            <p className="text-sky-100/80 max-w-xl">Track upcoming interviews, jump back into a live room, and keep your practice flow moving.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/match')} className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <FiPlayCircle size={16} />
              Start practice
            </Button>
            <Button onClick={() => navigate('/sessions')} className="gap-2 bg-white text-slate-950 hover:bg-slate-100">
              <FiCalendar size={16} />
              View sessions
            </Button>
          </div>
        </div>
      </section>

      {paymentDueCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">{paymentDueCount} session{paymentDueCount === 1 ? '' : 's'} need payment.</p>
            <p className="text-xs text-amber-700 mt-0.5">Open a session to complete checkout and unlock the interview room.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/sessions')} className="bg-amber-600 hover:bg-amber-700 shrink-0">Review</Button>
        </div>
      )}

      {liveSession && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900 text-sm">You have a live session in progress.</p>
            <p className="text-xs text-emerald-700 mt-0.5 flex items-center gap-1"><FiMapPin /> Room {liveSession.roomId}</p>
          </div>
          <Button size="sm" onClick={() => navigate(`/room/${liveSession.id}`)} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">Rejoin</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming sessions', value: upcoming.length, icon: FiCalendar, accent: 'from-sky-500 to-cyan-500' },
          { label: 'Scheduled', value: scheduled.length, icon: FiClock, accent: 'from-violet-500 to-fuchsia-500' },
          { label: 'Live now', value: upcoming.filter((s) => s.status === 'live').length, icon: FiTrendingUp, accent: 'from-emerald-500 to-teal-500' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="border-0 pt-5 shadow-sm">
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="text-3xl font-bold text-text mt-2">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-2xl bg-linear-to-br ${accent} text-white flex items-center justify-center`}>
                <Icon size={20} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2"><FiCalendar className="text-primary" /> Upcoming Interviews</CardTitle>
            <button onClick={() => navigate('/sessions')} className="text-xs text-primary font-medium hover:text-primary flex items-center gap-1">View all <FiArrowRight /></button>
          </CardHeader>
          <CardContent className="pt-0">
            {upcoming.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted text-sm font-medium">No upcoming sessions</p>
                <Button size="sm" className="mt-3" onClick={() => navigate('/match')}>Schedule Interview</Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcoming.slice(0, 5).map((session) => {
                  const myRole = session.participants[0]?.role ?? 'candidate';
                  const paymentState = paymentBySession[session.id];
                  const paymentBadge = resolvePaymentBadge(session, paymentState);
                  return (
                    <div key={session.id} className="flex items-center gap-3 py-3 cursor-pointer hover:bg-bg rounded-lg transition-colors" onClick={() => navigate(`/sessions/${session.id}`)}>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-sm">{myRole === 'candidate' ? 'C' : 'I'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-text text-sm capitalize">{myRole} Interview</p>
                          <Badge variant={statusColor[session.status] ?? 'gray'} className="capitalize">{session.status}</Badge>
                          {paymentBadge && <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>}
                        </div>
                        <p className="text-xs text-muted mt-0.5">{formatDate(session.scheduledAt ?? session.startedAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button onClick={() => navigate('/match')} className="w-full text-left p-4 rounded-2xl border border-border bg-surface-strong text-primary shadow-sm hover:bg-surface-hover transition-colors flex items-center gap-4">
                <FiMessageSquare size={20} />
                <div>
                  <p className="font-semibold text-sm">Find a practice match</p>
                  <p className="text-xs text-muted">Get paired for a mock interview.</p>
                </div>
              </button>
              <button onClick={() => navigate('/profile')} className="w-full text-left p-4 rounded-2xl border border-border bg-surface text-primary shadow-sm hover:bg-surface-hover transition-colors flex items-center gap-4">
                <FiUsers size={20} />
                <div>
                  <p className="font-semibold text-sm">Update your profile</p>
                  <p className="text-xs text-muted">Keep your preferences current.</p>
                </div>
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                ['Sessions', '/sessions'], ['History', '/history'], ['Profile', '/profile'], ['Practice', '/match'],
              ].map(([label, to]) => (
                <button key={to} onClick={() => navigate(to)} className="rounded-2xl border border-border bg-surface p-3 text-left text-sm font-medium hover:bg-surface-hover">{label}</button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="text-sm text-muted pt-4">
        <Link to="/about" className="hover:text-fg">About</Link>
      </footer>
    </div>
  );
};

export default Dashboard;

