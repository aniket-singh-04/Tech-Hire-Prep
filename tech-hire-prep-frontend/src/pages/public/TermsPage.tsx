import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';

const TermsPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 prose prose-slate">
        <h1 className="text-4xl font-bold text-fg mb-8">Terms of Service</h1>
        <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="mt-8 space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-fg mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Tech-Hire-Prep, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-fg mb-2">2. User Conduct</h2>
            <p>You agree to use the platform respectfully. Harassment, abuse, or inappropriate behavior during peer interviews will result in immediate termination of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-fg mb-2">3. Intellectual Property</h2>
            <p>The code editor and platform software are property of Tech-Hire-Prep. The code you write during practice sessions remains your property.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
};

export default TermsPage;
