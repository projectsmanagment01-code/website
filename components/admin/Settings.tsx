"use client";

import React from "react";
import { Puzzle } from "lucide-react";

interface SettingsProps {
  className?: string;
}

export default function Settings({ className }: SettingsProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-64 space-y-4 ${className || ""}`}>
      <div className="p-4 bg-blue-50 rounded-full">
        <Puzzle className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Settings Moved</h2>
      <p className="text-gray-500 text-center max-w-md">
        All technical settings, including Code Injection, Ads.txt, and Robots.txt, have been moved to the <strong>Integrations</strong> page.
      </p>
    </div>
  );
}
