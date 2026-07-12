import { FiCalendar, FiPlayCircle, FiArrowRight, FiTrendingUp, FiUsers, FiClock, FiMapPin, FiMessageSquare } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import type { Session } from '../../types';
import { sessionApi } from '../../services/sessionApi';
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import React, { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';

const statusColor: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
  live: 'green', matched: 'blue', scheduled: 'purple', completed: 'gray', cancelled: 'red', pending: 'yellow',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge variant={statusColor[status] ?? 'gray'} className="capitalize">{status}</Badge>
);

const formatDate = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '?';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sessions: any = await sessionApi.getUpcoming();
        const normalized = Array.isArray(sessions) ? sessions : Array.isArray(sessions?.data) ? sessions.data : [];
        setUpcoming(normalized);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const liveSession = upcoming.find((s) => s.status === 'live');
  const scheduled = upcoming.filter((s) => s.status === 'scheduled');

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white p-6 md:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.22),_transparent_30%)]" />
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
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="text-3xl font-bold text-text mt-2">{value}</p>
              </div>
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent} text-white flex items-center justify-center`}>
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
                  return (
                    <div key={session.id} className="flex items-center gap-3 py-3 cursor-pointer hover:bg-bg rounded-lg transition-colors" onClick={() => navigate(`/sessions/${session.id}`)}>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-sm">{myRole === 'candidate' ? '??' : '?????'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text text-sm capitalize">{myRole} Interview</p>
                        <p className="text-xs text-muted mt-0.5">{formatDate(session.scheduledAt ?? session.startedAt)}</p>
                      </div>
                      <StatusBadge status={session.status} />
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
