import React, { useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const ContactPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-fg mb-4">Contact Us</h1>
        <p className="text-muted mb-8">
          Have a question or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you within 24 hours.
        </p>

        {success ? (
          <div className="p-6 bg-success/10 text-success rounded-xl border border-success/20 text-center">
            <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
            <p>Thank you for reaching out. We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="First Name" required />
              <Input label="Last Name" required />
            </div>
            <Input label="Email Address" type="email" required />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Message</label>
              <Textarea placeholder="How can we help you?" required rows={5} />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
