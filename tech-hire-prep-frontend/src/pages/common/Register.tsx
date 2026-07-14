import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../services/backendApi';
import { ApiError } from '../../utils/api';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = await authApi.register({ name, email, password });
      navigate(`/verify-otp?mode=register&challengeId=${encodeURIComponent(payload?.challengeId ?? "")}&email=${encodeURIComponent(payload?.maskedEmail ?? email)}`);
      toast.success("Registration successful. Please verify OTP.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="auth-card">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input label="Full Name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="✱✱✱✱✱✱✱✱" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>Sign Up</Button>
            <div className="text-center text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
