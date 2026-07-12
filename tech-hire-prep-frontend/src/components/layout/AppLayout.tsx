import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Avatar } from "../ui/Avatar";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { navLinks } from "../../constants/icon";



export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="app-shell font-sans text-primary bg-app">
      <header className="app-topnav shadow-sm justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-md hover:bg-surface-hover text-muted" onClick={() => setIsMobileNavOpen(true)}>
            <FiMenu size={20} />
          </button>
          <Link to="/dashboard" className="text-xl font-bold tracking-tight text-accent flex items-center gap-2">
            <span>Tech-Hire-Prep</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{user?.name}</span>
            <Avatar name={user?.name} size="sm" />
          </div>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar shadow-sm">
          <div className="flex-1 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path ||
                location.pathname.startsWith(`${link.path}/`);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`app-sidebar-link ${isActive ? "active" : ""}`}
                >
                  <Icon
                    size={18}
                    color={isActive ? "#ffffff" : link.color}
                  />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
          <div className="pt-4 border-t border-subtle">
            <button onClick={handleLogout} className="app-sidebar-link w-full text-danger hover:text-danger hover:bg-danger/10">
              <FiLogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="app-main">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {isMobileNavOpen && (
        <div className="md:hidden">
          <div className="mobile-nav-overlay" onClick={() => setIsMobileNavOpen(false)} />
          <div className="mobile-nav-drawer shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <Link to="/dashboard" className="text-xl font-bold tracking-tight text-accent">Tech-Hire-Prep</Link>
              <button className="p-2 rounded-md hover:bg-surface-hover text-muted" onClick={() => setIsMobileNavOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-surface-hover border border-subtle">
              <Avatar name={user?.name} size="md" />
              <div>
                <p className="font-semibold text-sm text-text-primary">{user?.name}</p>
                <p className="text-xs text-muted truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
                return (
                  <NavLink key={link.path} to={link.path} onClick={() => setIsMobileNavOpen(false)} className={`app-sidebar-link ${isActive ? "active" : ""} text-base py-3`}>
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
            <div className="pt-4 border-t border-subtle mt-auto">
              <button onClick={handleLogout} className="app-sidebar-link w-full text-danger hover:text-danger hover:bg-danger/10 text-base py-3">
                <FiLogOut size={20} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
