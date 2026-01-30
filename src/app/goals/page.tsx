'use client';

import { useEffect, useState } from 'react';
import { loadState, addGoal, updateGoal, deleteGoal } from '@/lib/storage';
import { AppState, Goal, GOAL_CATEGORIES, GOAL_COLORS, Milestone } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function GoalsPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Goal['category']>('personal');
  const [targetDate, setTargetDate] = useState('2031-01-01');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [milestones, setMilestones] = useState<string[]>(['']);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('personal');
    setTargetDate('2031-01-01');
    setColor(GOAL_COLORS[0]);
    setMilestones(['']);
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description);
    setCategory(goal.category);
    setTargetDate(goal.targetDate.split('T')[0]);
    setColor(goal.color);
    setMilestones(goal.milestones.length > 0 ? goal.milestones.map(m => m.title) : ['']);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !title.trim()) return;

    const goalMilestones: Milestone[] = milestones
      .filter(m => m.trim())
      .map(m => ({
        id: uuidv4(),
        title: m.trim(),
        completed: false,
      }));

    if (editingGoal) {
      const updatedState = updateGoal(state, editingGoal.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        color,
        milestones: goalMilestones,
      });
      setState(updatedState);
    } else {
      const newGoal: Goal = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        createdAt: new Date().toISOString(),
        progress: 0,
        milestones: goalMilestones,
        color,
      };
      const newState = addGoal(state, newGoal);
      setState(newState);
    }

    resetForm();
  };

  const handleDelete = (goalId: string) => {
    if (!state) return;
    if (confirm('Are you sure you want to delete this goal?')) {
      const newState = deleteGoal(state, goalId);
      setState(newState);
    }
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    if (!state) return;
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m => 
      m.id === milestoneId 
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
        : m
    );

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = updatedMilestones.length > 0 
      ? Math.round((completedCount / updatedMilestones.length) * 100)
      : 0;

    const updatedState = updateGoal(state, goalId, {
      milestones: updatedMilestones,
      progress,
    });
    setState(updatedState);
  };

  const addMilestoneField = () => {
    setMilestones([...milestones, '']);
  };

  const updateMilestoneField = (index: number, value: string) => {
    const updated = [...milestones];
    updated[index] = value;
    setMilestones(updated);
  };

  const removeMilestoneField = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  if (!mounted || !state) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-gray-500 mt-1">Define and track what you want to achieve by 2031</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Learn to speak Spanish fluently"
                  className="input"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this goal important to you?"
                  rows={3}
                  className="input resize-none"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Goal['category'])}
                    className="input"
                  >
                    {GOAL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-[#111]">
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Color</label>
                <div className="flex gap-3 flex-wrap">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#111]' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Milestones</label>
                <p className="text-xs text-gray-600 mb-3">Break down your goal into smaller achievable steps</p>
                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={milestone}
                        onChange={(e) => updateMilestoneField(index, e.target.value)}
                        placeholder={`Milestone ${index + 1}`}
                        className="input flex-1"
                      />
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestoneField(index)}
                          className="px-3 py-2 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMilestoneField}
                  className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Milestone
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#1a1a1a]">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      {state.goals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No goals yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start by creating your first goal. What do you want to achieve by January 1, 2031?
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
          {state.goals.map((goal) => {
            const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
            const entriesCount = state.entries.filter(e => e.linkedGoals.includes(goal.id)).length;
            const completedMilestones = goal.milestones.filter(m => m.completed).length;
            
            return (
              <div key={goal.id} className="card p-6 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: goal.color + '15' }}
                    >
                      {category?.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">{goal.title}</h3>
                      <p className="text-xs text-gray-500">{category?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Description */}
                {goal.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{goal.description}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-white font-medium">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500">Milestones</p>
                      <p className="text-xs text-gray-600">{completedMilestones}/{goal.milestones.length}</p>
                    </div>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <label 
                          key={milestone.id}
                          className="flex items-center gap-3 cursor-pointer group/item p-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={milestone.completed}
                              onChange={() => handleToggleMilestone(goal.id, milestone.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              milestone.completed 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-600 group-hover/item:border-gray-500'
                            }`}>
                              {milestone.completed && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className={`text-sm transition-colors ${
                            milestone.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-300 group-hover/item:text-white'
                          }`}>
                            {milestone.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a] text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {entriesCount} entries
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
