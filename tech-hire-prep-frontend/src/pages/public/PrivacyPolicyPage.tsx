import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-20 prose prose-slate">
        <h1 className="text-4xl font-bold text-fg mb-8">Privacy Policy</h1>
        <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="mt-8 space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-fg mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, use the interactive features of our services, or communicate with us.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-fg mb-2">2. Audio and Video Recordings</h2>
            <p>During mock interviews, audio and video data may be temporarily processed to generate AI transcripts and feedback. We do not store full video recordings unless explicitly requested and consented to by both parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-fg mb-2">3. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, as well as to match you with appropriate peers for practice sessions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-fg mb-2">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us via our Contact Page.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPolicyPage;
