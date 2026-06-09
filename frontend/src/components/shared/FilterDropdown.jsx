// frontend/src/components/shared/FilterDropdown.jsx
import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

/**
 * Filter dropdown using shadcn Popover
 * @param {Array<{key, label, options: Array<{value, label}>}>} filters - filter config
 * @param {Object} values - current filter values { [key]: value }
 * @param {function} onChange - (key, value) => void
 * @param {function} onClear - clear all filters
 */
export default function FilterDropdown({ filters = [], values = {}, onChange, onClear }) {
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(values).filter(v => v && v !== '').length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
          style={{
            borderColor: activeCount > 0 ? 'var(--color-primary)' : 'var(--color-border)',
            background: activeCount > 0 ? 'var(--color-primary-light)' : 'var(--color-surface)',
            color: activeCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          }}
          id="filter-dropdown-trigger"
        >
          <Filter size={14} />
          Filter
          {activeCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Filters
          </h4>
          {activeCount > 0 && (
            <button
              onClick={() => { onClear?.(); }}
              className="text-xs flex items-center gap-1 hover:text-red-600 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label
                className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {filter.label}
              </label>
              <select
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 outline-none transition-all"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
