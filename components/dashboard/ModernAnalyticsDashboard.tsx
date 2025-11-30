'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  FileText, 
  Users, 
  Mail,
  Globe,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Upload,
  Clock,
  ChevronLeft,
  ChevronRight,
  Target,
  Printer,
  Share2,
  Bookmark,
  Download,
  Layout,
  Settings
} from 'lucide-react';
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector';
import EmailReports from './EmailReports';

interface AnalyticsData {
  overview: {
    totalRecipes: number;
    publishedRecipes: number;
    draftRecipes: number;
    totalViews: number;
    avgViews: number;
    totalSubscribers: number;
    activeSubscribers: number;
    recentSubscribers: number;
    subscriberGrowthRate: number;
    bounceRate?: number;
    totalSessions?: number;
    activeUsers?: number;
    avgDuration?: number;
    avgScrollDepth?: number;
  };
  topSearchQueries?: Array<{ query: string; count: number }>;
  recentActivity?: Array<{
    country: string;
    city: string;
    page: string;
    visitedAt: string;
    deviceType: string;
  }>;
  conversions?: Array<{ event: string; count: number }>;
  topRecipes: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    views: number;
    img?: string;
    heroImage?: string;
  }>;
  topExitPages?: Array<{ page: string; count: number }>;
  recentRecipes: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    status: string;
    createdAt: Date;
    views: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  trafficSources?: Array<{ source: string; count: number; percentage: number }>;
  deviceStats?: Array<{ device: string; count: number; percentage: number }>;
  browserStats?: Array<{ browser: string; count: number; percentage: number }>;
  heatmap?: number[][];
}

