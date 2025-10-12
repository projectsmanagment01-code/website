"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import Dashboard from "../../components/main/Dashboard";

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
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3 sm:gap-0">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={handleGoHome}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium"
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
