import VerificationSuccess from "../pages/common/VerificationSuccess";
import { SessionDetail } from "../features/sessions/SessionDetail";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RefundPolicyPage from "../pages/public/RefundPolicyPage";
import UserProfile from "../features/profile/pages/UserProfile";
import { Matchmaking } from "../features/sessions/Matchmaking";
import HowItWorksPage from "../pages/public/HowItWorksPage";
import ForgotPassword from "../pages/common/ForgotPassword";
import SessionExpired from "../pages/common/SessionExpired";
import ResetPassword from "../pages/common/ResetPassword";
import { Sessions, History } from "../features/sessions/Sessions";
import LandingPage from "../pages/public/LandingPage";
import PricingPage from "../pages/public/PricingPage";
import ContactPage from "../pages/public/ContactPage";
import VerifyEmail from "../pages/common/VerifyEmail";
import VerifyOtp from "../pages/common/VerifyOtp";
import NotFound from "../pages/not-found/NotFound";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/common/Dashboard";
import AboutPage from "../pages/public/AboutPage";
import TermsPage from "../pages/public/TermsPage";
import Register from "../pages/common/Register";
import FAQPage from "../pages/public/FAQPage";
import Login from "../pages/common/Login";
import { type ReactNode } from "react";
import { InterviewRoom } from "../pages/interview/InterviewRoom";
import { AppLayout } from "../components/layout/AppLayout";
import { Spinner } from "../components/ui/Spinner";

const LoadingState = () => (
  <div className="state-shell bg-app">
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <Spinner size="lg" />
      <p className="text-muted font-medium text-sm">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const ProtectedRoomRoute = ({ children }: { children: ReactNode }) => {
  // Same as ProtectedRoute, but doesn't wrap in AppLayout (for full screen InterviewRoom)
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <GuestRoute>
        <LandingPage />
      </GuestRoute>
    ),
  },
  { path: "/about", element: <AboutPage /> },
  { path: "/how-it-works", element: <HowItWorksPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/faq", element: <FAQPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/privacy", element: <PrivacyPolicyPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/refund", element: <RefundPolicyPage /> },
  { path: "/verify-email", element: <VerifyEmail /> },
  { path: "/verification-success", element: <VerificationSuccess /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <ForgotPassword />
      </GuestRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <GuestRoute>
        <ResetPassword />
      </GuestRoute>
    ),
  },
  { path: "/session-expired", element: <SessionExpired /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: "/match",
    element: (
      <ProtectedRoute>
        <Matchmaking />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sessions",
    element: (
      <ProtectedRoute>
        <Sessions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sessions/:sessionId",
    element: (
      <ProtectedRoute>
        <SessionDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/room/:sessionId",
    element: (
      <ProtectedRoomRoute>
        <InterviewRoom />
      </ProtectedRoomRoute>
    ),
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);
