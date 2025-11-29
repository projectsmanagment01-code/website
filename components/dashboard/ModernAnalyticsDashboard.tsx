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
  ArrowDownRight
} from 'lucide-react';

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
  };
  topRecipes: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    views: number;
    img?: string;
    heroImage?: string;
  }>;
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
}

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

// Simple World Map Component
const WorldMap = ({ locations }: { locations: Array<{ latitude: number; longitude: number; country: string; city: string }> }) => {
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
    <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '50%' }}>
      {/* World map background image */}
      <img 
        src="/uploads/general/world-map.png" 
        alt="World Map" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
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

  useEffect(() => {
    fetchAnalytics();
    fetchVisitors();
    
    // Refresh visitor data every 30 seconds
    const interval = setInterval(fetchVisitors, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch('/api/admin/visitors');
      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
      }
    } catch (err) {
      console.error('Failed to fetch visitor data:', err);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Analytics Overview
            </h1>
            <p className="text-slate-500 mt-1">Comprehensive insights into your platform performance</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>

        {/* Key Metrics */}
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

          {/* Growth Rate */}
          <div className="group bg-white rounded-xl p-2 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-1">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-slate-700" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                overview.subscriberGrowthRate >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {overview.subscriberGrowthRate >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{Math.abs(overview.subscriberGrowthRate)}%</span>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">
                {overview.subscriberGrowthRate >= 0 ? '+' : ''}{overview.subscriberGrowthRate}%
              </p>
              <p className="text-xs text-slate-500">Growth Rate</p>
              <div className="pt-1 flex items-end h-8 gap-0.5">
                {[3, 5, 4, 6, 8, 7, 9, 10, 9, 11, 13, 12].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-slate-600 to-slate-400 rounded-t" style={{ height: `${h * 8}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
