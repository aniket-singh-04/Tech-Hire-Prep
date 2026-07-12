import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authApi } from "../../services/backendApi";
import { ApiError } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const VerifyOtp: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const mode = params.get("mode") === "register" ? "register" : "login";
  const challengeId = params.get("challengeId") ?? "";
  const email = params.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    if (!challengeId) {
      setError("Missing verification challenge. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = mode === "register"
        ? await authApi.verifyRegisterOtp({ challengeId, otp })
        : await authApi.verifyLoginOtp({ challengeId, otp });
      if (!payload?.accessToken || !payload?.user) {
        throw new Error("Verification succeeded but the session payload was missing.");
      }
      login(payload.accessToken, payload.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Verify your code</CardTitle>
          <CardDescription>
            Enter the OTP sent to {email || "your email address"} to finish {mode === "register" ? "registration" : "sign in"}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-md border border-danger/20 bg-danger-soft p-3 text-center text-sm font-medium text-danger">{error}</div>}
            <Input label="One-time password" inputMode="numeric" maxLength={6} placeholder="123456" required value={otp} onChange={(e) => setOtp(e.target.value)} />
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>Verify and continue</Button>
            <Link to={mode === "register" ? "/register" : "/login"} className="text-sm font-medium text-accent hover:underline">Start over</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VerifyOtp;
