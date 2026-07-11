import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../../components/ui/Card';

const PricingPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-fg mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Get started for free. Upgrade when you need unlimited practice and advanced AI transcripts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="flex flex-col">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-fg">Free</CardTitle>
              <CardDescription>Perfect for trying out the platform</CardDescription>
            </CardHeader>
            <CardContent className="text-center flex-1">
              <div className="my-6">
                <span className="text-5xl font-extrabold text-fg">₹0</span>
              </div>
              <ul className="space-y-4 text-sm text-left text-muted mt-8">
                <li className="flex items-center gap-2"><span>✓</span> 2 Free Mock Interviews</li>
                <li className="flex items-center gap-2"><span>✓</span> Basic Peer Matching</li>
                <li className="flex items-center gap-2"><span>✓</span> Shared Code Editor</li>
                <li className="flex items-center gap-2 opacity-50"><span>✗</span> AI Transcripts</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">Sign Up Free</Button>
            </CardFooter>
          </Card>

          {/* Pro Tier */}
          <Card className="flex flex-col border-brand-500 shadow-xl shadow-brand-500/10 relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Most Popular
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-fg">Pro</CardTitle>
              <CardDescription>For serious placement prep</CardDescription>
            </CardHeader>
            <CardContent className="text-center flex-1">
              <div className="my-6">
                <span className="text-5xl font-extrabold text-fg">₹99</span>
                <span className="text-muted">/mo</span>
              </div>
              <ul className="space-y-4 text-sm text-left text-muted mt-8">
                <li className="flex items-center gap-2 font-medium text-fg"><span>✓</span> Unlimited Mock Interviews</li>
                <li className="flex items-center gap-2 font-medium text-fg"><span>✓</span> Full AI Transcripts & Grading</li>
                <li className="flex items-center gap-2"><span>✓</span> Priority Matching</li>
                <li className="flex items-center gap-2"><span>✓</span> Premium Questions Bank</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Subscribe Now</Button>
            </CardFooter>
          </Card>

          {/* Pay Per Use */}
          <Card className="flex flex-col">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-fg">Pay-as-you-go</CardTitle>
              <CardDescription>Buy credits when you need them</CardDescription>
            </CardHeader>
            <CardContent className="text-center flex-1">
              <div className="my-6">
                <span className="text-5xl font-extrabold text-fg">₹49</span>
                <span className="text-muted">/pack</span>
              </div>
              <ul className="space-y-4 text-sm text-left text-muted mt-8">
                <li className="flex items-center gap-2"><span>✓</span> 5 Mock Interview Credits</li>
                <li className="flex items-center gap-2"><span>✓</span> AI Feedback included</li>
                <li className="flex items-center gap-2"><span>✓</span> Credits never expire</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">Buy Credits</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PricingPage;
