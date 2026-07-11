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

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {/* Free */}
          <Card className="flex h-full flex-col rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-green-600">
                Starter
              </div>

              <CardTitle className="text-2xl font-bold">Free</CardTitle>

              <CardDescription className="text-sm">
                Great for exploring the platform.
              </CardDescription>

              <div className="pt-2">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">₹0</span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Forever Free
                </p>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {[
                  "2 Mock Interviews",
                  "Basic Peer Matching",
                  "Shared Code Editor",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-600">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}

                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs">
                    ✕
                  </span>
                  AI Transcript & Feedback
                </li>
              </ul>
            </CardContent>

            <CardFooter>
              <Button variant="outline" className="h-11 w-full rounded-xl">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* PRO */}
          <div className="lg:scale-105">
            <Card className="flex h-full flex-col rounded-2xl border-2 border-brand-500 bg-linear-to-b from-brand-500/5 to-background shadow-xl ring-1 ring-brand-500/20 transition-all duration-300  hover:-translate-y-1">
              <CardHeader className="space-y-2 text-center relative">
                <div className="mx-auto rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet-600">
                  ⭐ Most Popular
                </div>
                <CardTitle className="text-2xl font-bold">
                  Pro
                </CardTitle>

                <CardDescription className="text-sm">
                  Unlimited preparation for placements.
                </CardDescription>

                <div className="pt-2">
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-extrabold tracking-tight">
                      ₹99
                    </span>

                    <span className="mb-1 text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-brand-500">
                    Less than ₹4/day
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {[
                    "Unlimited Mock Interviews",
                    "AI Transcript & Detailed Feedback",
                    "Priority Matching",
                    "Premium Question Bank",
                    "Performance Analytics",
                    "Early Access to Features",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm font-medium"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-600">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button className="h-11 w-full rounded-xl text-base">
                  Upgrade to Pro
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Credits */}
          <Card className="flex h-full flex-col rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-rose-600">
                Flexible
              </div>

              <CardTitle className="text-2xl font-bold">
                Credits
              </CardTitle>

              <CardDescription className="text-sm">
                Pay only when you need interviews.
              </CardDescription>

              <div className="pt-2">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">
                    ₹49
                  </span>

                  <span className="mb-1 text-sm text-muted-foreground">
                    /pack
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {[
                  "5 Interview Credits",
                  "AI Feedback Included",
                  "Credits Never Expire",
                  "No Monthly Subscription",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-xs font-bold text-rose-600">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button variant="outline" className="h-11 w-full rounded-xl">
                Buy Credits
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PricingPage;
