// Types for the 1796 Days application

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'career' | 'personal' | 'financial' | 'learning' | 'relationships';
  targetDate: string; // ISO date string
  createdAt: string;
  progress: number; // 0-100
  milestones: Milestone[];
  color: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string
  createdAt: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  linkedGoals: string[]; // Goal IDs
  tags: string[];
  type: 'journal' | 'blog' | 'reflection';
}

export interface DayProgress {
  date: string;
  journalEntries: number;
  goalsWorkedOn: string[];
  overallMood?: JournalEntry['mood'];
}

export interface AppState {
  goals: Goal[];
  entries: JournalEntry[];
  dayProgress: DayProgress[];
}

export const GOAL_CATEGORIES = [
  { value: 'health', label: 'Health & Fitness', emoji: '💪' },
  { value: 'career', label: 'Career & Work', emoji: '💼' },
  { value: 'personal', label: 'Personal Growth', emoji: '🌱' },
  { value: 'financial', label: 'Financial', emoji: '💰' },
  { value: 'learning', label: 'Learning & Skills', emoji: '📚' },
  { value: 'relationships', label: 'Relationships', emoji: '❤️' },
] as const;

export const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', emoji: '🌟', color: 'text-green-500' },
  { value: 'good', label: 'Good', emoji: '😊', color: 'text-green-400' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'text-yellow-500' },
  { value: 'bad', label: 'Bad', emoji: '😔', color: 'text-orange-500' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'text-red-500' },
] as const;

export const ENTRY_TYPES = [
  { value: 'journal', label: 'Daily Journal', description: 'Quick daily check-in' },
  { value: 'blog', label: 'Blog Post', description: 'Longer form writing' },
  { value: 'reflection', label: 'Reflection', description: 'Deep thoughts on progress' },
] as const;

export const GOAL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
];
