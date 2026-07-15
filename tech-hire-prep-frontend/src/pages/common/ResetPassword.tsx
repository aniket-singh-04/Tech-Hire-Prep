import React, { useState } from "react";
import { authApi } from "../../services/backendApi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/notifications";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !userId) {
      pushToast({ title: "Reset password failed", description: "Invalid or missing reset token or user id.", variant: "error" });
      return;
    }

    if (password !== confirmPassword) {
      pushToast({ title: "Reset password failed", description: "Passwords do not match.", variant: "error" });
      return;
    }

    if (password.length < 8) {
      pushToast({ title: "Reset password failed", description: "Password must be at least 8 characters long.", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ userId, token, password });
      navigate("/login?reset=success");
      pushToast({ title: "Success", description: "Login successful.", variant: "success" });
    } catch (err) {
      pushToast({ title: "Reset password failed", description: getErrorMessage(err, "Failed to register"), variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-fg">Create New Password</CardTitle>
          <CardDescription className="text-muted">Please enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="New Password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Confirm New Password" type="password" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <div className="space-y-4">
              <Button type="submit" className="w-full" isLoading={loading}>Reset Password</Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-brand-600 font-medium hover:underline">Cancel and return to Login</Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
