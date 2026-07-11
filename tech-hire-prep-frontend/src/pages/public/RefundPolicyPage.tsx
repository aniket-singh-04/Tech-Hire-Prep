import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';

const RefundPolicyPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 prose prose-slate">
        <h1 className="text-4xl font-bold text-fg mb-8">Refund Policy</h1>
        <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="mt-8 space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-fg mb-2">Subscription Refunds</h2>
            <p>We offer a 7-day money-back guarantee for your first subscription charge. If you are not satisfied with the Premium tier, contact support within 7 days of your initial purchase for a full refund.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-fg mb-2">Pay-as-you-go Credits</h2>
            <p>Purchased credits are non-refundable but they never expire. You can use them at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-fg mb-2">No-shows</h2>
            <p>If you use a premium credit to book an interview and the other party does not show up, your credit will be automatically refunded to your account.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
};

export default RefundPolicyPage;
