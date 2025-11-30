import React, { useState } from 'react';
import { Mail, Calendar, Send, Check, AlertCircle, FileText } from 'lucide-react';
import { AnalyticsData } from '@/types/analytics';

interface EmailReportsProps {
  analytics: AnalyticsData;
}

export default function EmailReports({ analytics }: EmailReportsProps) {
  const [email, setEmail] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSave = () => {
    // Save settings to local storage or backend
    localStorage.setItem('analytics_report_settings', JSON.stringify({ email, enabled, frequency }));
    // Show success message
  };

  const handleSendTest = async () => {
    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  // Calculate report metrics
  const { overview, topRecipes } = analytics;
  const topRecipe = topRecipes[0];
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Mail className="w-5 h-5 text-slate-600" />
          Automated Email Reports
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {enabled ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-slate-100">
        {/* Settings Column */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setFrequency('weekly')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${frequency === 'weekly' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setFrequency('monthly')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${frequency === 'monthly' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} className="hidden" />
              <span className="text-sm font-medium text-slate-700">Enable Reports</span>
            </label>
            
            <button 
              onClick={handleSendTest}
              disabled={sending || !email}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : sent ? 'Sent!' : 'Send Test'}
            </button>
          </div>
        </div>
        
        {/* Preview Column */}
        <div className="bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Preview</h4>
            <span className="text-xs text-slate-400">Subject: Your Weekly Analytics Summary</span>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4 max-w-sm mx-auto transform scale-95 origin-top">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">Weekly Summary</h2>
              <p className="text-xs text-slate-500">Nov 24 - Nov 30, 2025</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500">Total Views</p>
                <p className="text-lg font-bold text-slate-800">{overview.totalViews.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600">+12% vs last week</p>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500">New Subscribers</p>
                <p className="text-lg font-bold text-slate-800">{overview.recentSubscribers}</p>
                <p className="text-[10px] text-emerald-600">+5% vs last week</p>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Top Performing Content</p>
              {topRecipe && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                  <div className="w-8 h-8 bg-slate-200 rounded bg-cover bg-center" style={{ backgroundImage: `url(${topRecipe.img || topRecipe.heroImage})` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{topRecipe.title}</p>
                    <p className="text-[10px] text-slate-500">{topRecipe.views} views</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center pt-2">
              <button className="text-xs text-blue-600 font-medium">View Full Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
