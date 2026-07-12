import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscSearch, VscClose, VscLoading, VscRocket } from 'react-icons/vsc';
import { matchApi, profileApi } from '../../services/backendApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Profile } from '../../types';
import { FaClock } from 'react-icons/fa';
import { Select } from '../../components/ui/Select';

const ROLES = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Systems Engineer', 'DevOps Engineer'];

export const Matchmaking: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [queueStatus, setQueueStatus] = useState<{ status: string; requestId?: string; sessionId?: string; expiresAt?: string } | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [notes, setNotes] = useState('');
  const [slots] = useState<any[]>([{ day: 'Monday', start: '09:00', end: '10:00', timezone: 'UTC' }]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatus = useCallback(async () => {
    const status: any = await matchApi.getQueueStatus();
    const s = (status?.data ?? status) as { status: string; requestId?: string; sessionId?: string; expiresAt?: string } | null;
    setQueueStatus(s);
    if (s?.sessionId) {
      clearInterval(pollingRef.current!);
      navigate(`/sessions/${s.sessionId}`);
    }
  }, [navigate]);

  useEffect(() => {
    const init = async () => {
      try {
        const [p] = await Promise.allSettled([
          profileApi.getMe()
        ]);
        if (p.status === 'fulfilled') {
          const profileValue: any = p.value;
          setProfile(profileValue);
          setTargetRole(profileValue?.targetRole ?? '');
        }
        await loadStatus();
      } catch {
        // ignore init error
      }
    };
    init();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [loadStatus]);

  useEffect(() => {
    if (queueStatus?.status === 'pending') {
      pollingRef.current = setInterval(loadStatus, 5000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [queueStatus?.status, loadStatus]);

  const handleRequest = async () => {
    setIsRequesting(true);
    try {
      await matchApi.requestMatch({ 
        interviewType: 'PEER',
        preferredRole: targetRole || profile?.targetRole?.toUpperCase(), 
        description: notes || undefined,
        duration: 60,
      });
      await loadStatus();
    } catch (e: unknown) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to request match');
    } finally { setIsRequesting(false); }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await matchApi.cancelMatch();
      await loadStatus();
    } finally { setIsCancelling(false); }
  };

  const isQueued = queueStatus?.status === 'pending';
  const isMatched = queueStatus?.status === 'matched';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text">Find a Match</h1>
        <p className="text-muted text-sm mt-0.5">Get paired with a peer for a live mock interview</p>
      </div>

      {/* Matched! */}
      {isMatched && queueStatus?.sessionId && (
        <div className="rounded-xl border-2 border-green-400 bg-success/10 p-5 text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <h2 className="text-lg font-bold text-green-800">You're matched!</h2>
          <p className="text-sm text-success">A peer interview partner has been found.</p>
          <Button onClick={() => navigate(`/sessions/${queueStatus.sessionId}`)}>
            <VscRocket size={16} /> Go to Session
          </Button>
        </div>
      )}

      {/* Queued / Searching */}
      {isQueued && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center space-y-4">
          <VscLoading className="animate-spin text-primary mx-auto" size={32} />
          <div>
            <h2 className="text-lg font-bold text-text">Searching for a match…</h2>
            <p className="text-sm text-muted mt-1">We're finding the best peer for you. This usually takes 1-3 minutes.</p>
            {queueStatus.expiresAt && (
              <p className="text-xs text-subtle mt-1 flex items-center justify-center gap-1">
                <FaClock size={12} /> Expires: {new Date(queueStatus.expiresAt).toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button variant="outline" isLoading={isCancelling} onClick={handleCancel} size="sm">
            <VscClose size={14} /> Cancel Search
          </Button>
        </div>
      )}

      {/* Request Form */}
      {!isQueued && !isMatched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request a Match</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Target Role</label>
              <Select 
                options={ROLES.map(r => ({ label: r, value: r }))} 
                value={targetRole || ''}
                onChange={setTargetRole}
                placeholder="Select your target role"
              />
              {profile?.targetRole && targetRole !== profile.targetRole && (
                <p className="text-xs text-subtle mt-1">Your profile role: {profile.targetRole}</p>
              )}
            </div>

            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted mb-2">Your Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(tag => <Badge key={tag} variant="blue">{tag}</Badge>)}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Notes (optional)</label>
              <textarea
                placeholder="e.g. I want to focus on system design questions..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <Button onClick={handleRequest} isLoading={isRequesting} className="w-full">
              <VscSearch size={16} /> Start Matching
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Slots */}
      {slots.length > 0 && !isQueued && !isMatched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Available Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg text-sm">
                  <FaClock className="text-primary shrink-0" size={14} />
                  <span className="font-medium text-muted">{slot.day}</span>
                  <span className="text-muted">{slot.start} - {slot.end}</span>
                  <Badge variant="gray" className="ml-auto">{slot.timezone}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

