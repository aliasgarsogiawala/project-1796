'use client';

import { useEffect, useState } from 'react';
import { loadState, getDaysRemaining } from '@/lib/storage';
import { AppState, MOOD_OPTIONS } from '@/types';
import Link from 'next/link';
import ContributionGraph from '@/components/ContributionGraph';

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
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const daysWithEntries = new Set(state.entries.map(e => e.date.split('T')[0])).size;
  const totalDays = 1796;
  const daysRemaining = getDaysRemaining();
  const daysElapsed = totalDays - daysRemaining;
  const consistency = daysElapsed > 0 ? Math.round((daysWithEntries / Math.min(daysElapsed, 365)) * 100) : 0;

  // Get mood distribution
  const moodCounts = state.entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalMoods = state.entries.length;

  // Get entries by month for the chart
  const entriesByMonth: { month: string; count: number }[] = [];
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  last12Months.forEach(({ key, label }) => {
    const count = state.entries.filter(e => e.date.startsWith(key)).length;
    entriesByMonth.push({ month: label, count });
  });

  const maxMonthlyEntries = Math.max(...entriesByMonth.map(m => m.count), 1);

  // Milestones
  const milestones = [
    { day: 0, label: 'Day 1', reached: daysElapsed >= 0 },
    { day: 100, label: '100 Days', reached: daysElapsed >= 100 },
    { day: 365, label: '1 Year', reached: daysElapsed >= 365 },
    { day: 730, label: '2 Years', reached: daysElapsed >= 730 },
    { day: 1095, label: '3 Years', reached: daysElapsed >= 1095 },
    { day: 1460, label: '4 Years', reached: daysElapsed >= 1460 },
    { day: 1796, label: '2031!', reached: daysElapsed >= 1796 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Timeline</h1>
        <p className="text-gray-500 mt-1">Visualize your journey and track your consistency</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{daysWithEntries}</p>
              <p className="text-xs text-gray-500">Days Documented</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{daysElapsed}</p>
              <p className="text-xs text-gray-500">Days Elapsed</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{daysRemaining}</p>
              <p className="text-xs text-gray-500">Days Remaining</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{consistency}%</p>
              <p className="text-xs text-gray-500">Consistency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Contribution Graph</h2>
            <p className="text-xs text-gray-500 mt-1">Your activity over the past year</p>
          </div>
        </div>
        <ContributionGraph entries={state.entries} weeks={52} />
      </div>

      {/* Monthly Activity Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Monthly Activity</h2>
            <p className="text-xs text-gray-500 mt-1">Entries per month over the last year</p>
          </div>
        </div>
        
        <div className="flex items-end gap-2 h-32">
          {entriesByMonth.map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-t transition-all duration-500 hover:opacity-80"
                style={{ 
                  height: `${(month.count / maxMonthlyEntries) * 100}%`,
                  minHeight: month.count > 0 ? '4px' : '0'
                }}
                title={`${month.count} entries`}
              />
              <span className="text-[10px] text-gray-600">{month.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Progress & Mood Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journey Milestones */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Journey Milestones</h2>
          
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#1a1a1a]">
              <div 
                className="w-full bg-gradient-to-b from-primary-500 to-accent-500 transition-all duration-1000"
                style={{ height: `${(daysElapsed / totalDays) * 100}%` }}
              />
            </div>
            
            {/* Milestones */}
            <div className="space-y-4">
              {milestones.map((milestone, i) => (
                <div key={i} className="flex items-center gap-4 pl-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all ${
                    milestone.reached 
                      ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30' 
                      : 'bg-[#1a1a1a] border border-[#2a2a2a]'
                  }`}>
                    {milestone.reached ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#333]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${milestone.reached ? 'text-white' : 'text-gray-600'}`}>
                      {milestone.label}
                    </p>
                    <p className="text-xs text-gray-600">Day {milestone.day}</p>
                  </div>
                  {milestone.reached && daysElapsed < milestones[i + 1]?.day && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-500/10 text-primary-400">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Mood Distribution</h2>
          
          {totalMoods === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😊</span>
              </div>
              <p className="text-gray-400 text-sm">No mood data yet</p>
              <p className="text-gray-600 text-xs mt-1">Start journaling to track your moods</p>
            </div>
          ) : (
            <div className="space-y-4">
              {MOOD_OPTIONS.map((mood) => {
                const count = moodCounts[mood.value] || 0;
                const percentage = totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0;
                
                return (
                  <div key={mood.value} className="flex items-center gap-3">
                    <span className="text-xl w-8">{mood.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">{mood.label}</span>
                        <span className="text-xs text-gray-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            background: mood.value === 'great' ? '#10b981' :
                                       mood.value === 'good' ? '#34d399' :
                                       mood.value === 'okay' ? '#fbbf24' :
                                       mood.value === 'bad' ? '#f97316' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overall Journey Progress */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Overall Journey Progress</h2>
        <div className="relative">
          <div className="h-4 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-pink-500 rounded-full transition-all duration-1000 relative"
              style={{ width: `${(daysElapsed / totalDays) * 100}%` }}
            >
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>
          <div className="flex justify-between mt-3 text-xs">
            <span className="text-gray-500">Start</span>
            <span className="text-primary-400 font-medium">{((daysElapsed / totalDays) * 100).toFixed(1)}% Complete</span>
            <span className="text-gray-500">Jan 1, 2031</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      {state.entries.length === 0 && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📅</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Start Building Your Timeline</h2>
          <p className="text-gray-500 text-sm mb-6">
            Every entry adds color to your journey. Start documenting today!
          </p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Write First Entry
          </Link>
        </div>
      )}
    </div>
  );
}
