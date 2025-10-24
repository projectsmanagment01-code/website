'use client';

import { useState } from 'react';
import SuggestionsTable from './SuggestionsTable';
import OrphanPagesView from './OrphanPagesView';
import StatsView from './StatsView';

type Tab = 'suggestions' | 'orphans' | 'stats';

export default function InternalLinksManager() {
  const [activeTab, setActiveTab] = useState<Tab>('suggestions');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);

  const handleScan = async (withAI: boolean = false) => {
    setScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/admin/internal-links/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rescan: true, useAI: withAI })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult(
          `Scan complete! Found ${data.totalSuggestions} suggestions across ${data.scannedRecipes} recipes.${withAI ? ' (AI-enhanced)' : ''}`
        );
      } else {
        setScanResult('Scan failed. Please try again.');
      }
    } catch (error) {
      console.error('Error scanning:', error);
      setScanResult('Error during scan. Check console for details.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Internal Links Manager</h2>
          <p className="text-gray-600">Manage automatic internal linking suggestions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleScan(false)}
            disabled={scanning}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : 'Quick Scan'}
          </button>
          <button
            onClick={() => handleScan(true)}
            disabled={scanning}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {scanning ? 'Scanning...' : '✨ AI Scan'}
          </button>
        </div>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">{scanResult}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'suggestions'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Suggestions
          </button>
          <button
            onClick={() => setActiveTab('orphans')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'orphans'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Orphan Pages
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === 'stats'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Statistics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'suggestions' && <SuggestionsTable />}
        {activeTab === 'orphans' && <OrphanPagesView />}
        {activeTab === 'stats' && <StatsView />}
      </div>
    </div>
  );
}
