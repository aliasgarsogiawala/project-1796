'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadState, addEntry } from '@/lib/storage';
import { AppState, JournalEntry, MOOD_OPTIONS, ENTRY_TYPES } from '@/types';
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

    const newState = addEntry(state, entry);
    setState(newState);
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">New Entry</h1>
          <p className="text-gray-400 mt-1">Document your thoughts and progress</p>
        </div>
        <Link
          href="/journal"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Journal
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entry Type */}
        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Entry Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {ENTRY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value as JournalEntry['type'])}
                className={`p-4 rounded-lg border text-left transition-all ${
                  type === t.value
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 bg-white/5 hover:border-gray-600'
                }`}
              >
                <p className="font-medium text-white">{t.label}</p>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            How are you feeling?
          </label>
          <div className="flex gap-4 justify-center">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value as JournalEntry['mood'])}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  mood === m.value
                    ? 'bg-white/10 scale-110'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className={`text-xs ${mood === m.value ? 'text-white' : 'text-gray-500'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title & Date */}
        <div className="glass rounded-xl p-6 space-y-4">
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
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
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
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
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
              rows={10}
              className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="productivity, morning routine, wins..."
              className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Link to Goals */}
        {state.goals.length > 0 && (
          <div className="glass rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Link to Goals (optional)
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Connect this entry to goals you worked on or made progress towards.
            </p>
            <div className="flex flex-wrap gap-2">
              {state.goals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    linkedGoals.includes(goal.id)
                      ? 'ring-2 ring-offset-2 ring-offset-gray-900'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: goal.color + (linkedGoals.includes(goal.id) ? '40' : '20'),
                    color: goal.color,
                    ...(linkedGoals.includes(goal.id) && { ringColor: goal.color })
                  }}
                >
                  🎯 {goal.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/journal"
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim()}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>
        </div>
      </form>
    </div>
  );
}
