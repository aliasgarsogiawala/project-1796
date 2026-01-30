'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, addEntry } from '@/lib/storage';
import { AppState, JournalEntry, MOOD_OPTIONS, ENTRY_TYPES, GOAL_CATEGORIES } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

export default function NewEntryPage() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('okay');
  const [type, setType] = useState<JournalEntry['type']>('journal');
  const [linkedGoals, setLinkedGoals] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const entry: JournalEntry = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      date: new Date(date).toISOString(),
      createdAt: new Date().toISOString(),
      mood,
      linkedGoals,
      tags,
      type,
    };

    addEntry(state, entry);
    router.push('/journal');
  };

  const toggleGoal = (goalId: string) => {
    setLinkedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">New Entry</h1>
          <p className="text-gray-500 mt-1">Document your thoughts and progress</p>
        </div>
        <Link
          href="/journal"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Journal
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entry Type */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Entry Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            {ENTRY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value as JournalEntry['type'])}
                className={`p-5 rounded-2xl text-left transition-all border-2 ${
                  type === t.value
                    ? 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/50'
                    : 'bg-white/[0.02] border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {t.value === 'journal' ? '📝' : t.value === 'blog' ? '📰' : '💭'}
                  </span>
                  <span className={`font-semibold ${type === t.value ? 'text-white' : 'text-gray-300'}`}>
                    {t.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            How are you feeling?
          </label>
          <div className="flex gap-3 justify-center">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value as JournalEntry['mood'])}
                className={`flex flex-col items-center p-5 rounded-2xl transition-all ${
                  mood === m.value
                    ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 ring-2 ring-purple-500/50 scale-105'
                    : 'bg-white/[0.02] hover:bg-white/5'
                }`}
              >
                <span className="text-4xl mb-2">{m.emoji}</span>
                <span className={`text-xs font-medium ${mood === m.value ? 'text-white' : 'text-gray-500'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title & Date & Content */}
        <div className="card p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, progress, reflections..."
              rows={12}
              className="input resize-none"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="productivity, morning routine, wins (comma-separated)"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
          </div>
        </div>

        {/* Link to Goals */}
        {state.goals.length > 0 && (
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link to Goals
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Connect this entry to goals you worked on or made progress towards.
            </p>
            <div className="flex flex-wrap gap-3">
              {state.goals.map((goal) => {
                const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
                const isSelected = linkedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-offset-[#0d0d14]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: goal.color + (isSelected ? '30' : '15'),
                      color: isSelected ? goal.color : '#999',
                      ['--tw-ring-color' as string]: isSelected ? goal.color : undefined
                    }}
                  >
                    <span>{category?.emoji}</span>
                    <span>{goal.title}</span>
                    {isSelected && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/journal" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Entry
          </button>
        </div>
      </form>
    </div>
  );
}
