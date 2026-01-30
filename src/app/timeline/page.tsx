'use client';

import { useEffect, useState } from 'react';
import { loadState, getDaysRemaining } from '@/lib/storage';
import { AppState, MOOD_OPTIONS } from '@/types';
import Link from 'next/link';

export default function TimelinePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
  }, []);

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // Create a map of entries by date
  const entriesByDate = new Map<string, typeof state.entries>();
  state.entries.forEach(entry => {
    const dateKey = entry.date.split('T')[0];
    if (!entriesByDate.has(dateKey)) {
      entriesByDate.set(dateKey, []);
    }
    entriesByDate.get(dateKey)!.push(entry);
  });

  // Generate calendar data for the last 12 months
  const today = new Date();
  const months: { month: string; days: { date: string; hasEntry: boolean; mood?: string }[] }[] = [];
  
  for (let m = 11; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const days: { date: string; hasEntry: boolean; mood?: string }[] = [];
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
      const dateKey = dayDate.toISOString().split('T')[0];
      const dayEntries = entriesByDate.get(dateKey) || [];
      const hasEntry = dayEntries.length > 0;
      const mood = hasEntry ? dayEntries[0].mood : undefined;
      
      days.push({ date: dateKey, hasEntry, mood });
    }
    
    months.push({ month: monthName, days });
  }

  // Calculate stats
  const daysWithEntries = new Set(state.entries.map(e => e.date.split('T')[0])).size;
  const totalDays = 1796;
  const daysRemaining = getDaysRemaining();
  const daysElapsed = totalDays - daysRemaining;
  const consistency = daysElapsed > 0 ? Math.round((daysWithEntries / Math.min(daysElapsed, 365)) * 100) : 0;

  const getMoodColor = (mood?: string): string => {
    if (!mood) return 'bg-gray-800';
    const moodOption = MOOD_OPTIONS.find(m => m.value === mood);
    switch (mood) {
      case 'great': return 'bg-green-500';
      case 'good': return 'bg-green-400';
      case 'okay': return 'bg-yellow-500';
      case 'bad': return 'bg-orange-500';
      case 'terrible': return 'bg-red-500';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Timeline</h1>
        <p className="text-gray-400 mt-1">Visualize your journey over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <p className="text-3xl font-bold text-white">{daysWithEntries}</p>
          <p className="text-sm text-gray-400">Days Documented</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-3xl font-bold text-white">{daysElapsed}</p>
          <p className="text-sm text-gray-400">Days Elapsed</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-3xl font-bold text-white">{daysRemaining}</p>
          <p className="text-sm text-gray-400">Days Remaining</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-3xl font-bold text-white">{consistency}%</p>
          <p className="text-sm text-gray-400">Consistency (Year)</p>
        </div>
      </div>

      {/* Legend */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <span className="text-sm text-gray-400">Mood Legend:</span>
          {MOOD_OPTIONS.map((mood) => (
            <div key={mood.value} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getMoodColor(mood.value)}`} />
              <span className="text-sm text-gray-400">{mood.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-800" />
            <span className="text-sm text-gray-400">No Entry</span>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Activity Heatmap</h2>
        
        <div className="space-y-6">
          {months.map(({ month, days }) => (
            <div key={month}>
              <h3 className="text-sm font-medium text-gray-400 mb-2">{month}</h3>
              <div className="flex flex-wrap gap-1">
                {days.map(({ date, hasEntry, mood }) => {
                  const isToday = date === today.toISOString().split('T')[0];
                  const isFuture = new Date(date) > today;
                  
                  return (
                    <div
                      key={date}
                      className={`w-4 h-4 rounded-sm transition-all ${
                        isFuture 
                          ? 'bg-gray-900' 
                          : hasEntry 
                            ? getMoodColor(mood) 
                            : 'bg-gray-800'
                      } ${isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''}`}
                      title={`${date}${hasEntry ? ' - Entry recorded' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Progress */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Journey Progress</h2>
        <div className="relative">
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${(daysElapsed / totalDays) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Start</span>
            <span>{Math.round((daysElapsed / totalDays) * 100)}% Complete</span>
            <span>Jan 1, 2031</span>
          </div>
        </div>
        
        {/* Milestones on timeline */}
        <div className="mt-8 relative">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-700" />
          <div className="flex justify-between relative">
            {[
              { day: 0, label: 'Day 1' },
              { day: 449, label: '25%' },
              { day: 898, label: '50%' },
              { day: 1347, label: '75%' },
              { day: 1796, label: '2031' },
            ].map((milestone) => {
              const reached = daysElapsed >= milestone.day;
              return (
                <div key={milestone.day} className="flex flex-col items-center">
                  <div 
                    className={`w-4 h-4 rounded-full border-2 ${
                      reached 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'bg-gray-900 border-gray-600'
                    }`}
                  />
                  <span className={`text-xs mt-2 ${reached ? 'text-white' : 'text-gray-500'}`}>
                    {milestone.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      {state.entries.length === 0 && (
        <div className="glass rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-white mb-2">Start Building Your Timeline</h2>
          <p className="text-gray-400 mb-6">
            Every entry adds color to your journey. Start documenting today!
          </p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <span>+</span>
            <span>Write First Entry</span>
          </Link>
        </div>
      )}
    </div>
  );
}
