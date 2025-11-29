'use client';

import { Calendar } from 'lucide-react';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const ranges: { label: string; value: TimeRange }[] = [
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
      <div className="px-2 text-slate-400 hidden sm:block">
        <Calendar className="w-4 h-4" />
      </div>
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap
            ${value === range.value 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
