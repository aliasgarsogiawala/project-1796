'use client';

import { useEffect, useState } from 'react';
import { getDaysRemaining, getTimeProgress, loadState, getStreak, getGoalContribution } from '@/lib/storage';
import { AppState, GOAL_CATEGORIES, MOOD_OPTIONS } from '@/types';
import Link from 'next/link';
import ContributionGraph from '@/components/ContributionGraph';

export default function Dashboard() {
  const [state, setState] = useState<AppState | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(1796);
  const [timeProgress, setTimeProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
    setDaysRemaining(getDaysRemaining());
    setTimeProgress(getTimeProgress());

    const interval = setInterval(() => {
      setDaysRemaining(getDaysRemaining());
      setTimeProgress(getTimeProgress());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const streak = getStreak(state);
  const todayEntries = state.entries.filter(e => 
    e.date.startsWith(new Date().toISOString().split('T')[0])
  );
  const recentEntries = state.entries.slice(0, 5);
  const totalDays = 1796;
  const daysElapsed = totalDays - daysRemaining;

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 mt-1">Here&apos;s your journey overview</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600 uppercase tracking-wider">Today</p>
          <p className="text-sm text-gray-300 font-medium">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Countdown Hero */}
      <div className="card p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Main countdown */}
            <div className="text-center lg:text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Days Remaining</p>
              <div className="countdown-number pulse-glow inline-block rounded-2xl px-2">
                {daysRemaining.toLocaleString()}
              </div>
              <p className="text-gray-500 mt-2">until January 1, 2031</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white count-up">{daysElapsed}</p>
                <p className="text-xs text-gray-500 mt-1">Days In</p>
              </div>
              <div className="text-center border-x border-[#222] px-6">
                <p className="text-3xl font-bold text-primary-400 count-up">{timeProgress.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Complete</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white count-up">{totalDays}</p>
                <p className="text-xs text-gray-500 mt-1">Total Days</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-pink-500 rounded-full animate-progress relative"
                style={{ width: `${timeProgress}%` }}
              >
                <div className="absolute inset-0 shimmer" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Start</span>
              <span>2031</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
            <span className="text-xs text-gray-600 px-2 py-1 rounded-full bg-orange-500/10 text-orange-400">streak</span>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{streak}</p>
          <p className="text-xs text-gray-500 mt-1">Day streak</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <span className="text-xs text-gray-600 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">total</span>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{state.entries.length}</p>
          <p className="text-xs text-gray-500 mt-1">Journal entries</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <span className="text-xs text-gray-600 px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">active</span>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{state.goals.length}</p>
          <p className="text-xs text-gray-500 mt-1">Goals set</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <span className="text-xs text-gray-600 px-2 py-1 rounded-full bg-green-500/10 text-green-400">today</span>
          </div>
          <p className="text-3xl font-bold text-white mt-4">{todayEntries.length}</p>
          <p className="text-xs text-gray-500 mt-1">Today&apos;s entries</p>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Activity</h2>
            <p className="text-xs text-gray-500 mt-1">Your journaling activity over time</p>
          </div>
          <Link href="/timeline" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            View Timeline →
          </Link>
        </div>
        <ContributionGraph entries={state.entries} weeks={26} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Your Goals</h2>
            <Link href="/goals" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              View All →
            </Link>
          </div>
          
          {state.goals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">No goals yet</p>
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
            <div className="space-y-3">
              {state.goals.slice(0, 4).map((goal) => {
                const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
                const contributions = getGoalContribution(state, goal.id);
                return (
                  <div key={goal.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: goal.color + '15' }}
                    >
                      {category?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-primary-400 transition-colors">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{goal.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">{contributions}</p>
                      <p className="text-[10px] text-gray-600">entries</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Entries</h2>
            <Link href="/journal" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              View All →
            </Link>
          </div>
          
          {recentEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">No entries yet</p>
              <Link
                href="/journal/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Write Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => {
                const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
                return (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                  >
                    <span className="text-xl">{mood?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-primary-400 transition-colors">{entry.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <span className="mx-1.5">·</span>
                        {entry.type}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Add CTA */}
      <div className="card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-pink-500/5" />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mb-2">Ready to make progress?</h3>
          <p className="text-gray-500 text-sm mb-6">Every entry brings you closer to your goals.</p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Write Today&apos;s Entry
          </Link>
        </div>
      </div>
    </div>
  );
}
