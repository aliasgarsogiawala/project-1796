'use client';

import { useEffect, useState, useMemo } from 'react';
import { loadState, getDaysRemaining, getTimeProgress } from '@/lib/storage';
import { AppState, MOOD_OPTIONS } from '@/types';
import ContributionGraph from '@/components/ContributionGraph';
import Link from 'next/link';

export default function TimelinePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
  }, []);

  const stats = useMemo(() => {
    if (!state) return null;

    const daysRemaining = getDaysRemaining();
    const timeProgress = getTimeProgress();
    
    // Monthly activity
    const monthlyActivity: { [key: string]: number } = {};
    const moodDistribution: { [key: string]: number } = {
      great: 0, good: 0, okay: 0, bad: 0, terrible: 0
    };
    
    state.entries.forEach(entry => {
      const monthKey = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyActivity[monthKey] = (monthlyActivity[monthKey] || 0) + 1;
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    });

    // Get last 6 months
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({ label: key, count: monthlyActivity[key] || 0 });
    }

    const maxMonthlyCount = Math.max(...months.map(m => m.count), 1);

    // Unique days with entries
    const uniqueDays = new Set(state.entries.map(e => e.date.split('T')[0])).size;
    
    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...new Set(state.entries.map(e => e.date.split('T')[0]))].sort().reverse();
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = i > 0 ? new Date(sortedDates[i - 1]) : null;
        
        if (i === 0 || (previousDate && (previousDate.getTime() - currentDate.getTime()) === 86400000)) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      currentStreak = sortedDates.includes(today) || sortedDates.includes(yesterday) ? tempStreak : 0;
    }

    // Weekly average
    const weeklyAvg = uniqueDays > 0 
      ? Math.round((state.entries.length / Math.ceil(uniqueDays / 7)) * 10) / 10
      : 0;

    return {
      daysRemaining,
      timeProgress,
      totalEntries: state.entries.length,
      uniqueDays,
      currentStreak,
      longestStreak,
      weeklyAvg,
      months,
      maxMonthlyCount,
      moodDistribution,
      totalGoals: state.goals.length,
      completedGoals: state.goals.filter(g => g.progress === 100).length,
    };
  }, [state]);

  if (!mounted || !state || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const moodColors: { [key: string]: string } = {
    great: '#10b981',
    good: '#34d399', 
    okay: '#fbbf24',
    bad: '#f97316',
    terrible: '#ef4444'
  };

  const totalMoodEntries = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Timeline</h1>
          <p className="text-gray-500 mt-1">Visualize your journey and track your progress over time</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Entry</span>
        </Link>
      </div>

      {/* Journey Progress Hero */}
      <div className="card-glow p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium uppercase tracking-wider">Journey Progress</span>
          </div>
          
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-5xl font-bold gradient-text">{stats.timeProgress.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-1">Complete</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white">{stats.daysRemaining.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Days Left</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-cyan-400">{1796 - stats.daysRemaining}</p>
              <p className="text-sm text-gray-500 mt-1">Days Elapsed</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-pink-400">{Math.floor(stats.daysRemaining / 7)}</p>
              <p className="text-sm text-gray-500 mt-1">Weeks Left</p>
            </div>
          </div>

          <div className="h-4 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full relative animate-progress"
              style={{ width: `${stats.timeProgress}%` }}
            >
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm text-gray-500">
            <span>Start (Jan 2026)</span>
            <span>Now</span>
            <span>End (Jan 2031)</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card hover:border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <span className="badge badge-primary">Total</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalEntries}</p>
          <p className="text-sm text-gray-500 mt-1">Journal Entries</p>
        </div>

        <div className="stat-card hover:border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
            <span className="badge badge-warning">Streak</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.currentStreak}</p>
          <p className="text-sm text-gray-500 mt-1">Current Streak</p>
        </div>

        <div className="stat-card hover:border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <span className="badge badge-success">Best</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.longestStreak}</p>
          <p className="text-sm text-gray-500 mt-1">Longest Streak</p>
        </div>

        <div className="stat-card hover:border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-white">{stats.uniqueDays}</p>
          <p className="text-sm text-gray-500 mt-1">Active Days</p>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Activity Heatmap</h2>
            <p className="text-sm text-gray-500 mt-1">Your journaling activity over the past year</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{stats.weeklyAvg} entries/week avg</span>
          </div>
        </div>
        <ContributionGraph entries={state.entries} weeks={52} colorScheme="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6">Monthly Activity</h2>
          <div className="space-y-4">
            {stats.months.map((month, index) => (
              <div key={month.label} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{month.label}</span>
                  <span className="text-sm font-semibold text-white">{month.count} entries</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${(month.count / stats.maxMonthlyCount) * 100}%`,
                      background: `linear-gradient(90deg, #8b5cf6, #06b6d4)`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-6">Mood Distribution</h2>
          {totalMoodEntries === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No mood data yet</p>
              <p className="text-sm text-gray-600 mt-1">Start journaling to see your mood patterns</p>
            </div>
          ) : (
            <div className="space-y-4">
              {MOOD_OPTIONS.map((mood) => {
                const count = stats.moodDistribution[mood.value] || 0;
                const percentage = totalMoodEntries > 0 ? Math.round((count / totalMoodEntries) * 100) : 0;
                return (
                  <div key={mood.value} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mood.emoji}</span>
                        <span className="text-sm text-gray-400 capitalize">{mood.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{percentage}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: moodColors[mood.value]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Goals Progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Goals Progress</h2>
            <p className="text-sm text-gray-500 mt-1">{stats.completedGoals} of {stats.totalGoals} goals completed</p>
          </div>
          <Link 
            href="/goals"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {state.goals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-gray-400 mb-1">No goals yet</p>
            <p className="text-gray-600 text-sm mb-4">Create goals to track your progress</p>
            <Link
              href="/goals"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Goal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.goals.map((goal) => (
              <div 
                key={goal.id} 
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: goal.color + '20' }}
                  >
                    🎯
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{goal.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-6">Journey Milestones</h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-500 to-pink-500" />
          <div className="space-y-8">
            {[
              { days: 1796, label: 'Journey Begins', icon: '🚀', completed: true },
              { days: 1500, label: '296 Days Complete', icon: '⭐', completed: 1796 - stats.daysRemaining >= 296 },
              { days: 1000, label: 'Halfway There', icon: '🎯', completed: 1796 - stats.daysRemaining >= 898 },
              { days: 500, label: '500 Days to Go', icon: '💪', completed: stats.daysRemaining <= 500 },
              { days: 100, label: 'Final Stretch', icon: '🏃', completed: stats.daysRemaining <= 100 },
              { days: 0, label: 'Goal Achieved!', icon: '🎉', completed: stats.daysRemaining <= 0 },
            ].map((milestone, index) => (
              <div key={index} className="flex items-center gap-6 relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl z-10 ${
                  milestone.completed 
                    ? 'bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/30' 
                    : 'bg-white/5 border border-white/10'
                }`}>
                  {milestone.icon}
                </div>
                <div>
                  <p className={`font-semibold ${milestone.completed ? 'text-white' : 'text-gray-500'}`}>
                    {milestone.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {milestone.completed ? 'Completed' : `${milestone.days} days remaining`}
                  </p>
                </div>
                {milestone.completed && (
                  <div className="ml-auto">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                      ✓ Achieved
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
