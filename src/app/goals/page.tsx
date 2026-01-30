'use client';

import { useEffect, useState } from 'react';
import { loadState, saveState, addGoal, updateGoal, deleteGoal } from '@/lib/storage';
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
    setMilestones(goal.milestones.map(m => m.title));
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
      // Update existing goal
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
      // Create new goal
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
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Goals</h1>
          <p className="text-gray-400 mt-1">Define and track your goals for the journey</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <span>+</span>
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Learn to speak Spanish fluently"
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this goal important to you?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* Category & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Goal['category'])}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    {GOAL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-gray-800">
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Milestones (optional)
                </label>
                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={milestone}
                        onChange={(e) => updateMilestoneField(index, e.target.value)}
                        placeholder={`Milestone ${index + 1}`}
                        className="flex-1 px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      />
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestoneField(index)}
                          className="px-3 py-2 text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMilestoneField}
                  className="mt-2 text-sm text-primary-400 hover:text-primary-300"
                >
                  + Add Milestone
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      {state.goals.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-white mb-2">No goals yet</h2>
          <p className="text-gray-400 mb-6">
            Start by creating your first goal. What do you want to achieve by 2031?
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <span>+</span>
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {state.goals.map((goal) => {
            const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
            const entriesCount = state.entries.filter(e => e.linkedGoals.includes(goal.id)).length;
            
            return (
              <div key={goal.id} className="glass rounded-xl p-6 card-hover">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: goal.color + '30' }}
                    >
                      {category?.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                      <p className="text-sm text-gray-500">{category?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Description */}
                {goal.description && (
                  <p className="text-gray-400 text-sm mb-4">{goal.description}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${goal.progress}%`,
                        backgroundColor: goal.color 
                      }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Milestones</p>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <label 
                          key={milestone.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={() => handleToggleMilestone(goal.id, milestone.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className={`text-sm ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-300 group-hover:text-white'}`}>
                            {milestone.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 text-xs text-gray-500">
                  <span>{entriesCount} journal entries</span>
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
