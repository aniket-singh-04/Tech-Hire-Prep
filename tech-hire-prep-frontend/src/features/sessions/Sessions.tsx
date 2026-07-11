import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscArrowRight, VscCalendar } from 'react-icons/vsc';
import { sessionApi } from '../../services/sessionApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import type { Session } from '../../types';

const statusColor: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
  live: 'green', matched: 'blue', scheduled: 'purple',
  completed: 'gray', cancelled: 'red', pending: 'yellow',
};

const fmt = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled';

const SessionRow: React.FC<{ session: Session; onClick: () => void; onJoin?: () => void }> = ({ session, onClick, onJoin }) => {
  const role = session.participants[0]?.role ?? 'participant';
  return (
    <div className="flex items-center gap-4 py-3.5 px-4 hover:bg-bg cursor-pointer rounded-xl transition-colors" onClick={onClick}>
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
        {role === 'candidate' ? '🎯' : '🧑‍💻'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-text text-sm capitalize">{role} Interview</p>
          <Badge variant={statusColor[session.status] ?? 'gray'} className="capitalize">{session.status}</Badge>
        </div>
        <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
          <VscCalendar size={11} />
          {fmt(session.scheduledAt ?? session.startedAt)}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.getUpcoming().then(setUpcoming).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Upcoming Sessions</h1>
          <p className="text-muted text-sm mt-0.5">Your scheduled and matched interviews</p>
        </div>
        <Button size="sm" onClick={() => navigate('/match')} variant="outline">Find Match</Button>
      </div>

      <Card>
        <CardContent className="pt-2">
          {upcoming.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📅</div>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.getHistory().then(setHistory).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">Session History</h1>
        <p className="text-muted text-sm mt-0.5">Past interviews and their outcomes</p>
      </div>

      <Card>
        <CardContent className="pt-2">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📊</div>
              <p className="font-semibold text-muted">No history yet</p>
              <p className="text-sm text-subtle mt-1">Complete interviews to see your history here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map(s => (
                <SessionRow key={s.id} session={s} onClick={() => navigate(`/sessions/${s.id}`)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
