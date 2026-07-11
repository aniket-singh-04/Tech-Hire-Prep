import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

const SessionExpired: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center text-warning mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-fg">Session Expired</CardTitle>
          <CardDescription className="text-muted">
            For your security, your session has timed out due to inactivity or token expiration. Please log in again to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Link to="/login">
            <Button className="w-full" size="lg">Log In Again</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionExpired;
