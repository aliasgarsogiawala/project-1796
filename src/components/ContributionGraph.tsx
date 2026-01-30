'use client';

import { useMemo, useState } from 'react';
import { JournalEntry, MOOD_OPTIONS } from '@/types';

interface ContributionGraphProps {
  entries: JournalEntry[];
  weeks?: number;
  showLegend?: boolean;
  colorScheme?: 'green' | 'mood' | 'purple' | 'blue';
}

export default function ContributionGraph({ 
  entries, 
  weeks = 52, 
  showLegend = true,
  colorScheme = 'purple'
}: ContributionGraphProps) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; mood?: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { cells, months, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Create a map of entries by date - use the date part only
    const entriesByDate = new Map<string, JournalEntry[]>();
    entries.forEach(entry => {
      const dateKey = new Date(entry.date).toISOString().split('T')[0];
      if (!entriesByDate.has(dateKey)) {
        entriesByDate.set(dateKey, []);
      }
      entriesByDate.get(dateKey)!.push(entry);
    });

    // Calculate the start date (go back 'weeks' weeks from today)
    const startDate = new Date(today);
    const dayOfWeek = startDate.getDay();
    // Go to the start of this week, then back the specified weeks
    startDate.setDate(startDate.getDate() - dayOfWeek - ((weeks - 1) * 7));
    startDate.setHours(0, 0, 0, 0);

    // Generate all cells
    const cells: { date: string; count: number; mood?: string; isToday: boolean; isFuture: boolean }[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    
    let currentMonth = -1;
    
    // Create 7 rows (for each day of week)
    for (let row = 0; row < 7; row++) {
      cells[row] = [];
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    for (let col = 0; col < weeks; col++) {
      for (let row = 0; row < 7; row++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + col * 7 + row);
        const dateKey = cellDate.toISOString().split('T')[0];
        const dayEntries = entriesByDate.get(dateKey) || [];
        const isToday = dateKey === todayStr;
        const isFuture = cellDate > today;
        
        // Track month changes
        if (row === 0 && cellDate.getMonth() !== currentMonth) {
          currentMonth = cellDate.getMonth();
          monthLabels.push({
            label: cellDate.toLocaleDateString('en-US', { month: 'short' }),
            col: col
          });
        }
        
        // Get the primary mood for the day (most recent entry)
        const primaryMood = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1].mood : undefined;
        
        cells[row].push({
          date: dateKey,
          count: dayEntries.length,
          mood: primaryMood,
          isToday,
          isFuture
        });
      }
    }

    // Calculate stats
    const daysWithEntries = entriesByDate.size;
    const totalEntries = entries.length;
    
    return { cells, months: monthLabels, stats: { daysWithEntries, totalEntries } };
  }, [entries, weeks]);

  const getLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  const getColor = (level: number, mood?: string) => {
    if (colorScheme === 'mood' && mood) {
      const moodColors: Record<string, string> = {
        'great': '#10b981',
        'good': '#34d399',
        'okay': '#fbbf24',
        'bad': '#f97316',
        'terrible': '#ef4444'
      };
      return moodColors[mood] || '#8b5cf6';
    }
    
    const schemes: Record<string, string[]> = {
      green: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
      purple: ['#1a1625', '#2d1f4e', '#4c2889', '#7c3aed', '#a78bfa'],
      blue: ['#161b22', '#0c2d48', '#0a4f76', '#0ea5e9', '#38bdf8'],
      mood: ['#1a1625', '#2d1f4e', '#4c2889', '#7c3aed', '#a78bfa']
    };
    
    return schemes[colorScheme][level];
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const handleMouseEnter = (cell: typeof cells[0][0], e: React.MouseEvent) => {
    if (!cell.isFuture) {
      setHoveredCell(cell);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };

  return (
    <div className="w-full relative">
      {/* Tooltip */}
      {hoveredCell && (
        <div 
          className="fixed z-50 px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <p className="text-white font-medium">{hoveredCell.count} {hoveredCell.count === 1 ? 'entry' : 'entries'}</p>
          <p className="text-gray-400">{new Date(hoveredCell.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
          {hoveredCell.mood && (
            <p className="text-gray-400 mt-1">Mood: {MOOD_OPTIONS.find(m => m.value === hoveredCell.mood)?.emoji} {hoveredCell.mood}</p>
          )}
        </div>
      )}

      {/* Month labels */}
      <div className="flex mb-2 ml-8 text-[10px] text-gray-500">
        {months.map((month, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `calc(32px + ${month.col * 14}px)` }}
          >
            {month.label}
          </div>
        ))}
      </div>
      
      {/* Graph */}
      <div className="flex gap-[3px] mt-6">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1 shrink-0">
          {dayLabels.map((day, i) => (
            <div 
              key={i} 
              className="text-[10px] text-gray-500 h-[11px] w-6 flex items-center"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Cells */}
        <div className="flex gap-[3px] overflow-x-auto scrollbar-none">
          {cells[0]?.map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-[3px]">
              {cells.map((row, rowIndex) => {
                const cell = row[colIndex];
                if (!cell) return null;
                
                const level = getLevel(cell.count);
                
                return (
                  <div
                    key={`${colIndex}-${rowIndex}`}
                    className={`
                      w-[11px] h-[11px] rounded-[3px] transition-all duration-150 cursor-pointer
                      ${cell.isFuture ? 'bg-white/[0.02]' : 'hover:ring-2 hover:ring-white/30 hover:ring-offset-1 hover:ring-offset-[#0a0a0a] hover:scale-125'}
                      ${cell.isToday ? 'ring-2 ring-primary-400 ring-offset-1 ring-offset-[#0a0a0a]' : ''}
                    `}
                    style={!cell.isFuture ? { backgroundColor: getColor(level, colorScheme === 'mood' ? cell.mood : undefined) } : undefined}
                    onMouseEnter={(e) => handleMouseEnter(cell, e)}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-between mt-4 text-[11px] text-gray-500">
          <span className="font-medium">{stats.totalEntries} contributions in {stats.daysWithEntries} days</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div 
                key={level}
                className="w-[11px] h-[11px] rounded-[3px]" 
                style={{ backgroundColor: getColor(level) }} 
              />
            ))}
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
