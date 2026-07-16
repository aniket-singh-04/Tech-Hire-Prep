import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscSearch, VscClose, VscLoading, VscRocket } from 'react-icons/vsc';
import { matchApi, profileApi } from '../../services/backendApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ExperienceLevel, PreferredLanguage, TargetRole, type Profile, type InterviewRequest } from '../../types';
import { FaClock } from 'react-icons/fa';
import { Select } from '../../components/ui/Select';
import { interviewType } from '../../types/match.types';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/notifications';
import { useAuth } from '../../context/AuthContext';
import { IncomingInterviewRequest } from '../../components/match/IncomingInterviewRequest';

export const Matchmaking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [queueStatus, setQueueStatus] = useState<InterviewRequest | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [targetRole, setTargetRole] = useState<TargetRole>();
  const [interviewTypes, setInterviewTypes] = useState<interviewType>();
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>();
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>();
  const [duration, setDuration] = useState<number>();
  const [description, setDescription] = useState('');
  const [slots] = useState<any[]>([{ day: 'Monday', start: '09:00', end: '10:00', timezone: 'UTC' }]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ROLES = Object.values(TargetRole);
  const INTERVIEW_TYPES = Object.values(interviewType);
  const EXPERIENCE_LEVEL = Object.values(ExperienceLevel);
  const PREFERREDLANGUAGE = Object.values(PreferredLanguage);

  const loadStatus = useCallback(async () => {
    const status: any = await matchApi.getQueueStatus();
    console.log(status)
    const s = (status?.data ?? status) as InterviewRequest | null;
    setQueueStatus(s);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [p] = await Promise.allSettled([profileApi.getMe()]);
        if (p.status === 'fulfilled') {
          const profileValue: any = p.value;
          setProfile(profileValue);
          setTargetRole(profileValue?.targetRole ?? '');
        }
        await loadStatus();
      } catch (e: unknown) {
        pushToast({ title: 'Status load failed', description: getErrorMessage(e, 'Failed to load status'), variant: 'error' });
      }
    };
    init();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [loadStatus, pushToast]);

  useEffect(() => {
    if (queueStatus?.status === 'pending' && (!queueStatus.requesterId || queueStatus.requesterId === user?.id)) {
      pollingRef.current = setInterval(loadStatus, 5000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [loadStatus, queueStatus?.status, queueStatus?.requesterId, user?.id]);

  const handleRequest = async () => {
    if (!interviewTypes || !targetRole || !experienceLevel || !preferredLanguage || !duration) {
      pushToast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'error' });
      return;
    }
    try {
      setIsRequesting(true);
      await matchApi.requestMatch({
        interviewType: interviewTypes,
        preferredRole: targetRole,
        difficulty: experienceLevel,
        preferredLanguage: preferredLanguage,
        duration: duration,
        description: description || undefined,
      });
      pushToast({ title: 'Success', description: 'Match request submitted successfully!', variant: 'success' });
      await loadStatus();
    } catch (e: unknown) {
      pushToast({ title: 'Request failed', description: getErrorMessage(e, 'Failed to request match'), variant: 'error' });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await matchApi.cancelMatch();
      pushToast({ title: 'Success', description: 'Match request cancelled.', variant: 'success' });
      setQueueStatus(null);
      await loadStatus();
    } catch (e: unknown) {
      pushToast({ title: 'Cancel failed', description: getErrorMessage(e, 'Failed to cancel match request.'), variant: 'error' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!queueStatus?.requestId) return;
    try {
      setIsAccepting(true);
      const session = await matchApi.acceptMatch(queueStatus.requestId);
      setQueueStatus(null);
      pushToast({ title: 'Accepted', description: 'Interview request accepted.', variant: 'success' });
      navigate(`/sessions/${session.id}`);
    } catch (e: unknown) {
      pushToast({ title: 'Accept failed', description: getErrorMessage(e, 'Failed to accept the interview request.'), variant: 'error' });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!queueStatus?.requestId) return;
    try {
      setIsRejecting(true);
      await matchApi.rejectMatch(queueStatus.requestId);
      setQueueStatus(null);
      pushToast({ title: 'Rejected', description: 'Interview request rejected.', variant: 'success' });
      await loadStatus();
    } catch (e: unknown) {
      pushToast({ title: 'Reject failed', description: getErrorMessage(e, 'Failed to reject the interview request.'), variant: 'error' });
    } finally {
      setIsRejecting(false);
    }
  };

  const isIncomingRequest = queueStatus?.status === 'pending' && Boolean(queueStatus.requesterId) && queueStatus.requesterId !== user?.id;
  const isQueued = queueStatus?.status === 'pending' && !isIncomingRequest;
  const isMatched = queueStatus?.status === 'matched';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl ">
      <div>
        <h1 className="text-2xl font-bold text-text">Find a Match</h1>
        <p className="text-muted text-sm mt-0.5">Get paired with a peer for a live mock interview</p>
      </div>

      {isMatched && queueStatus?.sessionId && (
        <div className="rounded-xl border-2 border-green-400 bg-success/10 p-5 text-center space-y-3">
          <div className="text-4xl">??</div>
          <h2 className="text-lg font-bold text-green-800">You're matched!</h2>
          <p className="text-sm text-success">A peer interview partner has been found.</p>
          <Button onClick={() => navigate(`/sessions/${queueStatus.sessionId}`)}>
            <VscRocket size={16} /> Go to Session
          </Button>
        </div>
      )}

      {isIncomingRequest && queueStatus && (
        <Card className="border-amber-200 bg-amber-50/80">
          <CardHeader>
            <CardTitle className="text-base">Incoming interview request</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomingInterviewRequest
              request={queueStatus}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              accepting={isAccepting}
              rejecting={isRejecting}
              compact
            />
          </CardContent>
        </Card>
      )}

      {isQueued && (
        <div className="rounded-xl border border-blue-200  p-5 text-center space-y-4">
          <VscLoading className="animate-spin text-primary mx-auto" size={32} />
          <div>
            <h2 className="text-lg font-bold text-text">Searching for a match...</h2>
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

      {!isQueued && !isMatched && !isIncomingRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request a Match</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select label='Interview Type' options={INTERVIEW_TYPES.map((t) => ({ label: t, value: t }))} value={interviewTypes || ''} onChange={setInterviewTypes} placeholder="Select your interview type" />
            </div>
            <div>
              <Select label='Target Role' options={ROLES.map((t) => ({ label: t, value: t }))} value={targetRole || ''} onChange={setTargetRole} placeholder="Select your target role" />
              {profile?.targetRole && targetRole !== profile.targetRole && (
                <p className="text-xs text-subtle mt-1">Your profile role: {profile.targetRole}</p>
              )}
            </div>
            <div>
              <Select label='Experience Level' options={EXPERIENCE_LEVEL.map((t) => ({ label: t, value: t }))} value={experienceLevel || ''} onChange={setExperienceLevel} placeholder="Select your experience level" />
            </div>
            <div>
              <Select label='Preferred Language' options={PREFERREDLANGUAGE.map((t) => ({ label: t, value: t }))} value={preferredLanguage || ''} onChange={setPreferredLanguage} placeholder="Select your preferred language" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Duration</label>
              <Input type="number" placeholder="20 --(min)" required value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
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
              <label className="block text-sm font-medium text-muted mb-1">Discription --<span className="italic text-[12px]">(For better experience describe about your Role & Resume)</span></label>
              <textarea placeholder="e.g. I want to focus on system design questions..., Backend (Node.js), Frontend (React.js)..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-field resize-none" />
            </div>
            <Button onClick={handleRequest} isLoading={isRequesting} className="w-full"><VscSearch size={16} /> Start Matching</Button>
          </CardContent>
        </Card>
      )}

      {slots.length > 0 && !isQueued && !isMatched && !isIncomingRequest && (
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
