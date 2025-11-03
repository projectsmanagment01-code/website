"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import Dashboard from "../../components/main/Dashboard";
import { ThemeToggle } from "../../components/admin/ThemeToggle";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    // Verify token with the server
    fetch("/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const handleGoHome = () => {
    // Open home page in new tab with cache-busting timestamp for fresh reload
    const timestamp = new Date().getTime();
    window.open(`/?_refresh=${timestamp}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 dark:border-slate-700"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-slate-600 dark:border-t-slate-400 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <div className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3 sm:gap-0">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Admin Dashboard
              </h1>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Online</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <ThemeToggle />
              <button
                onClick={handleGoHome}
                className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}
