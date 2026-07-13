import { TargetRole, ExperienceLevel, WeekDay } from "../../types";
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { profileApi } from "../../services/backendApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Avatar } from "../../components/ui/Avatar";
import { Spinner } from "../../components/ui/Spinner";
import { Badge } from "../../components/ui/Badge";
import type { IAvailabilitySlot, ISocialLinks, Profile } from "../../types";
import { Select } from "../../components/ui/Select";
import { BADGE_LIST, STATS, type Tab } from "../../constants/icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

const DAYS = Object.values(WeekDay);
const ROLES = Object.values(TargetRole);
// const LANGUAGES = Object.values(PreferredLanguage);
const EXPERIENCE_LEVELS = Object.values(ExperienceLevel);
// const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'System Design', 'Product Sense', 'Data Structures'];
// const FOCUS_AREAS = ['Algorithms', 'System Design', 'Frontend', 'Backend', 'Machine Learning', 'DevOps'];

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams,] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "personal",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Form states
  const [name, setName] = useState(user?.name);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [targetRole, setTargetRole] = useState<TargetRole>(TargetRole.OTHER);
  const [skillTags, setSkillTags] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    ExperienceLevel.BEGINNER,
  );
  const [socialLinks, setSocialLinks] = useState<ISocialLinks>({});
  const [college, setCollege] = useState("");
  const [selectedDays, setSelectedDays] = useState<IAvailabilitySlot[]>([]);
  // const [interviewTypes, setInterviewTypes] = useState<string[]>([]);
  // const [preferredLanguages, setPreferredLanguages] = useState<string[]>([]);
  // const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getMe();
        console.log(data);
        const profileData = data as unknown as Profile;
        setHeadline(profileData.headline || "");
        setBio(profileData.bio || "");
        setTargetRole(profileData.targetRole || TargetRole.FRONTEND);
        setSkillTags(profileData.skills?.join(", ") || "");
        setExperienceLevel(
          profileData.experienceLevel || ExperienceLevel.BEGINNER,
        );
        setCollege(profileData.college || "");
        setSelectedDays(profileData.availability || []);
        setSocialLinks(profileData.socialLinks || {});
      } catch (err) {
        console.error("Failed to load profile", err);
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
      await profileApi.updateMe({
        headline,
        bio,
        targetRole,
        college,
        skills: skillTags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experienceLevel,
        socialLinks,
      });
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
      await profileApi.updateAvailability(selectedDays);
      showSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialChange = (field: keyof ISocialLinks, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // const handleSavePreferences = async () => {
  //   setIsSaving(true);
  //   try {
  //     // API endpoint for preferences is not defined in backend schema
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     showSuccess();
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // const toggle = (val: string, list: string[], setter: (v: string[]) => void) => {
  //   setter(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  // };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0">
        {saveSuccess && (
          <div className="p-3 bg-success/10 text-success text-sm rounded-lg border border-success/20 font-medium">
            ✅ Changes saved successfully!
          </div>
        )}

        {/* ─── Personal Information ─── */}
        {activeTab === "personal" && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your photo and personal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Full Name" value={user?.name || ""} disabled />
              <Input
                label="Headline"
                placeholder="e.g. Frontend Developer at TechCorp"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Bio
                </label>
                <Textarea
                  placeholder="Tell us a little about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/..."
                value={socialLinks.linkedin || ""}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
              />

              <Input
                label="Github URL"
                placeholder="https://github.com/..."
                value={socialLinks.github || ""}
                onChange={(e) => handleSocialChange("github", e.target.value)}
              />

              <Input
                label="Portfolio URL"
                placeholder="https://yourportfolio.com"
                value={socialLinks.portfolio || ""}
                onChange={(e) =>
                  handleSocialChange("portfolio", e.target.value)
                }
              />

              <Input
                label="Leetcode URL"
                placeholder="https://leetcode.com/..."
                value={socialLinks.leetcode || ""}
                onChange={(e) => handleSocialChange("leetcode", e.target.value)}
              />

              <Input
                label="Codeforces URL"
                placeholder="https://codeforces.com/..."
                value={socialLinks.codeforces || ""}
                onChange={(e) =>
                  handleSocialChange("codeforces", e.target.value)
                }
              />

              <Input
                label="Codechef URL"
                placeholder="https://codechef.com/..."
                value={socialLinks.codechef || ""}
                onChange={(e) => handleSocialChange("codechef", e.target.value)}
              />

              <Input
                label="GFG URL"
                placeholder="https://geeksforgeeks.org/..."
                value={socialLinks.geeksforgeeks || ""}
                onChange={(e) =>
                  handleSocialChange("geeksforgeeks", e.target.value)
                }
              />

              <Input
                label="HackerEarth URL"
                placeholder="https://hackerearth.com/..."
                value={socialLinks.hackerEarth || ""}
                onChange={(e) =>
                  handleSocialChange("hackerEarth", e.target.value)
                }
              />

              <Input
                label="HackerRank URL"
                placeholder="https://hackerrank.com/..."
                value={socialLinks.hackerRank || ""}
                onChange={(e) =>
                  handleSocialChange("hackerRank", e.target.value)
                }
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePersonal} isLoading={isSaving}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ─── Skills ─── */}
        {activeTab === "skills" && (
          <Card>
            <CardHeader>
              <CardTitle>Skills & Experience</CardTitle>
              <CardDescription>
                What roles and skills are you targeting?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Target Role"
                options={ROLES.map((r) => ({ label: r, value: r }))}
                value={targetRole}
                onChange={setTargetRole}
              />
              <Input
                label="Skill Tags (comma separated)"
                placeholder="React, Node.js, AWS"
                value={skillTags}
                onChange={(e) => setSkillTags(e.target.value)}
              />
              <Select
                label="Experience Level"
                options={EXPERIENCE_LEVELS.map((r) => ({ label: r, value: r }))}
                value={experienceLevel}
                onChange={setExperienceLevel}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePersonal} isLoading={isSaving}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ─── Availability ─── */}
        {activeTab === "availability" && (
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>
                Select the days you are typically available for mock interviews.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (selectedDays.some((s) => s.day === day)) {
                        setSelectedDays(
                          selectedDays.filter((s) => s.day !== day),
                        );
                      } else {
                        setSelectedDays([
                          ...selectedDays,
                          { day, startTime: "09:00", endTime: "17:00" },
                        ]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                      selectedDays.some((s) => s.day === day)
                        ? "bg-accent text-white border-accent"
                        : "bg-surface text-primary border-border hover:border-accent hover:bg-surface-hover"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted">
                Default time slot: 9:00 AM – 5:00 PM (local timezone)
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAvailability} isLoading={isSaving}>
                Save Availability
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ─── Preferences ─── */}
        {/* {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Interview Types</CardTitle><CardDescription>What types of interviews do you want to practice?</CardDescription></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => toggle(t, interviewTypes, setInterviewTypes)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${interviewTypes.includes(t) ? 'bg-accent text-white border-accent' : 'bg-surface text-primary border-border hover:border-accent hover:bg-surface-hover'}`}>
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
        )} */}

        {/* ─── Interview Statistics ─── */}
        {activeTab === "stats" && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Statistics</CardTitle>
              <CardDescription>
                Your interview performance overview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {STATS.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="bg-surface rounded-xl p-4 text-center border border-border"
                    >
                      <div className="flex justify-center mb-2">
                        <Icon size={28} color={stat.color} />
                      </div>

                      <p className="font-bold text-xl text-fg">{stat.value}</p>
                      <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/history")}
                >
                  View Full History
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Reviews ─── */}
        {activeTab === "reviews" && (
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                Feedback left by your interview partners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Alex J.",
                    rating: 5,
                    text: "Great communicator, asked very structured questions during the interview.",
                    date: "2 days ago",
                  },
                  {
                    name: "Sam P.",
                    rating: 4,
                    text: "Good problem solving approach. Would love to practice again!",
                    date: "1 week ago",
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-border bg-surface space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-text text-sm">
                        {r.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {"⭐".repeat(r.rating)}
                        <span className="text-xs text-muted ml-1">
                          {r.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted">{r.text}</p>
                  </div>
                ))}
                <div className="text-center py-10 text-muted text-sm">
                  No reviews yet. Complete sessions to receive peer feedback.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Badges ─── */}
        {activeTab === "badges" && (
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
              <CardDescription>
                Unlock badges by completing goals and milestones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BADGE_LIST.map((badge) => {
                  const Icon = badge.icon;

                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                        badge.earned
                          ? "border-brand-200 bg-brand-50"
                          : "border-border bg-surface opacity-50 grayscale"
                      }`}
                    >
                      <div className="text-3xl">
                        <Icon size={24} color={badge.color} />
                      </div>

                      <div>
                        <p className="font-semibold text-sm text-text">
                          {badge.name}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {badge.desc}
                        </p>

                        <Badge
                          variant={badge.earned ? "green" : "gray"}
                          className="mt-1 text-xs"
                        >
                          {badge.earned ? "Earned" : "Locked"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Account Settings ─── */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Avatar</CardTitle>
                <CardDescription>Update your profile picture.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <Avatar name={user?.name || "User"} size="xl" />
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Upload New Photo
                  </Button>
                  <p className="text-xs text-muted">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled
                />
                <Input
                  label="Email Address"
                  value={user?.email || ""}
                  disabled
                />
                <p className="text-xs text-muted">
                  Email address cannot be changed.
                </p>
                <p className="text-xs text-muted">
                  Currently name is also not be changable.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  isLoading={isSaving}
                  className="disabled:cursor-not-allowed disabled:opacity-50"
                  disabled
                >
                  Save Account Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* ─── Security Settings ─── */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button
                  isLoading={isSaving}
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    newPassword !== confirmPassword
                  }
                >
                  Update Password
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-danger">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="text-danger border-danger hover:bg-danger hover:text-white"
                >
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