// Heatmap Widget
const HeatmapWidget = ({ data }: { data: number[][] }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Find max value for scaling opacity
  let max = 1;
  data.forEach(row => row.forEach(val => max = Math.max(max, val)));
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex mb-2">
          <div className="w-12"></div>
          <div className="flex-1 grid grid-cols-12 gap-1">
            {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map(h => (
              <div key={h} className="text-xs text-slate-400 col-span-1 text-left pl-1">{h}h</div>
            ))}
          </div>
        </div>
        {days.map((day, dIndex) => (
          <div key={day} className="flex items-center mb-1">
            <div className="w-12 text-xs text-slate-500 font-medium">{day}</div>
            <div className="flex-1 grid grid-cols-24 gap-1">
              {data[dIndex].map((val, hIndex) => (
                <div 
                  key={hIndex}
                  className="h-8 rounded-sm transition-all hover:ring-2 hover:ring-slate-400 relative group cursor-help"
                  style={{ 
                    backgroundColor: val > 0 ? `rgba(16, 185, 129, ${Math.max(0.1, val / max)})` : '#f1f5f9' 
                  }}
                >
                  {val > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                      {val} visitors • {day} {hIndex}:00
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-2 text-xs text-slate-400">
        <span>Less</span>
        <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-200 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};

// Simple Line Chart Component
const LineChart = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data, 1);
  const height = 40;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - (value / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-10" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        fill={`url(#gradient-${color.replace('#', '')})`}
        stroke="none"
        points={`0,${height} ${points} 100,${height}`}
      />
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Donut Chart Component
const DonutChart = ({ data, colors }: { data: Array<{ label: string, value: number, percentage: number }>, colors: string[] }) => {
  let currentAngle = -90;
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  
  const createArc = (percentage: number, color: string) => {
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle * (Math.PI / 180);
    const endAngle = (currentAngle + angle) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    currentAngle += angle;
    
    return `
      <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z"
            fill="${color}" opacity="0.9" />
    `;
  };
  
  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.slice(0, 5).map((item, index) => (
          <g key={index} dangerouslySetInnerHTML={{ __html: createArc(item.percentage, colors[index % colors.length]) }} />
        ))}
        <circle cx={centerX} cy={centerY} r={25} fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-700">{data.length}</div>
          <div className="text-xs text-slate-500">Categories</div>
        </div>
      </div>
    </div>
  );
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

// Simple World Map Component
const WorldMap = ({ locations }: { locations: Array<{ latitude: number; longitude: number; country: string; city: string }> }) => {
  const [bgImage, setBgImage] = useState("/uploads/general/world-map.png");

  useEffect(() => {
    const savedBg = localStorage.getItem('analytics_world_map_bg');
    if (savedBg) {
      setBgImage(savedBg);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBgImage(base64);
        localStorage.setItem('analytics_world_map_bg', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert lat/lng to SVG coordinates (Mercator projection)
  const latToY = (lat: number) => {
    // Mercator projection formula
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    return 50 - (mercN * 50) / Math.PI;
  };
  
  const lngToX = (lng: number) => {
    return ((lng + 180) / 360) * 100;
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden group" style={{ paddingBottom: '50%' }}>
      {/* World map background image */}
      <img 
        src={bgImage} 
        alt="World Map" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Upload Button */}
      <label className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-md shadow-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-slate-200" title="Change Map Background">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
        />
        <Upload className="w-4 h-4 text-slate-600" />
      </label>
      
      {/* SVG overlay for visitor dots */}
      <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Visitor location dots */}
        {locations.map((loc, index) => {
          const x = lngToX(loc.longitude);
          const y = latToY(loc.latitude);
          return (
            <g key={index}>
              {/* Main dot */}
              <circle cx={x} cy={y} r="0.8" fill="#ef4444" opacity="1" stroke="#ffffff" strokeWidth="0.15" />
              {/* Pulsing outer ring */}
              <circle cx={x} cy={y} r="1.2" fill="#ef4444" opacity="0.6">
                <animate attributeName="r" from="1.2" to="2.5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Tooltip */}
              <title>{loc.city}, {loc.country}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface VisitorData {
  totalVisitors: number;
  visitorsByCountry: Array<{ country: string; visitors: number }>;
  dailyVisitors: Array<{ date: string; visitors: number }>;
  visitorLocations: Array<{ latitude: number; longitude: number; country: string; city: string }>;
}

export default function ModernAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [visitors, setVisitors] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  // Activity Feed Pagination
  const [activityPage, setActivityPage] = useState(1);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Dashboard Customization
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [widgets, setWidgets] = useState({
    overview: true,
    traffic: true,
    devices: true,
    map: true,
    heatmap: true,
    search: true,
    activity: true,
    reports: true,
    conversions: true
  });

  useEffect(() => {
    const savedWidgets = localStorage.getItem('analytics_widgets_pref');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }
  }, []);

  const toggleWidget = (key: keyof typeof widgets) => {
    const newWidgets = { ...widgets, [key]: !widgets[key] };
    setWidgets(newWidgets);
    localStorage.setItem('analytics_widgets_pref', JSON.stringify(newWidgets));
  };

  useEffect(() => {
    fetchAnalytics();
    fetchVisitors();
    
    // Refresh visitor data every 30 seconds
    const interval = setInterval(fetchVisitors, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  useEffect(() => {
    fetchActivity(activityPage);
  }, [activityPage]);

  const fetchActivity = async (page: number) => {
    setLoadingActivity(true);
    try {
      const response = await fetch(`/api/admin/analytics/activity?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setActivityData(data.activities);
        setTotalActivities(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
      // Initial activity load if not loaded yet
      if (activityData.length === 0 && data.recentActivity) {
        setActivityData(data.recentActivity);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch(`/api/admin/visitors?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
      }
    } catch (err) {
      console.error('Failed to fetch visitor data:', err);
    }
  };

  const handleExport = async (type: 'visitors' | 'conversions' | 'search') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${type}&range=${timeRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-slate-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5" />
            <span className="font-medium">{error || 'Failed to load analytics'}</span>
          </div>
        </div>
      </div>
    );
  }

  const { overview, topRecipes, categoryStats } = analytics;

  // Mock trend data (replace with real data from API)
  const viewsTrend = [65, 78, 82, 90, 95, 88, 92, 98, 105, 112, 108, 115, 120, 125];
  const subscribersTrend = [12, 15, 18, 22, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58];

  const elegantColors = [
    '#334155', // slate
    '#475569', // slate-600
    '#64748b', // slate-500
    '#94a3b8', // slate-400
    '#cbd5e1', // slate-300
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Analytics Overview
            </h1>
            <p className="text-slate-500 mt-1">Comprehensive insights into your platform performance</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className={`p-2 rounded-lg border transition-colors ${showCustomizer ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                title="Customize Dashboard"
              >
                <Layout className="w-4 h-4" />
              </button>
              
              <div className="relative group">
                <button 
                  disabled={exporting}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Export Data'}
                </button>
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden">
                    <button onClick={() => handleExport('visitors')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                      Visitor Logs (CSV)
                    </button>
                    <button onClick={() => handleExport('conversions')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                      Conversions (CSV)
                    </button>
                    <button onClick={() => handleExport('search')} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                      Search Queries (CSV)
                    </button>
                  </div>
                </div>
              </div>
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="font-medium text-slate-700">
                {analytics?.overview.activeUsers || 0} Active Now
              </span>
            </div>
          </div>
        </div>

        {/* Customizer Panel */}
        {showCustomizer && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-4 mb-6 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Dashboard Layout
              </h3>
              <button onClick={() => setShowCustomizer(false)} className="text-slate-400 hover:text-slate-600 text-sm">Close</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(widgets).map(([key, enabled]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100">
                  <input 
                    type="checkbox" 
                    checked={enabled} 
                    onChange={() => toggleWidget(key as any)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        {widgets.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Total Recipes */}
          <div className="group bg-white rounded-xl p-2 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-1">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <FileText className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>{overview.publishedRecipes}</span>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{overview.totalRecipes}</p>
              <p className="text-xs text-slate-500">Total Recipes</p>
              <div className="pt-1">
                <LineChart data={[45, 52, 48, 60, 65, 70, 75, overview.totalRecipes]} color="#334155" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="group bg-white rounded-xl p-2 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-1">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <Eye className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                <span>~{overview.avgViews}</span>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{overview.totalViews.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Views</p>
              <div className="pt-1">
                <LineChart data={viewsTrend} color="#475569" />
              </div>
            </div>
          </div>

          {/* Subscribers */}
          <div className="group bg-white rounded-xl p-2 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-1">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <Mail className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{overview.recentSubscribers}</span>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{overview.totalSubscribers}</p>
              <p className="text-xs text-slate-500">Subscribers</p>
              <div className="pt-1">
                <LineChart data={subscribersTrend} color="#64748b" />
              </div>
            </div>
          </div>

          {/* Conversions (New) */}
          <div className="group bg-white rounded-xl p-2 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-1">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <Target className="w-5 h-5 text-slate-700" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>
                  {analytics.conversions ? analytics.conversions.reduce((acc, curr) => acc + curr.count, 0) : 0}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">
                {analytics.conversions ? analytics.conversions.reduce((acc, curr) => acc + curr.count, 0) : 0}
              </p>
              <p className="text-xs text-slate-500">Total Conversions</p>
              <div className="pt-1 flex gap-1">
                {/* Mini breakdown */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Printer className="w-3 h-3" />
                  {analytics.conversions?.find(c => c.event === 'print')?.count || 0}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Share2 className="w-3 h-3" />
                  {analytics.conversions?.find(c => c.event === 'share')?.count || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Top Recipes */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                  Top Performing Content
                </h3>
                <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full">
                  Last 30 days
                </span>
              </div>
            </div>
            <div className="p-3">
              <div className="space-y-1">
                {topRecipes.slice(0, 6).map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    <img
                      src={recipe.img || recipe.heroImage || '/placeholder.jpg'}
                      alt={recipe.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900">
                        {recipe.title}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{recipe.category.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      <Eye className="w-3 h-3" />
                      <span className="text-xs font-semibold">{recipe.views.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">Content Distribution</h3>
            </div>
            <div className="p-3">
              <div className="aspect-square max-w-[200px] mx-auto mb-3">
                <DonutChart data={categoryStats.map(cat => ({ label: cat.category, value: cat.count, percentage: cat.percentage }))} colors={elegantColors} />
              </div>
              <div className="space-y-1">
                {categoryStats.slice(0, 5).map((cat, index) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: elegantColors[index % elegantColors.length] }}></div>
                      <span className="text-slate-600 capitalize">{cat.category.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-slate-800 font-semibold">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audience Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Traffic Sources */}
          {widgets.traffic && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-600" />
                Traffic Sources
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {analytics.trafficSources && analytics.trafficSources.length > 0 ? (
                analytics.trafficSources.map((source, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        source.source === 'organic' ? 'bg-emerald-500' :
                        source.source === 'social' ? 'bg-blue-500' :
                        source.source === 'direct' ? 'bg-slate-500' : 'bg-amber-500'
                      }`} />
                      <span className="capitalize text-slate-700">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{source.count}</span>
                      <span className="text-xs text-slate-500">({source.percentage}%)</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No traffic data yet</p>
              )}
            </div>
          </div>
          )}

          {/* Device Breakdown */}
          {widgets.devices && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                Devices
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {analytics.deviceStats && analytics.deviceStats.length > 0 ? (
                analytics.deviceStats.map((device, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-slate-700">{device.device}</span>
                      <span className="text-slate-500">{device.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-600 rounded-full" 
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No device data yet</p>
              )}
            </div>
          </div>
          )}

          {/* Browser Stats */}
          {widgets.devices && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-600" />
                Browsers
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {analytics.browserStats && analytics.browserStats.length > 0 ? (
                analytics.browserStats.slice(0, 5).map((browser, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{browser.browser}</span>
                    <span className="font-medium text-slate-900">{browser.percentage}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No browser data yet</p>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bounce Rate & Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-slate-600" />
              Engagement Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Bounce Rate</p>
                <p className="text-2xl font-bold text-slate-800">{overview.bounceRate || 0}%</p>
                <p className="text-xs text-slate-400 mt-1">Single-page sessions</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Avg Time on Page</p>
                <p className="text-2xl font-bold text-slate-800">{formatDuration(overview.avgDuration || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">Per visit</p>
              </div>
            </div>
          </div>

          {/* Top Exit Pages */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <ArrowDownRight className="w-4 h-4 text-slate-600" />
              Top Exit Pages
            </h3>
            <div className="space-y-2">
              {analytics.topExitPages && analytics.topExitPages.length > 0 ? (
                analytics.topExitPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <span className="text-sm text-slate-600 truncate max-w-[70%]">{page.page}</span>
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {page.count} exits
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No exit data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Visitor Geography */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-600" />
                Visitor Geography
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500 font-medium">Live</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            {visitors && visitors.visitorsByCountry.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Total Visitors (30 days)</span>
                    <span className="text-lg font-bold text-slate-800">{visitors.totalVisitors.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {visitors.visitorsByCountry.slice(0, 10).map((country, index) => {
                    const percentage = visitors.totalVisitors > 0 ? (Number(country.visitors) / visitors.totalVisitors * 100).toFixed(1) : 0;
                    return (
                      <div key={country.country} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{country.country}</span>
                            <span className="text-xs text-slate-500">{country.visitors} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className="bg-slate-600 h-1.5 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-8 text-center border border-slate-200">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-slate-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">Collecting geographic data...</p>
                <p className="text-xs text-slate-500 mt-2">Visitor locations will appear here as they visit your site</p>
              </div>
            )}
          </div>
        </div>

        {/* World Map */}
        {widgets.map && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-600" />
              Visitor Locations Map
            </h3>
          </div>
          <div className="p-4">
            {visitors && visitors.visitorLocations && visitors.visitorLocations.length > 0 ? (
              <>
                <WorldMap locations={visitors.visitorLocations} />
                <p className="text-xs text-slate-500 text-center mt-3">
                  Red dots show visitor locations • {visitors.visitorLocations.length} unique location{visitors.visitorLocations.length !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <>
                <WorldMap locations={[]} />
                <p className="text-xs text-slate-500 text-center mt-3">
                  No visitor locations yet • Map will update as visitors arrive
                </p>
              </>
            )}
          </div>
        </div>
        )}

        {/* Heatmap Section */}
        {widgets.heatmap && analytics.heatmap && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                Activity Heatmap (Time of Day)
              </h3>
            </div>
            <div className="p-4 overflow-x-auto">
              <HeatmapWidget data={analytics.heatmap} />
            </div>
          </div>
        )}

        {/* Email Reports */}
        {widgets.reports && (
          <div className="mt-4">
            <EmailReports analytics={analytics} />
          </div>
        )}

        {/* User Behavior Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Top Search Queries */}
          {widgets.search && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-600" />
                Top Search Queries
              </h3>
            </div>
            <div className="p-3">
              {analytics.topSearchQueries && analytics.topSearchQueries.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topSearchQueries.map((q, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-700 font-medium">{q.query}</span>
                      <span className="text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                        {q.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No search data available yet
                </div>
              )}
            </div>
          </div>
          )}

          {/* Engagement Metrics */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                Engagement Metrics
              </h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Avg Time on Page</p>
                <p className="text-2xl font-bold text-slate-800">
                  {analytics.overview.avgDuration ? Math.round(analytics.overview.avgDuration / 60) : 0}m {analytics.overview.avgDuration ? analytics.overview.avgDuration % 60 : 0}s
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Avg Scroll Depth</p>
                <p className="text-2xl font-bold text-slate-800">
                  {analytics.overview.avgScrollDepth || 0}%
                </p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all" 
                    style={{ width: `${analytics.overview.avgScrollDepth || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        {widgets.activity && (
        <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              Live Activity Feed
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-500">Real-time</span>
            </div>
          </div>
          <div className="p-0">
            {activityData.length > 0 ? (
              <>
                <div className="divide-y divide-slate-100">
                  {activityData.map((activity, i) => {
                    const date = new Date(activity.visitedAt);
                    const timeAgo = Math.floor((new Date().getTime() - date.getTime()) / 1000);
                    let timeString = 'just now';
                    
                    if (timeAgo < 60) {
                      timeString = 'just now';
                    } else if (timeAgo < 3600) {
                      timeString = `${Math.floor(timeAgo / 60)}m ago`;
                    } else if (timeAgo < 86400) {
                      timeString = `${Math.floor(timeAgo / 3600)}h ago`;
                    } else if (timeAgo < 604800) {
                      timeString = `${Math.floor(timeAgo / 86400)}d ago`;
                    } else {
                      timeString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }

                    return (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.deviceType === 'mobile' ? 'bg-blue-100 text-blue-600' : 
                            activity.deviceType === 'tablet' ? 'bg-purple-100 text-purple-600' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {activity.deviceType === 'mobile' ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-slate-800 font-medium">
                              Visitor from <span className="text-slate-900">{activity.city !== 'Unknown' ? activity.city : activity.country}</span> viewed <span className="text-emerald-600">{activity.page}</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {activity.country} • {activity.deviceType}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                          {timeString}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                    disabled={activityPage === 1 || loadingActivity}
                    className="p-1 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    Page {activityPage} of {Math.ceil(totalActivities / 10)}
                  </span>
                  <button
                    onClick={() => setActivityPage(p => p + 1)}
                    disabled={activityPage >= Math.ceil(totalActivities / 10) || loadingActivity}
                    className="p-1 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                {loadingActivity ? 'Loading activity...' : 'Waiting for activity...'}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
