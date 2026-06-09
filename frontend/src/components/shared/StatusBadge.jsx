// frontend/src/components/shared/StatusBadge.jsx

const CONTRACT_CONFIGS = {
  'full-time':  { label: 'Full-time',  className: 'badge-fulltime' },
  'part-time':  { label: 'Part-time',  className: 'badge-part-time' },
  'freelance':  { label: 'Freelance',  className: 'badge-freelance' },
  'internship': { label: 'Internship', className: 'badge-internship' },
  'contract':   { label: 'Contract',   className: 'badge-contract' },
};

const STATUS_CONFIGS = {
  active:      { label: 'Active',      dotColor: 'var(--color-success)' },
  inactive:    { label: 'Inactive',    dotColor: 'var(--color-warning)' },
  terminated:  { label: 'Terminated',  dotColor: 'var(--color-danger)' },
};

const LEAVE_STATUS_CONFIGS = {
  pending:   { label: 'Pending',   dotColor: 'var(--color-warning)',  bg: 'var(--color-warning-light)',  color: 'var(--color-warning)' },
  approved:  { label: 'Approved',  dotColor: 'var(--color-success)',  bg: 'var(--color-success-light)',  color: 'var(--color-success)' },
  rejected:  { label: 'Rejected',  dotColor: 'var(--color-danger)',   bg: 'var(--color-danger-light)',   color: 'var(--color-danger)' },
};

const PAYROLL_STATUS_CONFIGS = {
  pending:   { label: 'Pending',   bg: '#FEF3C7', color: '#D97706' },
  processed: { label: 'Processed', bg: '#DBEAFE', color: '#2563EB' },
  paid:      { label: 'Paid',      bg: '#DCFCE7', color: '#16A34A' },
};

const PRIORITY_CONFIGS = {
  low:    { label: 'Low',    bg: '#F3F4F6', color: '#6B7280' },
  normal: { label: 'Normal', bg: '#DBEAFE', color: '#2563EB' },
  high:   { label: 'High',   bg: '#FEF3C7', color: '#D97706' },
  urgent: { label: 'Urgent', bg: '#FEE2E2', color: '#DC2626' },
};

/**
 * StatusBadge — unified badge component
 * @param {'contract'|'status'|'leave'|'payroll'|'priority'} type - badge category
 * @param {string} value - the actual value (e.g. 'full-time', 'active', 'pending')
 */
export default function StatusBadge({ type = 'contract', value }) {
  if (!value) return null;

  // Contract type badges
  if (type === 'contract') {
    const config = CONTRACT_CONFIGS[value] || { label: value, className: 'badge-contract' };
    return (
      <span className={`badge-base ${config.className}`}>
        <span className="badge-dot" style={{
          background: config.className === 'badge-fulltime' ? 'var(--color-primary)' :
            config.className === 'badge-freelance' ? '#9D174D' :
            config.className === 'badge-internship' ? '#1D4ED8' :
            config.className === 'badge-part-time' ? '#6D28D9' :
            '#C2410C'
        }} />
        {config.label}
      </span>
    );
  }

  // Employee status badges
  if (type === 'status') {
    const config = STATUS_CONFIGS[value] || { label: value, dotColor: 'var(--color-text-secondary)' };
    return (
      <span className="badge-base" style={{
        background: value === 'active' ? 'var(--color-success-light)' :
          value === 'inactive' ? 'var(--color-warning-light)' : 'var(--color-danger-light)',
        color: value === 'active' ? 'var(--color-success)' :
          value === 'inactive' ? 'var(--color-warning)' : 'var(--color-danger)',
      }}>
        <span className="badge-dot" style={{ background: config.dotColor }} />
        {config.label}
      </span>
    );
  }

  // Leave status
  if (type === 'leave') {
    const config = LEAVE_STATUS_CONFIGS[value] || { label: value, bg: '#F3F4F6', color: '#6B7280', dotColor: '#6B7280' };
    return (
      <span
        className={`badge-base ${value === 'pending' ? 'animate-pulse-pending' : ''}`}
        style={{ background: config.bg, color: config.color }}
      >
        <span className="badge-dot" style={{ background: config.dotColor }} />
        {config.label}
      </span>
    );
  }

  // Payroll status
  if (type === 'payroll') {
    const config = PAYROLL_STATUS_CONFIGS[value] || { label: value, bg: '#F3F4F6', color: '#6B7280' };
    return (
      <span className="badge-base" style={{ background: config.bg, color: config.color }}>
        {config.label}
      </span>
    );
  }

  // Priority
  if (type === 'priority') {
    const config = PRIORITY_CONFIGS[value] || { label: value, bg: '#F3F4F6', color: '#6B7280' };
    return (
      <span className={`badge-base priority-${value}`} style={{ background: config.bg, color: config.color }}>
        {config.label}
      </span>
    );
  }

  return <span className="badge-base">{value}</span>;
}
