import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { sessionApi } from '../../services/sessionApi';

interface FeedbackFormProps {
  sessionId: string;
  onSuccess: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ sessionId, onSuccess }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.length < 10) {
      setError('Feedback must be at least 10 characters long.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await sessionApi.submitFeedback(sessionId, { feedback });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted mb-1">Your Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent-soft-strong min-h-[120px] resize-none"
          placeholder="Great communication and problem-solving skills..."
        />
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Submit Feedback
      </Button>
    </form>
  );
};
