"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="w-5 h-5" />;
    } else if (theme === 'system') {
      return <Monitor className="w-5 h-5" />;
    } else {
      return <Sun className="w-5 h-5" />;
    }
  };

  const getTooltip = () => {
    if (theme === 'dark') {
      return 'Switch to System Theme';
    } else if (theme === 'system') {
      return 'Switch to Light Theme';
    } else {
      return 'Switch to Dark Theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={getTooltip()}
      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
    >
      {getIcon()}
    </button>
  );
};