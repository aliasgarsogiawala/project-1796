'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadState, updateEntry, deleteEntry, formatDate } from '@/lib/storage';
import { AppState, JournalEntry, MOOD_OPTIONS, ENTRY_TYPES } from '@/types';
import Link from 'next/link';

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<JournalEntry['mood']>('okay');
  const [editLinkedGoals, setEditLinkedGoals] = useState<string[]>([]);
  const [editTagsInput, setEditTagsInput] = useState('');

  useEffect(() => {
    setMounted(true);
    const loadedState = loadState();
    setState(loadedState);
    
    const foundEntry = loadedState.entries.find(e => e.id === params.id);
    if (foundEntry) {
      setEntry(foundEntry);
      setEditTitle(foundEntry.title);
      setEditContent(foundEntry.content);
      setEditMood(foundEntry.mood);
      setEditLinkedGoals(foundEntry.linkedGoals);
      setEditTagsInput(foundEntry.tags.join(', '));
    }
  }, [params.id]);

  const handleDelete = () => {
    if (!state || !entry) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(state, entry.id);
      router.push('/journal');
    }
  };

  const handleSaveEdit = () => {
    if (!state || !entry || !editTitle.trim() || !editContent.trim()) return;

    const tags = editTagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const updatedState = updateEntry(state, entry.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      mood: editMood,
      linkedGoals: editLinkedGoals,
      tags,
    });

    setState(updatedState);
    const updatedEntry = updatedState.entries.find(e => e.id === entry.id);
    if (updatedEntry) {
      setEntry(updatedEntry);
    }
    setIsEditing(false);
  };

  const toggleGoal = (goalId: string) => {
    setEditLinkedGoals(prev => 
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

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-white mb-2">Entry not found</h2>
        <p className="text-gray-400 mb-6">This entry may have been deleted.</p>
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
        >
          ← Back to Journal
        </Link>
      </div>
    );
  }

  const mood = MOOD_OPTIONS.find(m => m.value === entry.mood);
  const entryType = ENTRY_TYPES.find(t => t.value === entry.type);
  const linkedGoals = state.goals.filter(g => entry.linkedGoals.includes(g.id));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/journal"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Journal
        </Link>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-primary-400 hover:text-primary-300 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Mood */}
          <div className="glass rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Mood
            </label>
            <div className="flex gap-4 justify-center">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setEditMood(m.value as JournalEntry['mood'])}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    editMood === m.value
                      ? 'bg-white/10 scale-110'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-3xl mb-1">{m.emoji}</span>
                  <span className={`text-xs ${editMood === m.value ? 'text-white' : 'text-gray-500'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Content */}
          <div className="glass rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Link to Goals */}
          {state.goals.length > 0 && (
            <div className="glass rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Linked Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {state.goals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      editLinkedGoals.includes(goal.id)
                        ? 'ring-2 ring-offset-2 ring-offset-gray-900'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: goal.color + (editLinkedGoals.includes(goal.id) ? '40' : '20'),
                      color: goal.color,
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
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || !editContent.trim()}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <article className="space-y-6">
          {/* Entry Header */}
          <div className="glass rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{mood?.emoji}</span>
              <div>
                <p className="text-sm text-gray-500">
                  {entryType?.label} · {formatDate(entry.date)}
                </p>
                <h1 className="text-2xl font-bold text-white mt-1">{entry.title}</h1>
              </div>
            </div>

            {/* Tags */}
            {(entry.tags.length > 0 || linkedGoals.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {entry.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
                {linkedGoals.map((goal) => (
                  <Link
                    key={goal.id}
                    href="/goals"
                    className="px-3 py-1 rounded-full text-sm hover:opacity-80 transition-opacity"
                    style={{ 
                      backgroundColor: goal.color + '20',
                      color: goal.color 
                    }}
                  >
                    🎯 {goal.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="text-center text-sm text-gray-500">
            Created {formatDate(entry.createdAt)}
          </div>
        </article>
      )}
    </div>
  );
}
