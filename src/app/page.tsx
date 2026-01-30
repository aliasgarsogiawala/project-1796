'use client';

import { useEffect, useState, useMemo } from 'react';
import { getDaysRemaining, getTimeProgress, loadState, getStreak, getGoalContribution } from '@/lib/storage';
import { AppState, GOAL_CATEGORIES, MOOD_OPTIONS } from '@/types';
import Link from 'next/link';
import ContributionGraph from '@/components/ContributionGraph';

const MOTIVATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
];

export default function Dashboard() {
  const [state, setState] = useState<AppState | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(1796);
  const [timeProgress, setTimeProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const quote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
    setDaysRemaining(getDaysRemaining());
    setTimeProgress(getTimeProgress());

    const interval = setInterval(() => {
      setDaysRemaining(getDaysRemaining());
      setTimeProgress(getTimeProgress());
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
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
  
  // Calculate mood distribution for the week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = state.entries.filter(e => new Date(e.date) >= weekAgo);
  const avgMood = weekEntries.length > 0 
    ? weekEntries.reduce((acc, e) => {
        const moodScore = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
        return acc + (moodScore[e.mood as keyof typeof moodScore] || 3);
      }, 0) / weekEntries.length
    : 0;

  const getMoodLabel = (score: number) => {
    if (score >= 4.5) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (score >= 3.5) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 2.5) return { label: 'Okay', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (score >= 1.5) return { label: 'Low', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { label: 'Needs attention', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const moodInfo = avgMood > 0 ? getMoodLabel(avgMood) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-purple-400 font-medium mb-1">Welcome back!</p>
          <h1 className="text-3xl font-bold text-white">
            {currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}
          </h1>
          <p className="text-gray-500 mt-1">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-white tracking-tight">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </p>
        </div>
      </div>

      {/* Hero Countdown Section */}
      <div className="card-glow p-8 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Main countdown */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-purple-400 font-medium">COUNTDOWN ACTIVE</span>
              </div>
              <div className="countdown-number pulse-glow inline-block">
                {daysRemaining.toLocaleString()}
              </div>
              <p className="text-xl text-gray-400 mt-2 font-medium">days until <span className="text-white">January 1, 2031</span></p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8">
              <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-4xl font-bold gradient-text">{daysElapsed}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Days Elapsed</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-4xl font-bold text-cyan-400">{timeProgress.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Journey Complete</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-4xl font-bold text-pink-400">{(daysRemaining / 7).toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Weeks Left</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-10">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-gray-400">Journey Progress</span>
              <span className="text-sm font-semibold text-white">{timeProgress.toFixed(2)}%</span>
            </div>
            <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full animate-progress relative"
                style={{ width: `${timeProgress}%` }}
              >
                <div className="absolute inset-0 shimmer" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-purple-500/50" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>2026</span>
              <span>2031</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card group hover:border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🔥</span>
            </div>
            <span className="badge badge-warning">Active</span>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{streak}</p>
          <p className="text-sm text-gray-500 mt-1">Day Streak</p>
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${Math.min(streak * 10, 100)}%` }} />
          </div>
        </div>

        <div className="stat-card group hover:border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">📝</span>
            </div>
            <span className="badge badge-primary">Total</span>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{state.entries.length}</p>
          <p className="text-sm text-gray-500 mt-1">Journal Entries</p>
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${Math.min(state.entries.length, 100)}%` }} />
          </div>
        </div>

        <div className="stat-card group hover:border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🎯</span>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{state.goals.length}</p>
          <p className="text-sm text-gray-500 mt-1">Goals Set</p>
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${Math.min(state.goals.length * 20, 100)}%` }} />
          </div>
        </div>

        <div className="stat-card group hover:border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">✨</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${moodInfo?.bg || 'bg-gray-500/10'} ${moodInfo?.color || 'text-gray-400'} font-medium`}>
              {moodInfo?.label || 'No data'}
            </span>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{todayEntries.length}</p>
          <p className="text-sm text-gray-500 mt-1">Today&apos;s Entries</p>
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${todayEntries.length > 0 ? 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="quote-card">
        <p className="text-xl text-white font-medium leading-relaxed relative z-10">{quote.text}</p>
        <p className="text-sm text-purple-400 mt-4 font-medium">— {quote.author}</p>
      </div>

      {/* Activity Graph */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Activity Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Your journaling activity over time</p>
          </div>
          <Link 
            href="/timeline" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            View Timeline
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <ContributionGraph entries={state.entries} weeks={26} colorScheme="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Your Goals</h2>
              <p className="text-sm text-gray-500 mt-1">{state.goals.length} active goals</p>
            </div>
            <Link 
              href="/goals" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Manage
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {state.goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎯</span>
              </div>
              <p className="text-gray-400 mb-1">No goals yet</p>
              <p className="text-gray-600 text-sm mb-6">Start by setting your first goal</p>
              <Link
                href="/goals"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all"
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
                  <Link 
                    key={goal.id} 
                    href="/goals"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.05] transition-all group cursor-pointer"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: goal.color + '20' }}
                    >
                      {category?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold truncate group-hover:text-purple-400 transition-colors">{goal.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-semibold">{goal.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-white">{contributions}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">entries</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Recent Entries</h2>
              <p className="text-sm text-gray-500 mt-1">{state.entries.length} total entries</p>
            </div>
            <Link 
              href="/journal" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {recentEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <p className="text-gray-400 mb-1">No entries yet</p>
              <p className="text-gray-600 text-sm mb-6">Start documenting your journey</p>
              <Link
                href="/journal/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all"
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
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.05] transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {mood?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold truncate group-hover:text-purple-400 transition-colors">{entry.title}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="capitalize">{entry.type}</span>
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="card-glow p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-pink-500/5" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Ready to make progress?</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Every entry brings you closer to your goals. Document your journey and watch yourself transform.</p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Write Today&apos;s Entry
          </Link>
        </div>
      </div>
    </div>
  );
}
