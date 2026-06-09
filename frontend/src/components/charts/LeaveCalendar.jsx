import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval, 
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeaveCalendar } from '../../api/leaveApi';
import { getInitials } from '../../utils/helpers';

const LEAVE_COLORS = {
  annual: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  sick: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  casual: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  maternity: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  paternity: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  unpaid: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

export default function LeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: calendarData, isLoading } = useLeaveCalendar({ month, year });
  const leaves = calendarData?.data || [];

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card w-full flex flex-col h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-heading" style={{ color: 'var(--color-text-primary)' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={handleToday} className="px-3 py-1.5 text-sm font-medium rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" style={{ borderColor: 'var(--color-border)' }}>
            Today
          </button>
          <div className="flex items-center rounded-md border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-r" style={{ borderColor: 'var(--color-border)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 border rounded-lg overflow-hidden flex flex-col" style={{ borderColor: 'var(--color-border)' }}>
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b bg-gray-50 dark:bg-gray-900" style={{ borderColor: 'var(--color-border)' }}>
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            // Find leaves that fall on this day
            const dayLeaves = leaves.filter(leave => {
              const start = startOfDay(parseISO(leave.start_date));
              const end = endOfDay(parseISO(leave.end_date));
              return isWithinInterval(day, { start, end });
            });

            return (
              <div 
                key={day.toISOString()} 
                className={`border-r border-b p-1.5 overflow-y-auto relative transition-colors
                  ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''}
                  ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}
                `}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-primary text-white' : isCurrentMonth ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}
                  `}>
                    {format(day, dateFormat)}
                  </span>
                </div>

                <div className="space-y-1">
                  {isLoading && i === 0 && <span className="text-xs text-gray-400">Loading...</span>}
                  
                  {dayLeaves.map((leave, idx) => {
                    const colorClass = LEAVE_COLORS[leave.leave_type] || LEAVE_COLORS.unpaid;
                    return (
                      <div 
                        key={`${leave.id}-${idx}`}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${colorClass}`}
                        title={`${leave.first_name} ${leave.last_name} - ${leave.leave_type}`}
                      >
                        {leave.first_name} {leave.last_name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 items-center text-xs">
        <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Legend:</span>
        {Object.keys(LEAVE_COLORS).map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm border ${LEAVE_COLORS[type]}`}></div>
            <span className="capitalize" style={{ color: 'var(--color-text-tertiary)' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
