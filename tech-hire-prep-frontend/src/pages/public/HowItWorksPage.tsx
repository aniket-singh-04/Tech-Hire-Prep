import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Card, CardContent } from '../../components/ui/Card';

const HowItWorksPage: React.FC = () => {
  const steps = [
    { num: '01', title: 'Create your profile', desc: 'Sign up and tell us your target role, skills, and availability. This helps us match you accurately.' },
    { num: '02', title: 'Get matched instantly', desc: 'Our algorithm finds a peer at your skill level. You can also schedule interviews for later.' },
    { num: '03', title: 'Join the live room', desc: 'Jump into a video call with a shared collaborative code editor that mimics real interviews.' },
    { num: '04', title: 'Exchange feedback', desc: 'Take turns being the interviewer and the candidate. Submit structured feedback using our rubrics.' },
    { num: '05', title: 'Earn points & improve', desc: 'Earn points for providing quality feedback. Review your AI transcript to see where you can improve.' },
  ];

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-fg mb-6">How it Works</h1>
          <p className="text-xl text-muted">A simple, effective loop to get you job-ready.</p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
          {steps.map((step, i) => (
            <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-surface text-brand-500 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {step.num}
              </div>
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                <CardContent className="p-2 space-y-2">
                  <h3 className="font-bold text-lg text-fg">{step.title}</h3>
                  <p className="text-muted text-sm">{step.desc}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default HowItWorksPage;
