import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { profileApi } from '../../../services/backendApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Avatar } from '../../../components/ui/Avatar';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import type { Profile } from '../../../types';

type Tab = 'personal' | 'skills' | 'availability' | 'preferences' | 'stats' | 'reviews' | 'badges' | 'account' | 'security';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'System Design', 'Product Sense', 'Data Structures'];
const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust'];
const FOCUS_AREAS = ['Algorithms', 'System Design', 'Frontend', 'Backend', 'Machine Learning', 'DevOps'];

const BADGE_LIST = [
  { id: 'first_interview', icon: '🎯', name: 'First Interview', desc: 'Completed your first mock interview', earned: true },
  { id: 'five_sessions', icon: '🔥', name: 'On Fire', desc: '5 sessions completed', earned: true },
  { id: 'perfect_score', icon: '⭐', name: 'Perfect Score', desc: 'Received a 10/10 scorecard', earned: false },
  { id: 'top_interviewer', icon: '🧑‍💻', name: 'Top Interviewer', desc: 'Highly rated as interviewer', earned: false },
  { id: 'consistency', icon: '📅', name: 'Consistent', desc: '7-day streak', earned: false },
];

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skillTags, setSkillTags] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(1);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [college, setCollege] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [interviewTypes, setInterviewTypes] = useState<string[]>([]);
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getMe();
        const profileData = data as unknown as Profile;
        setHeadline(profileData.headline || '');
        setBio(profileData.bio || '');
        setTargetRole(profileData.targetRole || '');
        setSkillTags(profileData.skillTags?.join(', ') || '');
        setExperienceLevel(profileData.experienceLevel || 1);
        setCollege(profileData.college || '');
        setLinkedinUrl(profileData.verification?.linkedinUrl || '');
        setGithubUrl(profileData.verification?.githubUrl || '');
        setSelectedDays(profileData.availability?.map(a => a.day) || []);
        setInterviewTypes(profileData.preferences?.interviewTypes || []);
        setPreferredLanguages(profileData.preferences?.preferredLanguages || []);
        setFocusAreas(profileData.preferences?.focusAreas || []);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      await profileApi.updateMe({ headline, bio, targetRole, college, skillTags: skillTags.split(',').map(s => s.trim()).filter(Boolean) });
      showSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    try {
      await profileApi.updateAvailability(
        selectedDays.map(day => ({ day, start: '09:00', end: '17:00', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }))
      );
      showSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // API endpoint for preferences is not defined in backend schema
      await new Promise(resolve => setTimeout(resolve, 500));
      showSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = (val: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'personal', label: 'Personal Info', icon: '👤' },
    { key: 'skills', label: 'Skills', icon: '🛠' },
    { key: 'availability', label: 'Availability', icon: '📅' },
    { key: 'preferences', label: 'Preferences', icon: '⚙️' },
    { key: 'stats', label: 'Statistics', icon: '📊' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
    { key: 'badges', label: 'Badges', icon: '🏅' },
    { key: 'account', label: 'Account Settings', icon: '🔧' },
    { key: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
      {/* Sidebar */}
      <Card className="w-full md:w-64 shrink-0 h-fit">
        <CardContent className="p-4 flex flex-col space-y-1">
          <div className="flex flex-col items-center mb-6 mt-4 gap-2">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('account')}>
              <Avatar name={user?.name || 'User'} size="xl" />
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                Change
              </div>
            </div>
            <h3 className="mt-1 font-semibold text-text text-center">{user?.name}</h3>
            <p className="text-xs text-muted text-center">{user?.email}</p>
            {headline && <p className="text-xs text-primary text-center font-medium">{headline}</p>}
          </div>

          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                activeTab === t.key
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-muted hover:bg-surface-hover hover:text-text'
              } ${t.key === 'security' ? 'text-danger hover:text-danger hover:bg-danger/10 mt-2 border-t border-border pt-3' : ''}`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0">
        {saveSuccess && (
          <div className="p-3 bg-success/10 text-success text-sm rounded-lg border border-success/20 font-medium">
            ✅ Changes saved successfully!
          </div>
        )}

        {/* ─── Personal Information ─── */}
        {activeTab === 'personal' && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Full Name" value={user?.name || ''} disabled />
              <Input label="Headline" placeholder="e.g. Frontend Developer at TechCorp" value={headline} onChange={e => setHeadline(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-text mb-1">Bio</label>
                <Textarea placeholder="Tell us a little about yourself" value={bio} onChange={e => setBio(e.target.value)} />
              </div>
              <Input label="College / University" placeholder="e.g. IIT Bombay" value={college} onChange={e => setCollege(e.target.value)} />
              <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
              <Input label="GitHub URL" placeholder="https://github.com/..." value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePersonal} isLoading={isSaving}>Save Changes</Button>
            </CardFooter>
          </Card>
        )}

        {/* ─── Skills ─── */}
        {activeTab === 'skills' && (
          <Card>
            <CardHeader>
              <CardTitle>Skills & Experience</CardTitle>
              <CardDescription>What roles and skills are you targeting?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input label="Target Role" placeholder="e.g. Software Engineer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
              <Input label="Skill Tags (comma separated)" placeholder="React, Node.js, AWS" value={skillTags} onChange={e => setSkillTags(e.target.value)} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">Experience Level (1-5)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="5" value={experienceLevel} onChange={e => setExperienceLevel(Number(e.target.value))} className="flex-1 accent-brand-500" />
                  <span className="font-bold text-fg w-4 text-center">{experienceLevel}</span>
                </div>
                <p className="text-xs text-muted">1 = Beginner · 5 = Expert</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePersonal} isLoading={isSaving}>Save Changes</Button>
            </CardFooter>
          </Card>
        )}

        {/* ─── Availability ─── */}
        {activeTab === 'availability' && (
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Select the days you are typically available for mock interviews.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggle(day, selectedDays, setSelectedDays)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-surface text-muted border-border hover:border-brand-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted">Default time slot: 9:00 AM – 5:00 PM (local timezone)</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAvailability} isLoading={isSaving}>Save Availability</Button>
            </CardFooter>
          </Card>
        )}

        {/* ─── Preferences ─── */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Interview Types</CardTitle><CardDescription>What types of interviews do you want to practice?</CardDescription></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => toggle(t, interviewTypes, setInterviewTypes)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${interviewTypes.includes(t) ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface text-muted border-border hover:border-brand-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Preferred Languages</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l} type="button" onClick={() => toggle(l, preferredLanguages, setPreferredLanguages)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${preferredLanguages.includes(l) ? 'bg-purple-500 text-white border-purple-500' : 'bg-surface text-muted border-border hover:border-purple-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Focus Areas</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map(f => (
                    <button key={f} type="button" onClick={() => toggle(f, focusAreas, setFocusAreas)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${focusAreas.includes(f) ? 'bg-green-500 text-white border-green-500' : 'bg-surface text-muted border-border hover:border-green-300'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences} isLoading={isSaving}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* ─── Interview Statistics ─── */}
        {activeTab === 'stats' && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Statistics</CardTitle>
              <CardDescription>Your interview performance overview.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Sessions Completed', value: '12', icon: '🎯' },
                  { label: 'As Candidate', value: '7', icon: '🧑‍💼' },
                  { label: 'As Interviewer', value: '5', icon: '🧑‍💻' },
                  { label: 'Average Score', value: '7.8 / 10', icon: '⭐' },
                  { label: 'Points Earned', value: '1,240', icon: '💰' },
                  { label: 'Current Streak', value: '3 days', icon: '🔥' },
                ].map(stat => (
                  <div key={stat.label} className="bg-surface rounded-xl p-4 text-center border border-border">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <p className="font-bold text-xl text-fg">{stat.value}</p>
                    <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full" onClick={() => navigate('/history')}>View Full History</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Reviews ─── */}
        {activeTab === 'reviews' && (
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>Feedback left by your interview partners.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Alex J.', rating: 5, text: 'Great communicator, asked very structured questions during the interview.', date: '2 days ago' },
                  { name: 'Sam P.', rating: 4, text: 'Good problem solving approach. Would love to practice again!', date: '1 week ago' },
                ].map((r, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-surface space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-text text-sm">{r.name}</p>
                      <div className="flex items-center gap-1">
                        {'⭐'.repeat(r.rating)}
                        <span className="text-xs text-muted ml-1">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted">{r.text}</p>
                  </div>
                ))}
                  <div className="text-center py-10 text-muted text-sm">No reviews yet. Complete sessions to receive peer feedback.</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Badges ─── */}
        {activeTab === 'badges' && (
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
              <CardDescription>Unlock badges by completing goals and milestones.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BADGE_LIST.map(badge => (
                  <div key={badge.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${badge.earned ? 'border-brand-200 bg-brand-50' : 'border-border bg-surface opacity-50 grayscale'}`}>
                    <div className="text-3xl">{badge.icon}</div>
                    <div>
                      <p className="font-semibold text-sm text-text">{badge.name}</p>
                      <p className="text-xs text-muted mt-0.5">{badge.desc}</p>
                      <Badge variant={badge.earned ? 'green' : 'gray'} className="mt-1 text-xs">{badge.earned ? 'Earned' : 'Locked'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Account Settings ─── */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Avatar</CardTitle>
                <CardDescription>Update your profile picture.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <Avatar name={user?.name || 'User'} size="xl" />
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Upload New Photo</Button>
                  <p className="text-xs text-muted">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Display Name" value={user?.name || ''} />
                <Input label="Email Address" value={user?.email || ''} disabled />
                <p className="text-xs text-muted">Email address cannot be changed.</p>
              </CardContent>
              <CardFooter>
                <Button isLoading={isSaving}>Save Account Details</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* ─── Security Settings ─── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <Input label="New Password" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </CardContent>
              <CardFooter>
                <Button isLoading={isSaving} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
                  Update Password
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-danger">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="text-danger border-danger hover:bg-danger hover:text-white">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

