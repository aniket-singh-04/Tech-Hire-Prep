import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { authApi } from "../../services/backendApi";
import { ApiError } from "../../utils/api";

const VerificationSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(userId && token ? "loading" : "error");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirm = async () => {
      if (!userId || !token) return;
      try {
        const payload: any = await authApi.confirmEmailVerification({ userId, token });
        setMessage(payload?.message || "Email verified successfully.");
        setStatus("success");
      } catch (err) {
        setMessage(err instanceof ApiError ? err.message : "The verification link is invalid or has expired.");
        setStatus("error");
      }
    };
    void confirm();
  }, [token, userId]);

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
              <CardTitle className="text-2xl font-bold text-fg">Email Verified</CardTitle>
              <CardDescription className="text-muted">{message || "Your email address has been successfully verified."}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Link to="/dashboard"><Button className="w-full" size="lg">Go to dashboard</Button></Link>
            </CardContent>
          </>
        )}
        {status === "error" && (
          <>
            <CardHeader className="space-y-4">
              <CardTitle className="text-2xl font-bold text-fg">Verification Failed</CardTitle>
              <CardDescription className="text-muted">{message || "The verification link is invalid or has expired."}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Link to="/verify-email"><Button className="w-full" variant="outline">Request New Link</Button></Link>
              <Link to="/login" className="block text-sm text-brand-600 font-medium hover:underline">Back to Login</Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerificationSuccess;
