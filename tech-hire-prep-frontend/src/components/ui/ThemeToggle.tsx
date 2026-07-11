import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-surface-soft focus-visible:outline-none ${className}`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      style={{ color: 'var(--text-primary)' }}
      {...props}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
};
