import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { onboardingApi } from '../../../services/userApi';
import { useAuth } from '../../../context/AuthContext';
import { ApiError } from '../../../utils/api';

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0: Welcome, 1: Role, 2: Skills, 3: Availability, 4: Verification/Complete
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear().toString());
  const [skillTags, setSkillTags] = useState('React, Node.js');
  const [experienceLevel, setExperienceLevel] = useState('1');
  const [availability, setAvailability] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Check onboarding status
    onboardingApi.getStatus().then((status) => {
      if (status.completed) {
        navigate('/dashboard');
      } else {
        setStep(status.step || 0); // Start at 0 if no step
        setIsLoading(false);
      }
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [navigate]);

  const toggleAvailability = (day: string) => {
    setAvailability(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleNext = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (step === 0) {
        setStep(1);
      } else if (step === 1) {
        await onboardingApi.submitStep1({
          targetRole,
          college: college || undefined,
          graduationYear: college ? parseInt(graduationYear, 10) : undefined,
        });
        setStep(2);
      } else if (step === 2) {
        await onboardingApi.submitStep2({
          skillTags: skillTags.split(',').map(s => s.trim()).filter(Boolean),
          experienceLevel: parseInt(experienceLevel, 10),
        });
        setStep(3);
      } else if (step === 3) {
        await onboardingApi.submitStep3({
          availability: availability.map(day => ({
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00"
          })),
        });
        setStep(4);
      } else if (step === 4) {
        if (!verified) {
          setError("Please verify your profile information before completing.");
          setIsLoading(false);
          return;
        }
        await onboardingApi.complete();
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to save step.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-bg">Loading...</div>;
  }

  const stepTitles = [
    "Welcome",
    "What role are you aiming for?",
    "Skills & Experience",
    "Availability Selection",
    "Profile Verification"
  ];

  const stepDescriptions = [
    "Let's get your profile set up.",
    "Let's personalize your interview practice.",
    "Tell us about your background.",
    "When are you usually free for interviews?",
    "Review your information before finishing."
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center border-b border-border pb-6">
          <CardTitle className="text-2xl font-bold text-fg">
            {stepTitles[step]}
          </CardTitle>
          <CardDescription className="text-muted">
            {stepDescriptions[step]}
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-surface-hover h-2 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-brand-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {error && <div className="p-3 bg-danger/10 text-danger text-sm rounded-md border border-danger/20 text-center font-medium">{error}</div>}
          
          {step === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-6">
                👋
              </div>
              <h3 className="text-xl font-bold text-fg">Welcome, {user?.name}!</h3>
              <p className="text-muted">
                We're excited to have you on Tech-Hire-Prep. Let's take a couple of minutes to configure your account so we can find the perfect interview partners for you.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <Input label="Target Role" placeholder="e.g. Frontend Engineer, Product Manager" value={targetRole} onChange={e => setTargetRole(e.target.value)} required />
              <Input label="College/University (Optional)" placeholder="e.g. Stanford University" value={college} onChange={e => setCollege(e.target.value)} />
              {college && (
                <Input label="Graduation Year" type="number" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} />
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <Input label="Skill Tags (comma separated)" placeholder="React, Python, Algorithms" value={skillTags} onChange={e => setSkillTags(e.target.value)} required />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">Experience Level (1-5)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="5" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="flex-1 accent-brand-500" />
                  <span className="font-bold text-fg w-4 text-center">{experienceLevel}</span>
                </div>
                <p className="text-xs text-muted">1 = Beginner, 5 = Expert</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <p className="text-sm font-medium text-text">Select days you're typically available:</p>
              <div className="flex flex-wrap gap-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAvailability(day)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                      availability.includes(day)
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-surface text-muted border-border hover:border-brand-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {availability.length === 0 && (
                <p className="text-xs text-warning">You can skip this for now, but it helps us match you better.</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-surface rounded-lg p-4 border border-border space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted">Name:</span> <span className="font-medium text-fg">{user?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted">Target Role:</span> <span className="font-medium text-fg">{targetRole}</span></div>
                <div className="flex justify-between"><span className="text-muted">Skills:</span> <span className="font-medium text-fg text-right max-w-[200px] truncate">{skillTags}</span></div>
                <div className="flex justify-between"><span className="text-muted">Availability:</span> <span className="font-medium text-fg">{availability.length > 0 ? `${availability.length} days selected` : 'None specified'}</span></div>
              </div>
              
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded-lg hover:bg-surface transition-colors">
                <input 
                  type="checkbox" 
                  checked={verified} 
                  onChange={(e) => setVerified(e.target.checked)}
                  className="mt-1 accent-brand-500 w-4 h-4"
                />
                <span className="text-sm text-text font-medium leading-tight">
                  I verify that the above information is correct and I am ready to complete my onboarding.
                </span>
              </label>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-6 border-t border-border bg-surface/30 rounded-b-xl">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isLoading}>
              Back
            </Button>
          ) : <div></div>}
          
          <Button onClick={handleNext} isLoading={isLoading}>
            {step === 4 ? "Complete Onboarding" : step === 0 ? "Get Started" : "Next Step"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
