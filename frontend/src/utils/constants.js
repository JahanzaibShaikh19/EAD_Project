// frontend/src/utils/constants.js

export const INPUT_CLASS = "w-full px-4 py-3 rounded-xl border bg-transparent outline-none transition-all focus:ring-2 focus:ring-primary/20";

export const ROLES = {
  HR: 'hr',
  EMPLOYEE: 'employee',
};

export const CONTRACT_TYPES = [
  { value: 'full-time',   label: 'Full-time' },
  { value: 'part-time',   label: 'Part-time' },
  { value: 'freelance',   label: 'Freelance' },
  { value: 'internship',  label: 'Internship' },
  { value: 'contract',    label: 'Contract' },
];

export const EMPLOYEE_STATUSES = [
  { value: 'active',      label: 'Active' },
  { value: 'inactive',    label: 'Inactive' },
  { value: 'terminated',  label: 'Terminated' },
];

export const LEAVE_TYPES = [
  { value: 'annual',      label: 'Annual Leave' },
  { value: 'sick',        label: 'Sick Leave' },
  { value: 'casual',      label: 'Casual Leave' },
  { value: 'maternity',   label: 'Maternity Leave' },
  { value: 'paternity',   label: 'Paternity Leave' },
  { value: 'unpaid',      label: 'Unpaid Leave' },
];

export const LEAVE_STATUSES = [
  { value: 'pending',     label: 'Pending' },
  { value: 'approved',    label: 'Approved' },
  { value: 'rejected',    label: 'Rejected' },
];

export const ATTENDANCE_STATUSES = [
  { value: 'present',     label: 'Present' },
  { value: 'absent',      label: 'Absent' },
  { value: 'late',        label: 'Late' },
  { value: 'on-leave',    label: 'On Leave' },
  { value: 'holiday',     label: 'Holiday' },
];

export const PAYROLL_STATUSES = [
  { value: 'pending',     label: 'Pending' },
  { value: 'processed',   label: 'Processed' },
  { value: 'paid',        label: 'Paid' },
];

export const PRIORITY_LEVELS = [
  { value: 'low',         label: 'Low' },
  { value: 'normal',      label: 'Normal' },
  { value: 'high',        label: 'High' },
  { value: 'urgent',      label: 'Urgent' },
];

export const MONTHS = [
  { value: 1,  label: 'January' },
  { value: 2,  label: 'February' },
  { value: 3,  label: 'March' },
  { value: 4,  label: 'April' },
  { value: 5,  label: 'May' },
  { value: 6,  label: 'June' },
  { value: 7,  label: 'July' },
  { value: 8,  label: 'August' },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const PERFORMANCE_METRICS = [
  'quality_of_work',
  'collaboration',
  'initiative',
  'punctuality',
  'communication',
  'problem_solving',
];

export const PERFORMANCE_METRIC_LABELS = {
  quality_of_work: 'Quality of Work',
  collaboration:   'Collaboration',
  initiative:      'Initiative',
  punctuality:     'Punctuality',
  communication:   'Communication',
  problem_solving: 'Problem Solving',
};

// Nav items for sidebar
export const NAV_ITEMS_HR = [
  { label: 'Dashboard',     path: '/dashboard',     icon: 'LayoutDashboard' },
  { label: 'Employees',     path: '/employees',     icon: 'Users' },
  { label: 'Departments',   path: '/departments',   icon: 'Building2' },
  { label: 'Attendance',    path: '/attendance',    icon: 'CalendarCheck' },
  { label: 'Leave',         path: '/leave',         icon: 'CalendarOff' },
  { label: 'Payroll',       path: '/payroll',       icon: 'Wallet' },
  { label: 'Performance',   path: '/performance',   icon: 'TrendingUp' },
  { label: 'Goals',         path: '/goals',         icon: 'Target' },
  { label: 'Announcements', path: '/announcements', icon: 'Megaphone' },
];

export const NAV_ITEMS_EMPLOYEE = [
  { label: 'Dashboard',     path: '/dashboard',     icon: 'LayoutDashboard' },
  { label: 'Attendance',    path: '/attendance',    icon: 'CalendarCheck' },
  { label: 'Leave',         path: '/leave',         icon: 'CalendarOff' },
  { label: 'Payroll',       path: '/payroll',       icon: 'Wallet' },
  { label: 'Performance',   path: '/performance',   icon: 'TrendingUp' },
  { label: 'Goals',         path: '/goals',         icon: 'Target' },
  { label: 'Announcements', path: '/announcements', icon: 'Megaphone' },
];

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
