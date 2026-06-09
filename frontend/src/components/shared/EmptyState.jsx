// frontend/src/components/shared/EmptyState.jsx
import { FileX, Users, Calendar, Wallet, TrendingUp, Megaphone } from 'lucide-react';

const ICON_MAP = {
  employees: Users,
  leave: Calendar,
  attendance: Calendar,
  payroll: Wallet,
  performance: TrendingUp,
  announcements: Megaphone,
  default: FileX,
};

/**
 * Empty state illustration shown when a list/table has no data
 */
export default function EmptyState({
  type = 'default',
  title = 'No data found',
  description = 'There are no items to display yet.',
  action,
}) {
  const Icon = ICON_MAP[type] || ICON_MAP.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--color-primary-light)' }}
      >
        <Icon size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
      <h3
        className="font-heading font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}
      >
        {title}
      </h3>
      <p
        className="text-sm max-w-xs"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
