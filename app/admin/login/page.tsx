"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the RecaptchaComponent to avoid SSR issues
const RecaptchaComponent = dynamic(
  () => import("@/components/RecaptchaComponent"),
  { ssr: false }
);

interface RecaptchaSettings {
  enabled: boolean;
  siteKey: string;
}

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaSettings, setRecaptchaSettings] = useState<RecaptchaSettings>({
    enabled: false,
    siteKey: "",
  });
  const [recaptchaLoading, setRecaptchaLoading] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch reCAPTCHA settings
    const fetchRecaptchaSettings = async () => {
      try {
        const response = await fetch("/api/recaptcha");
        if (response.ok) {
          const data = await response.json();
          setRecaptchaSettings(data);
        }
      } catch (error) {
        console.error("Error fetching reCAPTCHA settings:", error);
      } finally {
        setRecaptchaLoading(false);
      }
    };

    fetchRecaptchaSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if reCAPTCHA is enabled and token is required
    if (recaptchaSettings.enabled && !recaptchaToken) {
      setError("Please complete the reCAPTCHA verification");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...credentials,
          recaptchaToken: recaptchaSettings.enabled ? recaptchaToken : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin");
      } else {
        setError(data.error || "Login failed");
        // Reset reCAPTCHA token on error
        setRecaptchaToken(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    try {
      const response = await fetch("/api/admin/reset-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resetToken,
          newPassword,
          newUsername: newUsername || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess("Password reset successfully! You can now login with your new credentials.");
        setTimeout(() => {
          setShowResetModal(false);
          setResetToken("");
          setNewPassword("");
          setNewUsername("");
          setResetSuccess("");
        }, 3000);
      } else {
        setResetError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setResetError("Network error. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  if (recaptchaLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email address or Username"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* reCAPTCHA Component */}
          {!recaptchaLoading && recaptchaSettings.enabled && recaptchaSettings.siteKey && (
            <div className="flex justify-center">
              <RecaptchaComponent
                siteKey={recaptchaSettings.siteKey}
                onVerify={handleRecaptchaChange}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (recaptchaSettings.enabled && !recaptchaToken)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="w-full text-sm text-orange-600 hover:text-orange-700 underline"
            >
              Forgot password? Reset with emergency token
            </button>
            <p className="text-center text-sm text-gray-600">
              Change your password from the Login Settings in the admin dashboard
            </p>
          </div>
        </form>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Emergency Password Reset</h3>
            
            {resetSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {resetSuccess}
              </div>
            )}
            
            {resetError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {resetError}
              </div>
            )}
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reset Token (ADMIN_SECRET or MASTER_RESET_TOKEN)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your reset token"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Username (optional)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter new username (optional)"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetError("");
                    setResetSuccess("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            <p className="mt-4 text-xs text-gray-500">
              The reset token is your ADMIN_SECRET or MASTER_RESET_TOKEN from environment variables.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
