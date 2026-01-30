import { AppState, Goal, JournalEntry, DayProgress } from '@/types';

const STORAGE_KEY = '1796-days-data';

export const getDefaultState = (): AppState => ({
  goals: [],
  entries: [],
  dayProgress: [],
});

export const loadState = (): AppState => {
  if (typeof window === 'undefined') return getDefaultState();
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return getDefaultState();
};

export const saveState = (state: AppState): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

export const addGoal = (state: AppState, goal: Goal): AppState => {
  const newState = { ...state, goals: [...state.goals, goal] };
  saveState(newState);
  return newState;
};

export const updateGoal = (state: AppState, goalId: string, updates: Partial<Goal>): AppState => {
  const newState = {
    ...state,
    goals: state.goals.map(g => g.id === goalId ? { ...g, ...updates } : g),
  };
  saveState(newState);
  return newState;
};

export const deleteGoal = (state: AppState, goalId: string): AppState => {
  const newState = {
    ...state,
    goals: state.goals.filter(g => g.id !== goalId),
    entries: state.entries.map(e => ({
      ...e,
      linkedGoals: e.linkedGoals.filter(id => id !== goalId),
    })),
  };
  saveState(newState);
  return newState;
};

export const addEntry = (state: AppState, entry: JournalEntry): AppState => {
  const newState = { ...state, entries: [entry, ...state.entries] };
  saveState(newState);
  return newState;
};

export const updateEntry = (state: AppState, entryId: string, updates: Partial<JournalEntry>): AppState => {
  const newState = {
    ...state,
    entries: state.entries.map(e => e.id === entryId ? { ...e, ...updates } : e),
  };
  saveState(newState);
  return newState;
};

export const deleteEntry = (state: AppState, entryId: string): AppState => {
  const newState = {
    ...state,
    entries: state.entries.filter(e => e.id !== entryId),
  };
  saveState(newState);
  return newState;
};

// Calculate days remaining until target date
export const getDaysRemaining = (targetDate: string = '2031-01-01'): number => {
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate progress percentage based on days elapsed
export const getTimeProgress = (): number => {
  const startDate = new Date(); // Today
  const endDate = new Date('2031-01-01');
  const totalDays = 1796;
  const daysRemaining = getDaysRemaining();
  const daysElapsed = totalDays - daysRemaining;
  return Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));
};

// Get entries for a specific date
export const getEntriesForDate = (state: AppState, date: string): JournalEntry[] => {
  return state.entries.filter(e => e.date.startsWith(date.split('T')[0]));
};

// Calculate goal contribution from entries
export const getGoalContribution = (state: AppState, goalId: string): number => {
  const linkedEntries = state.entries.filter(e => e.linkedGoals.includes(goalId));
  return linkedEntries.length;
};

// Get streak (consecutive days with entries)
export const getStreak = (state: AppState): number => {
  if (state.entries.length === 0) return 0;
  
  const sortedDates = [...new Set(state.entries.map(e => e.date.split('T')[0]))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (sortedDates.includes(checkDateStr)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Format date for display
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
};
