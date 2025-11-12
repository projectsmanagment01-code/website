"use client";

import React from "react";
import { AdminCard, AdminButton, AdminBadge } from "@/components/admin/AdminUI";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Users, 
  FileText,
  Settings
} from "lucide-react";

export const DarkThemePreview = () => {
  const demoStats = [
    { label: "Total Users", value: "2,847", icon: Users, trend: "+12%" },
    { label: "Active Sessions", value: "1,241", icon: Activity, trend: "+5%" },
    { label: "Revenue", value: "$89,432", icon: TrendingUp, trend: "+23%" },
    { label: "Growth Rate", value: "94.2%", icon: Sparkles, trend: "+8%" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
              Dark Theme Preview
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Elegant admin dashboard with sophisticated dark mode
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AdminCard key={index} hover gradient className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {stat.value}
                    </p>
                    <AdminBadge variant="success" className="mt-2">
                      {stat.trend}
                    </AdminBadge>
                  </div>
                  <div className="relative group">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AdminCard gradient className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-20 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Automation Hub
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your automated workflows
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <AdminButton variant="primary" className="w-full">
                Start New Automation
              </AdminButton>
              <AdminButton variant="secondary" className="w-full">
                View Reports
              </AdminButton>
            </div>
          </AdminCard>

          <AdminCard gradient className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl blur-lg opacity-20 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Configuration
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Customize your dashboard settings
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <AdminButton variant="ghost" className="w-full">
                System Settings
              </AdminButton>
              <AdminButton variant="danger" className="w-full">
                Reset Configuration
              </AdminButton>
            </div>
          </AdminCard>
        </div>

        {/* Feature Showcase */}
        <AdminCard gradient className="p-8">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Dark Theme Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Elegant Design
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sophisticated color palette with gradient accents
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Smooth Transitions
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fluid animations and hover effects
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Easy on Eyes
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Reduced eye strain with balanced contrast
              </p>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
};