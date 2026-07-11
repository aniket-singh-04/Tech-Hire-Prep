import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';

const AboutPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-fg mb-6">About Tech-Hire-Prep</h1>
        <p className="text-xl text-muted leading-relaxed mb-12">
          We believe everyone deserves a fair shot at their dream job. Our mission is to democratize technical interview preparation by making realistic mock interviews accessible to all students.
        </p>

        <div className="grid md:grid-cols-2 gap-12 text-left mt-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-fg">The Problem</h2>
            <p className="text-muted leading-relaxed">
              Traditional interview prep platforms are too expensive. Many Indian graduates face the pressure of placement season without ever having practiced in a high-stakes, timed coding environment.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-fg">Our Solution</h2>
            <p className="text-muted leading-relaxed">
              A peer-to-peer network combined with AI feedback. Practice with someone at your level, earn points for being a great interviewer, and get actionable transcripts from our AI grading system.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
