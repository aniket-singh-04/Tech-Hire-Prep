import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { FiUser, FiClock, FiLogIn, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // HOOK FIX: call useAuth at the top level of the component
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (e) {
    // AuthContext might not be available in some guest renders
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-app text-primary transition-colors">
      {/* Header */}
      <header className="public-header px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-accent">Tech-Hire-Prep</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-sm font-medium text-muted hover:text-primary transition-colors">About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted hover:text-primary transition-colors">How it Works</Link>
            <Link to="/pricing" className="text-sm font-medium text-muted hover:text-primary transition-colors">Pricing</Link>
            <Link to="/faq" className="text-sm font-medium text-muted hover:text-primary transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <div className="hidden sm:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/history" className="p-2 rounded-md hover:bg-surface-hover text-muted flex items-center gap-2 transition-colors">
                    <FiClock size={18} />
                    <span className="text-sm font-medium">History</span>
                  </Link>
                  <Link to="/profile" className="p-2 rounded-md hover:bg-surface-hover text-muted flex items-center gap-2 transition-colors">
                    <FiUser size={18} />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="primary" size="sm">Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-muted hover:text-primary transition-colors">Log in</Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      <FiLogIn className="mr-2" />
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-muted hover:bg-surface-hover rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-strong border-b border-subtle absolute top-[73px] left-0 w-full z-30 shadow-md animate-fade-in">
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/about" className="text-sm font-medium text-primary py-2" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-primary py-2" onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
            <Link to="/pricing" className="text-sm font-medium text-primary py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/faq" className="text-sm font-medium text-primary py-2" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
            <div className="border-t border-subtle pt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Theme</span>
              <ThemeToggle />
            </div>
            <div className="border-t border-subtle pt-4 flex flex-col space-y-3">
               {user ? (
                 <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">Dashboard</Button>
                  </Link>
                 </>
               ) : (
                 <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">Get Started</Button>
                  </Link>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-subtle py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold tracking-tight">
              <span className="text-accent">Tech-Hire-Prep</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Ace your tech interviews with real practice. Land your dream job with confidence.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-primary mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-subtle text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} Tech-Hire-Prep Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
