import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

const VerifyEmail: React.FC = () => {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = () => {
    setResending(true);
    // Mock API call to resend verification email
    setTimeout(() => {
      setResending(false);
      setResendSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-fg">Check your email</CardTitle>
          <CardDescription className="text-muted">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {resendSuccess && (
            <div className="p-3 bg-success/10 text-success text-sm rounded-md border border-success/20">
              Verification email resent successfully!
            </div>
          )}
          <div className="space-y-4">
            <Button 
              className="w-full" 
              onClick={handleResend} 
              isLoading={resending}
              disabled={resendSuccess}
            >
              {resendSuccess ? "Email Sent" : "Resend Verification Email"}
            </Button>
            <Link to="/login" className="block text-sm text-brand-600 font-medium hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
