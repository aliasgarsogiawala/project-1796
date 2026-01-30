'use client';

import { useEffect, useState } from 'react';
import { getDaysRemaining, getTimeProgress, loadState, getStreak, getGoalContribution } from '@/lib/storage';
import { AppState, GOAL_CATEGORIES, MOOD_OPTIONS } from '@/types';
import Link from 'next/link';

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

    // Update countdown every minute
    const interval = setInterval(() => {
      setDaysRemaining(getDaysRemaining());
      setTimeProgress(getTimeProgress());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const streak = getStreak(state);
  const todayEntries = state.entries.filter(e => 
    e.date.startsWith(new Date().toISOString().split('T')[0])
  );
  const recentEntries = state.entries.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your progress towards January 1, 2031</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg text-white">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Countdown Hero */}
      <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10" />
        <div className="relative z-10">
          <p className="text-gray-400 mb-2">Days Remaining</p>
          <div className="text-7xl font-bold gradient-text mb-4 pulse-glow inline-block px-8 py-2 rounded-xl">
            {daysRemaining.toLocaleString()}
          </div>
          <p className="text-gray-500 mb-6">until January 1, 2031</p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Started</span>
              <span>{timeProgress.toFixed(1)}% Complete</span>
              <span>2031</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-progress"
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6 card-hover">
          <div className="text-3xl mb-2">🔥</div>
          <p className="text-2xl font-bold text-white">{streak}</p>
          <p className="text-sm text-gray-400">Day Streak</p>
        </div>
        <div className="glass rounded-xl p-6 card-hover">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-2xl font-bold text-white">{state.entries.length}</p>
          <p className="text-sm text-gray-400">Total Entries</p>
        </div>
        <div className="glass rounded-xl p-6 card-hover">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-2xl font-bold text-white">{state.goals.length}</p>
          <p className="text-sm text-gray-400">Active Goals</p>
        </div>
        <div className="glass rounded-xl p-6 card-hover">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-2xl font-bold text-white">{todayEntries.length}</p>
          <p className="text-sm text-gray-400">Today&apos;s Entries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals Overview */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Goals</h2>
            <Link href="/goals" className="text-primary-400 hover:text-primary-300 text-sm">
              View All →
            </Link>
          </div>
          
          {state.goals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-gray-400 mb-4">No goals yet. Start by setting your first goal!</p>
              <Link
                href="/goals"
                className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
              >
                Add Goal
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {state.goals.slice(0, 4).map((goal) => {
                const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
                const contributions = getGoalContribution(state, goal.id);
                return (
                  <div key={goal.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: goal.color + '30' }}
                    >
                      {category?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${goal.progress}%`,
                              backgroundColor: goal.color 
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{goal.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{contributions} entries</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Entries</h2>
            <Link href="/journal" className="text-primary-400 hover:text-primary-300 text-sm">
              View All →
            </Link>
          </div>
          
          {recentEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-400 mb-4">No entries yet. Start journaling your journey!</p>
              <Link
                href="/journal/new"
                className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
              >
                Write Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
                return (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{mood?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{entry.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                          {' · '}
                          {entry.type}
                          {entry.linkedGoals.length > 0 && (
                            <span> · {entry.linkedGoals.length} goals</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Add CTA */}
      <div className="glass rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Ready to make progress?</h3>
        <p className="text-gray-400 mb-4">Every entry brings you closer to your goals.</p>
        <Link
          href="/journal/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <span>+</span>
          <span>Write Today&apos;s Entry</span>
        </Link>
      </div>
    </div>
  );
}
