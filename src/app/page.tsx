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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading...</span>
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
    if (score >= 4.5) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (score >= 3.5) return { label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
    if (score >= 2.5) return { label: 'Okay', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    if (score >= 1.5) return { label: 'Low', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    return { label: 'Needs Attention', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  const moodInfo = avgMood > 0 ? getMoodLabel(avgMood) : null;

  return (
    <div className="space-y-6 fade-in">
      
      {/* Hero Countdown Section */}
      <div className="card-accent p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Countdown Active</span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div className="text-6xl lg:text-7xl font-bold text-white tracking-tight">
              {daysRemaining.toLocaleString()}
            </div>
            <p className="text-lg text-slate-400 mt-2">
              days until <span className="text-white font-semibold">January 1, 2031</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1a1a25] p-4 rounded-xl border border-white/10 text-center">
              <p className="text-3xl font-bold text-white">{daysElapsed}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Days Elapsed</p>
            </div>
            <div className="bg-[#1a1a25] p-4 rounded-xl border border-white/10 text-center">
              <p className="text-3xl font-bold text-cyan-400">{timeProgress.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Complete</p>
            </div>
            <div className="bg-[#1a1a25] p-4 rounded-xl border border-white/10 text-center">
              <p className="text-3xl font-bold text-blue-400">{Math.floor(daysRemaining / 7)}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Weeks Left</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-slate-400">Journey Progress</span>
            <span className="text-white font-semibold">{timeProgress.toFixed(2)}%</span>
          </div>
          <div className="h-3 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${timeProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            <span>2026</span>
            <span>2031</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
            <span className="badge badge-orange">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{streak}</p>
          <p className="text-sm text-slate-400 mt-1">Day Streak</p>
          <div className="mt-3 h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${Math.min(streak * 10, 100)}%` }} />
          </div>
        </div>

        <div className="card p-5 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <span className="badge badge-cyan">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{state.entries.length}</p>
          <p className="text-sm text-slate-400 mt-1">Journal Entries</p>
          <div className="mt-3 h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${Math.min(state.entries.length, 100)}%` }} />
          </div>
        </div>

        <div className="card p-5 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{state.goals.length}</p>
          <p className="text-sm text-slate-400 mt-1">Goals Set</p>
          <div className="mt-3 h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min(state.goals.length * 20, 100)}%` }} />
          </div>
        </div>

        <div className="card p-5 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            {moodInfo && (
              <span className={`text-xs px-2 py-1 rounded-full ${moodInfo.bg} ${moodInfo.color} border ${moodInfo.border}`}>
                {moodInfo.label}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-white">{todayEntries.length}</p>
          <p className="text-sm text-slate-400 mt-1">Today&apos;s Entries</p>
          <div className="mt-3 h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${todayEntries.length > 0 ? 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Quote Card */}
      <div className="card p-6 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
        <p className="text-lg text-slate-200 italic">&ldquo;{quote.text}&rdquo;</p>
        <p className="text-sm text-cyan-400 mt-3">— {quote.author}</p>
      </div>

      {/* Activity Graph */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Activity Overview</h2>
            <p className="text-sm text-slate-400 mt-1">Your journaling activity over time</p>
          </div>
          <Link 
            href="/timeline" 
            className="btn-secondary text-sm py-2 px-4"
          >
            View Timeline
          </Link>
        </div>
        <ContributionGraph entries={state.entries} weeks={26} colorScheme="blue" />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Your Goals</h2>
              <p className="text-sm text-slate-400 mt-1">{state.goals.length} active goals</p>
            </div>
            <Link 
              href="/goals" 
              className="btn-secondary text-sm py-2 px-4"
            >
              Manage
            </Link>
          </div>
          
          {state.goals.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <p className="text-slate-400 mb-1">No goals yet</p>
              <p className="text-slate-500 text-sm mb-4">Start by setting your first goal</p>
              <Link
                href="/goals"
                className="btn-primary text-sm"
              >
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
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a25] hover:bg-[#1f1f2e] border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: goal.color + '20' }}
                    >
                      {category?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-cyan-400 transition-colors">{goal.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">{goal.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-white">{contributions}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">entries</p>
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
              <p className="text-sm text-slate-400 mt-1">{state.entries.length} total entries</p>
            </div>
            <Link 
              href="/journal" 
              className="btn-secondary text-sm py-2 px-4"
            >
              View All
            </Link>
          </div>
          
          {recentEntries.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-slate-400 mb-1">No entries yet</p>
              <p className="text-slate-500 text-sm mb-4">Start documenting your journey</p>
              <Link
                href="/journal/new"
                className="btn-primary text-sm"
              >
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
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a25] hover:bg-[#1f1f2e] border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                      {mood?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-cyan-400 transition-colors">{entry.title}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="capitalize">{entry.type}</span>
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="card p-8 text-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Ready to make progress?</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">Every entry brings you closer to your goals. Document your journey and watch yourself transform.</p>
        <Link
          href="/journal/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Write Today&apos;s Entry
        </Link>
      </div>
    </div>
  );
}
