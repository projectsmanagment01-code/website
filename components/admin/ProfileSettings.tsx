"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Save, Settings as SettingsIcon, Key } from "lucide-react";
import { adminFetch } from '@/lib/admin-fetch';

interface ProfileSettingsProps {
  onClose?: () => void;
}

interface RecaptchaSettings {
  enabled: boolean;
  siteKey: string;
  secretKey: string;
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("password");

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Username change state
  const [usernameData, setUsernameData] = useState({
    currentUsername: "",
    newUsername: "",
  });

  // reCAPTCHA settings state
  const [recaptchaSettings, setRecaptchaSettings] = useState({
    enabled: false,
    siteKey: "",
    secretKey: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchRecaptchaSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsernameData(prev => ({
          ...prev,
          currentUsername: data.username || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchRecaptchaSettings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/admin/recaptcha-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecaptchaSettings(data);
      }
    } catch (error) {
      console.error("Error fetching reCAPTCHA settings:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (usernameData.newUsername.trim().length < 2) {
      setMessage({ type: "error", text: "Username must be at least 2 characters long" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/auth/change-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newUsername: usernameData.newUsername.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Username changed successfully" });
        setUsernameData({
          currentUsername: data.username,
          newUsername: data.username,
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to change username" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleRecaptchaSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/admin/recaptcha-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recaptchaSettings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "reCAPTCHA settings updated successfully" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update reCAPTCHA settings" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "password", label: "Change Password", icon: Key },
    { id: "username", label: "Change Username", icon: SettingsIcon },
    { id: "recaptcha", label: "reCAPTCHA Settings", icon: SettingsIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Settings</h1>
        <p className="text-gray-600">
          Manage your login credentials and security settings
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "password" && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        )}

        {activeTab === "username" && (
          <form onSubmit={handleUsernameChange} className="space-y-4">
            <div>
              <label htmlFor="currentUsername" className="block text-sm font-medium text-gray-700 mb-1">
                Current Username
              </label>
              <input
                type="text"
                id="currentUsername"
                value={usernameData.currentUsername}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-1">
                New Username
              </label>
              <input
                type="text"
                id="newUsername"
                value={usernameData.newUsername}
                onChange={(e) => setUsernameData({ ...usernameData, newUsername: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
                minLength={2}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Username must be 2-50 characters long
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Changing Username..." : "Change Username"}
            </button>
          </form>
        )}

        {activeTab === "recaptcha" && (
          <form onSubmit={handleRecaptchaSettingsUpdate} className="space-y-4">
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={recaptchaSettings.enabled}
                  onChange={(e) => setRecaptchaSettings({ ...recaptchaSettings, enabled: e.target.checked })}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable reCAPTCHA verification on login
                </span>
              </label>
            </div>
            <div>
              <label htmlFor="siteKey" className="block text-sm font-medium text-gray-700 mb-1">
                reCAPTCHA Site Key
              </label>
              <input
                type="text"
                id="siteKey"
                value={recaptchaSettings.siteKey}
                onChange={(e) => setRecaptchaSettings({ ...recaptchaSettings, siteKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your reCAPTCHA site key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your site key from the Google reCAPTCHA console
              </p>
            </div>
            <div>
              <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 mb-1">
                reCAPTCHA Secret Key
              </label>
              <input
                type="password"
                id="secretKey"
                value={recaptchaSettings.secretKey}
                onChange={(e) => setRecaptchaSettings({ ...recaptchaSettings, secretKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your reCAPTCHA secret key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Secret key is used for server-side verification
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Updating reCAPTCHA..." : "Update reCAPTCHA Settings"}
            </button>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Setup Instructions</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="underline">Google reCAPTCHA console</a></li>
                <li>Create a new site with reCAPTCHA v2 "I'm not a robot" checkbox</li>
                <li>Add your domain(s) to the site configuration</li>
                <li>Copy the Site Key and Secret Key to the fields above</li>
                <li>Enable reCAPTCHA and save the settings</li>
              </ol>
            </div>
          </form>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Authentication System Features</h3>
          <ul className="text-blue-700 space-y-1">
            <li>✅ Dual Authentication: Login with email OR username</li>
            <li>✅ Password Management: Change password securely</li>
            <li>✅ Username Management: Update display name</li>
            <li>✅ Google reCAPTCHA v2: Optional protection with admin toggle</li>
            <li>✅ JWT Tokens: Secure session management</li>
            <li>✅ Database Storage: All settings persisted in AdminSettings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
