import React, { useState } from "react";
import { authApi } from "../../services/backendApi";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/notifications";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { pushToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const payload: any = await authApi.forgotPassword({ email });
      setSuccess(true);
      pushToast({ title: "Success", description: "Reset link sent successfully!", variant: "success" });
      setEmail(payload?.maskedEmail ?? email);
    } catch (err) {
      setSuccess(false);
      pushToast({ title: "Reset link failed", description: getErrorMessage(err, "Failed to send reset link"), variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-fg">Reset Password</CardTitle>
          <CardDescription className="text-muted">Enter your email address and we'll send you a link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-success/10 text-success rounded-md border border-success/20">
                A password reset link has been sent to <strong>{email}</strong>
              </div>
              <Link to="/login"><Button className="w-full">Return to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="space-y-4">
                <Button type="submit" className="w-full" isLoading={loading}>Send Reset Link</Button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-brand-600 font-medium hover:underline">Back to Login</Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
