import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { authApi } from "../../services/backendApi";
import { ApiError } from "../../utils/api";

const VerifyEmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    try {
      const payload: any = await authApi.requestEmailVerification();
      setMessage(payload?.message || "Verification email sent.");
      setSuccess(true);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Failed to send verification email.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader className="space-y-4">
          <CardTitle className="text-2xl font-bold text-fg">Verify your email</CardTitle>
          <CardDescription className="text-muted">
            If you are signed in, we can send a new verification email. Open the link from your inbox to finish verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {message && <div className={`p-3 text-sm rounded-md border ${success ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>{message}</div>}
          <div className="space-y-4">
            <Button className="w-full" onClick={handleResend} isLoading={loading}>
              Resend Verification Email
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
