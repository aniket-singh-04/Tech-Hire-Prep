import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { FiUser, FiClock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-fg tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-brand-600">Tech-Hire-Prep</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-sm font-medium text-muted hover:text-fg transition-colors">About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted hover:text-fg transition-colors">How it Works</Link>
            <Link to="/pricing" className="text-sm font-medium text-muted hover:text-fg transition-colors">Pricing</Link>
            <Link to="/faq" className="text-sm font-medium text-muted hover:text-fg transition-colors">FAQ</Link>
          </nav>

          <div>
            <ThemeToggle />
          </div>

          <div className="flex items-center space-x-4">
            {/* Show profile/history when authenticated, otherwise login/register */}
            {(() => {
              try {
                // useAuth may throw if not available; guard defensively
                const { user } = useAuth();
                if (user) {
                  return (
                    <div className="flex items-center gap-3">
                      <Link to="/history" className="p-2 rounded-md hover:bg-surface-hover text-muted flex items-center gap-2">
                        <FiClock size={18} />
                        <span className="hidden sm:inline text-sm">History</span>
                      </Link>
                      <Link to="/profile" className="p-2 rounded-md hover:bg-surface-hover text-muted flex items-center gap-2">
                        <FiUser size={18} />
                        <span className="hidden sm:inline text-sm">Profile</span>
                      </Link>
                    </div>
                  );
                }
              } catch (e) {
                // fall back to guest view
              }

              return (
                <>
                  <Link to="/login" className="text-sm font-medium text-muted hover:text-fg transition-colors hidden sm:block">Log in</Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      <FiLogIn className="mr-2" />
                      Get Started
                    </Button>
                  </Link>
                </>
              );
            })()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold text-fg tracking-tight">
              <span className="text-brand-600">Tech-Hire-Prep</span>
            </Link>
            <p className="text-sm text-muted">
              Ace your tech interviews with real practice. Land your dream job with confidence.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-fg mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/about" className="hover:text-fg transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-fg transition-colors">How it Works</Link></li>
              <li><Link to="/pricing" className="hover:text-fg transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-fg mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/faq" className="hover:text-fg transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-fg transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-fg mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/privacy" className="hover:text-fg transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-fg transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-fg transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} Tech-Hire-Prep Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
