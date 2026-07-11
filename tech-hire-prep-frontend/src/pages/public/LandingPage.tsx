import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PublicLayout } from '../../components/layout/PublicLayout';

const LandingPage: React.FC = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative p-2 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-brand-50 to-blue-50/50 -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-5xl font-extrabold text-fg tracking-tight leading-tight">
            Master the technical interview. <span className="hidden md:block"></span>
            <span className="text-brand-600">Without the anxiety.</span>
          </h1>
          <p className="text-xl md:text-xl text-muted max-w-2xl mx-auto">
            Get paired with peers, receive actionable feedback, and practice with AI. Land your dream job with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg shadow-brand-500/20 hover:scale-105 transition-transform">
                Start Practicing Free
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full hover:bg-surface-hover transition-colors">
                How it works
              </Button>
            </Link>
          </div>
          <div className="pt-8 text-sm text-muted flex items-center justify-center gap-6 opacity-80">
            <span>✓ No credit card required</span>
            <span className="hidden sm:inline">✓ 2 free mocks</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-8">Trusted by students from</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale">
            <span className="text-2xl font-bold">IIT Delhi</span>
            <span className="text-2xl font-bold">BITS Pilani</span>
            <span className="text-2xl font-bold">NIT Trichy</span>
            <span className="text-2xl font-bold">Stanford</span>
            <span className="text-2xl font-bold">MIT</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-fg">Everything you need to succeed</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">Stop reading interview books. Start speaking code.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Live Peer Matches", desc: "Get paired instantly with someone at your level. Take turns being the interviewer.", icon: "🤝" },
              { title: "AI Transcripts & Feedback", desc: "Our AI listens to your session and grades you on communication, depth, and clarity.", icon: "🤖" },
              { title: "Shared Code Editor", desc: "Collaborate in real-time in an IDE environment that mimics real technical rounds.", icon: "💻" }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-surface border border-border hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold text-fg mb-3">{f.title}</h3>
                <p className="text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-fg text-bg text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to ace your next interview?</h2>
          <p className="text-xl text-gray-400">Join thousands of students landing offers at top tech companies.</p>
          <Link to="/register" className="inline-block pt-4">
            <Button size="lg" className="bg-brand-500 hover:bg-brand-400 text-white border-none text-lg px-10 py-6 rounded-full transition-transform hover:scale-105">
              Create your free account
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
