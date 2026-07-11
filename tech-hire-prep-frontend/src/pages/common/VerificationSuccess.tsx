import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";

const VerificationSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");

  useEffect(() => {
    // Mock API verification call
    if (!token) return;

    const timer = setTimeout(() => {
      // Simulate success
      setStatus("success");
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl text-center">
        {status === "loading" && (
          <CardContent className="py-12 flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted font-medium">Verifying your email...</p>
          </CardContent>
        )}

        {status === "success" && (
          <>
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-fg">Email Verified!</CardTitle>
              <CardDescription className="text-muted">
                Your email address has been successfully verified. You can now access all features.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Link to="/login">
                <Button className="w-full" size="lg">Continue to Login</Button>
              </Link>
            </CardContent>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center text-danger mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-fg">Verification Failed</CardTitle>
              <CardDescription className="text-muted">
                The verification link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Link to="/verify-email">
                <Button className="w-full" variant="outline">Request New Link</Button>
              </Link>
              <Link to="/login" className="block text-sm text-brand-600 font-medium hover:underline">
                Back to Login
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerificationSuccess;
