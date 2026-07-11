import { VscArrowRight, VscCalendar, VscRocket, VscStarFull, VscBell } from 'react-icons/vsc';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import type { Session, OnboardingStatus } from '../../types';
import { FaWallet, FaRobot, FaTrophy } from 'react-icons/fa';
import { sessionApi } from '../../services/sessionApi';
import { onboardingApi } from '../../services/userApi';
import { Link, useNavigate } from "react-router-dom";
import { walletApi } from '../../services/sessionApi';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import React, { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';

const statusColor: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'> = {
  live: 'green', matched: 'blue', scheduled: 'purple',
  completed: 'gray', cancelled: 'red', pending: 'yellow',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge variant={statusColor[status] ?? 'gray'} className="capitalize">{status}</Badge>
);

const formatDate = (d?: string) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState<Session[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for new features
  const notifications = [
    { id: 1, title: 'Interview Scheduled', time: '2 hours ago', icon: '📅' },
    { id: 2, title: 'New points earned: +50', time: '1 day ago', icon: '💰' },
    { id: 3, title: 'AI Transcript ready', time: '2 days ago', icon: '🤖' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', points: 2540 },
    { rank: 2, name: 'Sam Smith', points: 2310 },
    { rank: 3, name: 'You', points: balance },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [sessions, wallet, ob] = await Promise.allSettled([
          sessionApi.getUpcoming(),
          walletApi.getBalance(),
          onboardingApi.getStatus(),
        ]);

        if (sessions.status === 'fulfilled') setUpcoming(sessions.value ?? []);
        if (wallet.status === 'fulfilled') setBalance(wallet.value?.balance ?? 0);
        if (ob.status === 'fulfilled') setOnboarding(ob.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const liveSession = upcoming.find(s => s.status === 'live');

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted text-sm mt-0.5">Here's what's happening with your prep</p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          <Button variant="outline" onClick={() => navigate('/ai-interview')} className="gap-2">
            <FaRobot size={16} />
            Continue AI Interview
          </Button>
          <Button onClick={() => navigate('/match')} className="gap-2">
            <VscCalendar size={16} />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Onboarding Banner */}
      {onboarding && !onboarding.completed && (
        <div className="rounded-xl border border-brand-200 bg-linear-to-r from-brand-50 to-blue-50 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <VscRocket className="text-primary" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text text-sm">Complete your profile ({onboarding.completionScore}%)</p>
            <p className="text-xs text-muted mt-0.5">Missing: {onboarding.missing.join(', ')}</p>
          </div>
          <div className="w-24 h-2 rounded-full bg-primary shrink-0">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${onboarding.completionScore}%` }} />
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/onboarding')} className="shrink-0">
            Continue <VscArrowRight size={14} />
          </Button>
        </div>
      )}

      {/* Live Session Alert */}
      {liveSession && (
        <div className="rounded-xl border border-green-200 bg-success/10 p-4 flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-800 text-sm">You have a live session in progress!</p>
            <p className="text-xs text-success mt-0.5">Room: {liveSession.roomId}</p>
          </div>
          <Button size="sm" onClick={() => navigate(`/room/${liveSession.id}`)} className="bg-success hover:bg-green-700 shrink-0">
            Rejoin
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Points Balance', value: balance.toLocaleString(), icon: <FaWallet  />, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Upcoming Sessions', value: upcoming.filter(s => s.status !== 'live').length, icon: <VscCalendar />, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Live Now', value: upcoming.filter(s => s.status === 'live').length, icon: <VscRocket />, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Profile Score', value: `${onboarding?.completionScore ?? 0}%`, icon: <VscStarFull />, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map(({ label, value, icon, color, bg }) => (
          <Card key={label} className="p-5">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center ${color} text-base mb-3`}>
              {icon}
            </div>
            <p className="text-2xl font-bold text-text">{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <VscCalendar className="text-primary" /> Upcoming Interviews
            </CardTitle>
            <button onClick={() => navigate('/sessions')} className="text-xs text-primary font-medium hover:text-primary flex items-center gap-1">
              View all
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            {upcoming.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted text-sm font-medium">No upcoming sessions</p>
                <Button size="sm" className="mt-3" onClick={() => navigate('/match')}>Schedule Interview</Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcoming.slice(0, 4).map(session => {
                  const myRole = session.participants[0]?.role;
                  return (
                    <div key={session.id} className="flex items-center gap-3 py-3 cursor-pointer hover:bg-bg rounded-lg transition-colors" onClick={() => navigate(`/sessions/${session.id}`)}>
                      <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center shrink-0 text-sm">🎯</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text text-sm capitalize">{myRole} Interview</p>
                        <p className="text-xs text-muted mt-0.5">{formatDate(session.scheduledAt)}</p>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <VscBell className="text-warning" /> Notifications
            </CardTitle>
            <button className="text-xs text-primary font-medium hover:text-primary">
              Mark all read
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-slate-100">
              {notifications.map(n => (
                <div key={n.id} className="flex items-center gap-3 py-3">
                  <div className="text-lg">{n.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-text text-sm">{n.title}</p>
                    <p className="text-xs text-muted mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Snapshot */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FaTrophy className="text-yellow-500" /> Leaderboard Snapshot
            </CardTitle>
            <button className="text-xs text-primary font-medium hover:text-primary">
              Full rankings
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {leaderboard.map((lb) => (
                <div key={lb.rank} className={`flex items-center justify-between p-2 rounded-lg ${lb.name === 'You' ? 'bg-primary/5 border border-primary/20' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold w-5 text-center ${lb.rank === 1 ? 'text-yellow-500' : lb.rank === 2 ? 'text-slate-400' : 'text-orange-400'}`}>#{lb.rank}</span>
                    <span className="font-medium text-sm text-text">{lb.name}</span>
                  </div>
                  <span className="text-sm font-bold text-brand-600">{lb.points} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          {[
            { label: 'Schedule Interview', desc: 'Get paired with a peer', icon: '📅', to: '/match', color: 'from-brand-600 to-blue-600' },
            { label: 'Continue AI Interview', desc: 'Practice solo with our AI', icon: '🤖', to: '/ai-interview', color: 'from-purple-600 to-pink-600' },
            { label: 'My Wallet', desc: `${balance} points available`, icon: '💰', to: '/wallet', color: 'from-green-600 to-teal-600' },
          ].map(({ label, desc, icon, to, color }) => (
            <button key={to} onClick={() => navigate(to)} className={`text-left p-4 rounded-xl bg-linear-to-br ${color} text-white hover:opacity-90 transition-opacity flex items-center gap-4`}>
              <div className="text-2xl">{icon}</div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-white/80 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold text-fg tracking-tight">
              <span className="text-brand-600">Tech-Hire-Prep</span>
            </Link>
            <p className="text-sm text-muted">
              Ace your tech interviews with real practice. Land your dream job with confidence.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-fg mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/about" className="hover:text-fg transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-fg transition-colors">How it Works</Link></li>
              <li><Link to="/pricing" className="hover:text-fg transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-fg mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/faq" className="hover:text-fg transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-fg transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-fg mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/privacy" className="hover:text-fg transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-fg transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-fg transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} Tech-Hire-Prep Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;