'use client';

import { useMemo } from 'react';
import { JournalEntry, MOOD_OPTIONS } from '@/types';

interface ContributionGraphProps {
  entries: JournalEntry[];
  weeks?: number;
}

export default function ContributionGraph({ entries, weeks = 52 }: ContributionGraphProps) {
  const { cells, months, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a map of entries by date
    const entriesByDate = new Map<string, JournalEntry[]>();
    entries.forEach(entry => {
      const dateKey = entry.date.split('T')[0];
      if (!entriesByDate.has(dateKey)) {
        entriesByDate.set(dateKey, []);
      }
      entriesByDate.get(dateKey)!.push(entry);
    });

    // Calculate the start date (go back 'weeks' weeks, starting from the last Saturday)
    const startDate = new Date(today);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek - (weeks * 7) + 1);

    // Generate all cells
    const cells: { date: string; count: number; mood?: string; isToday: boolean; isFuture: boolean }[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    
    let currentMonth = -1;
    let totalDays = weeks * 7;
    
    // Create 7 rows (for each day of week)
    for (let row = 0; row < 7; row++) {
      cells[row] = [];
    }
    
    for (let col = 0; col < weeks; col++) {
      for (let row = 0; row < 7; row++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + col * 7 + row);
        const dateKey = cellDate.toISOString().split('T')[0];
        const dayEntries = entriesByDate.get(dateKey) || [];
        const isToday = dateKey === today.toISOString().split('T')[0];
        const isFuture = cellDate > today;
        
        // Track month changes
        if (row === 0 && cellDate.getMonth() !== currentMonth) {
          currentMonth = cellDate.getMonth();
          monthLabels.push({
            label: cellDate.toLocaleDateString('en-US', { month: 'short' }),
            col: col
          });
        }
        
        cells[row].push({
          date: dateKey,
          count: dayEntries.length,
          mood: dayEntries.length > 0 ? dayEntries[0].mood : undefined,
          isToday,
          isFuture
        });
      }
    }

    // Calculate stats
    const daysWithEntries = new Set(entries.map(e => e.date.split('T')[0])).size;
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

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Month labels */}
      <div className="flex mb-2 ml-8">
        {months.map((month, i) => (
          <div
            key={i}
            className="text-xs text-gray-500"
            style={{ 
              position: 'relative',
              left: `${month.col * 15}px`,
              marginRight: i < months.length - 1 ? `${(months[i + 1]?.col - month.col - 1) * 15}px` : 0
            }}
          >
            {month.label}
          </div>
        ))}
      </div>
      
      {/* Graph */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-2">
          {dayLabels.map((day, i) => (
            <div 
              key={day} 
              className="text-[10px] text-gray-500 h-3 flex items-center"
              style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Cells */}
        <div className="flex gap-[3px] overflow-x-auto pb-2">
          {cells[0].map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-[3px]">
              {cells.map((row, rowIndex) => {
                const cell = row[colIndex];
                if (!cell) return null;
                
                const level = getLevel(cell.count);
                const mood = cell.mood;
                
                return (
                  <div
                    key={`${colIndex}-${rowIndex}`}
                    className={`
                      w-3 h-3 rounded-sm transition-all cursor-pointer
                      ${cell.isFuture ? 'bg-[#161b22]' : ''}
                      ${cell.isToday ? 'ring-1 ring-white ring-offset-1 ring-offset-[#0a0a0a]' : ''}
                    `}
                    data-level={cell.isFuture ? undefined : level}
                    data-mood={!cell.isFuture && mood ? mood : undefined}
                    style={!cell.isFuture && !mood ? {
                      background: level === 0 ? '#161b22' :
                                 level === 1 ? '#0e4429' :
                                 level === 2 ? '#006d32' :
                                 level === 3 ? '#26a641' : '#39d353'
                    } : !cell.isFuture && mood ? {
                      background: mood === 'great' ? '#10b981' :
                                 mood === 'good' ? '#34d399' :
                                 mood === 'okay' ? '#fbbf24' :
                                 mood === 'bad' ? '#f97316' : '#ef4444'
                    } : undefined}
                    title={`${cell.date}: ${cell.count} ${cell.count === 1 ? 'entry' : 'entries'}${mood ? ` (${mood})` : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>{stats.totalEntries} entries in the last year</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm" style={{ background: '#161b22' }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: '#0e4429' }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: '#006d32' }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: '#26a641' }} />
          <div className="w-3 h-3 rounded-sm" style={{ background: '#39d353' }} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
