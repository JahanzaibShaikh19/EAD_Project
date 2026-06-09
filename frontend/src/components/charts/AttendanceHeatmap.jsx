import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns';

const STATUS_COLORS = {
  present:  { bg: 'transparent', dot: '#10B981', label: 'Present' },
  absent:   { bg: 'transparent', dot: '#EF4444', label: 'Absent' },
  late:     { bg: 'transparent', dot: '#F59E0B', label: 'Late' },
  'on-leave': { bg: 'transparent', dot: '#3B82F6', label: 'On Leave' },
  holiday:  { bg: 'transparent', dot: '#9CA3AF', label: 'Holiday' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Monthly attendance calendar heatmap
 * @param {Array<{work_date, status}>} records - attendance records
 * @param {Date} [month] - month to display (default: current)
 */
export default function AttendanceHeatmap({ records = [], month = new Date(), isAggregated = false }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Build a map of date → status OR aggregated data
  const dataMap = {};
  records.forEach((r) => {
    if (r.work_date) {
      dataMap[r.work_date.substring(0, 10)] = isAggregated ? r : r.status;
    }
  });

  const getIntensityColor = (presentCount, totalCount) => {
    if (!totalCount || totalCount === 0) return 'transparent';
    const percentage = presentCount / totalCount;
    if (percentage === 0) return 'var(--color-surface-hover)'; // essentially empty
    if (percentage <= 0.25) return '#a7f3d0'; // emerald-200
    if (percentage <= 0.50) return '#6ee7b7'; // emerald-300
    if (percentage <= 0.75) return '#34d399'; // emerald-400
    return '#10b981'; // emerald-500
  };

  // Fill leading empty cells
  const firstDayOfWeek = getDay(monthStart);
  const emptyCells = Array.from({ length: firstDayOfWeek });

  return (
    <div>
      {/* Legend */}
      {!isAggregated ? (
        <div className="flex flex-wrap items-center gap-4 mb-4 mt-2">
          {Object.entries(STATUS_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: val.dot }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {val.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 mt-2 justify-end mr-2">
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-surface-hover)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: '#a7f3d0' }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: '#6ee7b7' }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: '#34d399' }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: '#10b981' }} />
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>More</span>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold py-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {day}
          </div>
        ))}

        {/* Empty leading cells */}
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const data = dataMap[dateStr];
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

          let cellStyle = {
            borderColor: 'var(--color-border-subtle)',
            background: isToday && !isAggregated ? 'var(--color-primary-light)' : 'transparent',
            color: 'var(--color-text-primary)'
          };

          let titleText = `${format(day, 'dd MMM')}: No record`;
          
          if (isAggregated) {
            if (data) {
              const presentAndLate = (data.present || 0) + (data.late || 0);
              const color = getIntensityColor(presentAndLate, data.total_active || 1);
              cellStyle.background = color;
              if (color !== 'transparent' && color !== 'var(--color-surface-hover)') {
                cellStyle.borderColor = color;
                cellStyle.color = '#064e3b'; // very dark green text for contrast
              }
              titleText = `${format(day, 'dd MMM')}: ${presentAndLate} Present/Late`;
            } else {
              cellStyle.background = 'var(--color-surface-hover)';
            }
          } else {
            const status = data;
            titleText = `${format(day, 'dd MMM')}: ${status || 'No record'}`;
          }

          return (
            <div
              key={dateStr}
              onClick={() => {
                if (isAggregated && data) {
                  setSelectedDay({ date: day, ...data });
                }
              }}
              className={`heatmap-cell relative border ${isAggregated && data ? 'cursor-pointer hover:opacity-80' : ''}`}
              style={cellStyle}
              title={titleText}
            >
              <span className="text-sm mb-auto" style={{ fontWeight: isToday ? 700 : 500, color: 'inherit' }}>
                {format(day, 'd')}
              </span>
              {!isAggregated && data && STATUS_COLORS[data] && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[data].dot }} />
                  <span className="text-xs truncate font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {STATUS_COLORS[data].label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Aggregated details */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedDay(null)}>
          <div className="glass-card w-full max-w-sm rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()} style={{ background: 'var(--color-surface)' }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                {format(selectedDay.date, 'MMMM d, yyyy')}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Daily Company Attendance
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Present</span>
                <span className="font-bold text-[#10B981]">{selectedDay.present || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Late</span>
                <span className="font-bold text-[#F59E0B]">{selectedDay.late || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Absent</span>
                <span className="font-bold text-[#EF4444]">{selectedDay.absent || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>On Leave</span>
                <span className="font-bold text-[#3B82F6]">{selectedDay.leave || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Holiday</span>
                <span className="font-bold text-[#9CA3AF]">{selectedDay.holiday || 0}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-black/5 dark:bg-white/5 border-t flex justify-end" style={{ borderColor: 'var(--color-border)' }}>
              <button 
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
                onClick={() => setSelectedDay(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
