import { FaBullseye, FaFire, FaStar, FaUserTie, FaCalendarCheck, FaLaptopCode, FaCoins, FaUser, FaTools, FaCalendarAlt, FaChartBar, FaMedal, FaWrench, FaLock, } from "react-icons/fa";
import { FiCalendar, FiClock, FiHome, FiMessageSquare, FiUser } from "react-icons/fi";
import type { IconType } from "react-icons/lib";

type Badge = {
  id: string;
  icon: IconType;
  name: string;
  color: string;
  desc: string;
  earned: boolean;
};

export const BADGE_LIST: Badge[] = [
  {
    id: "first_interview",
    icon: FaBullseye,
    color: "#6366f1",
    name: "First Interview",
    desc: "Completed your first mock interview",
    earned: true,
  },
  {
    id: "five_sessions",
    icon: FaFire,
    color: "#f97316",
    name: "On Fire",
    desc: "5 sessions completed",
    earned: true,
  },
  {
    id: "perfect_score",
    icon: FaStar,
    color: "#eab308",
    name: "Perfect Score",
    desc: "Received a 10/10 scorecard",
    earned: false,
  },
  {
    id: "top_interviewer",
    icon: FaUserTie,
    color: "#22c55e",
    name: "Top Interviewer",
    desc: "Highly rated as interviewer",
    earned: false,
  },
  {
    id: "consistency",
    icon: FaCalendarCheck,
    color: "#06b6d4",
    name: "Consistent",
    desc: "7-day streak",
    earned: false,
  },
];

export const STATS = [
  {
    label: "Sessions Completed",
    value: "12",
    icon: FaBullseye,
    color: "#6366f1",
  },
  { label: "As Candidate", value: "7", icon: FaUserTie, color: "#22c55e" },
  { label: "As Interviewer", value: "5", icon: FaLaptopCode, color: "#3b82f6" },
  { label: "Average Score", value: "7.8 / 10", icon: FaStar, color: "#eab308" },
  { label: "Points Earned", value: "1,240", icon: FaCoins, color: "#f59e0b" },
  { label: "Current Streak", value: "3 days", icon: FaFire, color: "#ef4444" },
];

export type Tab = 'personal' | 'skills' | 'availability' | 'preferences' | 'stats' | 'reviews' | 'badges' | 'account' | 'security';

export const tabs: { key: Tab; label: string; icon: IconType; color: string }[] = [
  { key: "personal", label: "Personal Info", icon: FaUser, color: "#6366f1" },
  { key: "skills", label: "Skills", icon: FaTools, color: "#f97316" },
  { key: "availability", label: "Availability", icon: FaCalendarAlt, color: "#22c55e" },
  // { key: "preferences", label: "Preferences", icon: FaCog, color: "#8b5cf6" },
  { key: "stats", label: "Statistics", icon: FaChartBar, color: "#0ea5e9" },
  { key: "reviews", label: "Reviews", icon: FaStar, color: "#eab308" },
  { key: "badges", label: "Badges", icon: FaMedal, color: "#ec4899" },
  { key: "account", label: "Account Settings", icon: FaWrench, color: "#64748b" },
  { key: "security", label: "Security", icon: FaLock, color: "#ef4444" },
];


export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: FiHome, color: "#3b82f6" },
  { path: "/match", label: "Practice", icon: FiMessageSquare, color: "#10b981" },
  { path: "/sessions", label: "Sessions", icon: FiCalendar, color: "#f59e0b" },
  { path: "/history", label: "History", icon: FiClock, color: "#8b5cf6" },
  { path: "/profile", label: "Profile", icon: FiUser, color: "#ef4444" },
];