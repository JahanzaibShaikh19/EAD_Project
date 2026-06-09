// frontend/src/components/shared/PageHeader.jsx
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

/**
 * Page header with title, breadcrumb, optional date range, and action buttons
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumb = [],
  dateRange,
  actions,
}) {
  const today = format(new Date(), 'dd MMMM yyyy');

  return (
    <div className="page-header flex flex-col gap-1 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: title + subtitle */}
        <div>
          <h1
            className="font-heading"
            style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-text-primary)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </p>
          )}
          {dateRange && (
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar size={13} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {dateRange}
              </span>
            </div>
          )}
        </div>

        {/* Right: action buttons */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
