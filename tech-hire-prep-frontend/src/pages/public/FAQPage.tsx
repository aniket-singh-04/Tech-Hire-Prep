import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';

const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: "What is Tech-Hire-Prep?",
      a: "Tech-Hire-Prep is a peer-to-peer mock interview platform. You get paired with other students or professionals to practice technical interviews in a live video environment with a shared code editor."
    },
    {
      q: "Is it really free?",
      a: "Yes! When you sign up, you receive 2 free mock interview credits. You can always earn more points (which act like credits) by being a great interviewer for others."
    },
    {
      q: "How does the AI Transcript work?",
      a: "Our system can optionally record the audio of your interview and use advanced LLMs to analyze your communication skills, technical depth, and problem-solving approach, giving you a detailed scorecard."
    },
    {
      q: "Who will I be matched with?",
      a: "Our algorithm matches you based on your target role, experience level, and preferred interview topics (like Data Structures, System Design, or Frontend)."
    }
  ];

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-fg text-center mb-12">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-lg font-bold text-fg mb-2">{faq.q}</h3>
              <p className="text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted mb-4">Still have questions?</p>
          <a href="/contact" className="text-brand-600 font-semibold hover:underline">Contact Support</a>
        </div>
      </div>
    </PublicLayout>
  );
};

export default FAQPage;
