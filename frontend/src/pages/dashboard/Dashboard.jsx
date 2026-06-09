import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, Activity, Calendar, TrendingUp, Clock } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import RetentionLineChart from '../../components/charts/RetentionLineChart';
import DepartmentDonut from '../../components/charts/DepartmentDonut';
import AttendanceHeatmap from '../../components/charts/AttendanceHeatmap';
import Avatar from '../../components/shared/Avatar';
import StatusBadge from '../../components/shared/StatusBadge';
import { Skeleton } from '../../components/ui/skeleton';
import { useDashboardStats, useMyDashboard } from '../../api/dashboardApi';
import { useMyAttendance } from '../../api/attendanceApi';
import { selectIsHR } from '../../store/authSlice';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { format } from 'date-fns';

// Mini employee widget
function RecentEmployee({ employee }) {
  return (
    <div
      className="flex items-center gap-3 py-3 px-2 rounded-lg transition-colors cursor-pointer"
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Avatar
        photoUrl={employee.photo_url}
        firstName={employee.first_name}
        lastName={employee.last_name}
        size={36}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {employee.first_name} {employee.last_name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {employee.dept_name || employee.position_title || '—'}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const isHR = useSelector(selectIsHR);
  const { data: statsData, isLoading: statsLoading } = useDashboardStats({ month: selectedMonth, year: selectedYear });
  const { data: myData, isLoading: myLoading } = useMyDashboard({ month: selectedMonth, year: selectedYear });
  const { data: attendanceData } = useMyAttendance({
    month: selectedMonth,
    year: selectedYear,
  });

  const stats = statsData?.data || {};
  const myStats = myData?.data || {};
  const attendanceRecords = attendanceData?.data || [];
  const recentEmployees = stats.recentEmployees || [];
  const companyDailyAttendance = stats.companyDailyAttendance || [];
  const deptDistribution = stats.departmentDistribution || [];
  // Fall back to default data if retention info is missing to show the beautiful chart
  const retentionData = (stats.hiresTrend && stats.hiresTrend.length > 0 && stats.hiresTrend[0].retention !== undefined) ? stats.hiresTrend : null;

  const dateRange = `01 January ${new Date().getFullYear()} – 31 December ${new Date().getFullYear()}`;

  return (
    <PageWrapper>
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg relative" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Calendar size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <input 
              type="month" 
              value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m] = e.target.value.split('-');
                  setSelectedYear(parseInt(y));
                  setSelectedMonth(parseInt(m));
                }
              }}
              className="text-sm font-medium bg-transparent outline-none cursor-pointer"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <button 
            onClick={() => {
              setSelectedMonth(new Date().getMonth() + 1);
              setSelectedYear(new Date().getFullYear());
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800" 
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <span className="text-sm font-medium">This Month</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading || myLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card stat-card" style={{ minHeight: '120px' }}>
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-10 w-20 mb-3" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
          : isHR
          ? (
            <>
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees || 0}
                change={2.5}
                changeLabel="from last month"
                icon={Users}
              />
              <StatCard
                title="eNPS Score"
                value={stats.enpsScore || 72}
                change={1.2}
                changeLabel="from last quarter"
                icon={TrendingUp}
              />
              <StatCard
                title="Attendance Rate"
                value={stats.attendanceRate || 0}
                suffix="%"
                change={-0.5}
                changeLabel="this week"
                icon={Calendar}
              />
              <StatCard
                title="Retention Rate"
                value={stats.retentionRate || 94}
                suffix="%"
                change={1.1}
                changeLabel="from last month"
                icon={Activity}
              />
            </>
          )
          : (
            <>
              <StatCard
                title="Present Days (Month)"
                value={myStats.presentDays || 0}
                icon={Calendar}
              />
              <StatCard
                title="Leave Balance"
                value={myStats.leaveBalance || 0}
                changeLabel="days remaining"
                icon={Clock}
              />
              <StatCard
                title="Pending Leaves"
                value={myStats.pendingLeaves || 0}
                icon={Activity}
              />
              <StatCard
                title="Last Net Pay"
                value={myStats.lastNetSalary || 0}
                prefix="$"
                icon={TrendingUp}
              />
            </>
          )
        }
      </div>

      {/* Charts Row */}
      {isHR && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Retention Line Chart — takes 2 cols */}
          <div className="glass-card data-card lg:col-span-2" style={{ padding: '20px 24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Retention Overview
                </h3>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
                <button className="px-3 py-1 text-xs font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">3m</button>
                <button className="px-3 py-1 text-xs font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">6m</button>
                <button className="px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100">12m</button>
              </div>
            </div>
            <RetentionLineChart data={retentionData} />
          </div>

          {/* Department Donut */}
          <div className="glass-card data-card" style={{ padding: '20px 24px' }}>
            <div className="mb-4">
              <h3 className="font-heading font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                By Department
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Distribution of active employees
              </p>
            </div>
            <DepartmentDonut data={deptDistribution.length > 0 ? deptDistribution : undefined} />
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Heatmap */}
        <div className="glass-card data-card" style={{ padding: '20px 24px' }}>
          <div className="mb-4">
            <h3 className="font-heading font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {isHR ? 'Company Attendance' : 'My Attendance'} — {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Monthly attendance calendar
            </p>
          </div>
          <AttendanceHeatmap 
            records={isHR ? companyDailyAttendance : attendanceRecords} 
            month={new Date(selectedYear, selectedMonth - 1)} 
            isAggregated={isHR}
          />
        </div>

        {/* Recent Employees (HR) or Personal info (Employee) */}
        {isHR ? (
          <div className="glass-card data-card flex flex-col" style={{ padding: '20px 24px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Recent Employees
              </h3>
              <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
            </div>
            {statsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mb-2" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading employees...</p>
              </div>
            ) : recentEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                <Users size={28} style={{ color: 'var(--color-text-tertiary)' }} className="mb-2" />
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No employees yet
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 flex-1 overflow-y-auto">
                {recentEmployees.slice(0, 5).map((emp) => (
                  <RecentEmployee key={emp.id} employee={emp} />
                ))}
              </div>
            )}
            <button className="w-full mt-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors">
              See All Employees
            </button>
          </div>
        ) : (
          <div className="glass-card data-card" style={{ padding: '20px 24px' }}>
            <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              My Overview
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Present Days',    value: myStats.presentDays || '—' },
                { label: 'Absent Days',     value: myStats.absentDays || '—' },
                { label: 'Leave Balance',   value: `${myStats.leaveBalance || 0} days` },
                { label: 'Pending Leaves',  value: myStats.pendingLeaves || 0 },
                { label: 'Active Goals',    value: myStats.activeGoals || 0 },
                { label: 'Last Pay Date',   value: myStats.lastPayDate ? formatDate(myStats.lastPayDate) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
