// frontend/src/components/shared/DataTable.jsx
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import EmptyState from './EmptyState';

/**
 * Reusable sortable data table with pagination, row actions, and empty state
 *
 * @param {Array<{key, label, sortable, render}>} columns
 * @param {Array} data
 * @param {Array<{label, onClick, className}>} [rowActions]
 * @param {number} [total]
 * @param {number} [page]
 * @param {number} [pageSize]
 * @param {function} [onPageChange]
 * @param {string} [sortKey]
 * @param {'asc'|'desc'} [sortDir]
 * @param {function} [onSort]
 * @param {boolean} [loading]
 * @param {string} [emptyType]
 * @param {string} [emptyTitle]
 * @param {string} [emptyDescription]
 * @param {React.ReactNode} [emptyAction]
 */
export default function DataTable({
  columns = [],
  data = [],
  rowActions,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  sortKey,
  sortDir = 'asc',
  onSort,
  loading = false,
  emptyType = 'default',
  emptyTitle,
  emptyDescription,
  emptyAction,
}) {
  const totalPages = Math.ceil(total / pageSize);

  // Animate rows in on data change
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!loading && data.length > 0) {
        gsap.from('.table-row', {
          x: -12,
          opacity: 0,
          duration: 0.25,
          stagger: 0.03,
          ease: 'power2.out',
          clearProps: 'all',
        });
      }
    });
    return () => ctx.revert();
  }, [data, loading]);

  function handleSort(key) {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  }

  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <ChevronsUpDown size={13} className="opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp size={13} style={{ color: 'var(--color-primary)' }} />
      : <ChevronDown size={13} style={{ color: 'var(--color-primary)' }} />;
  }

  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, total);

  return (
    <div className="data-card card" style={{ padding: 0 }}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={{
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </div>
                </th>
              ))}
              {rowActions && <th style={{ width: '48px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                <tr key={i} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                  {rowActions && <td><Skeleton className="h-6 w-6 ml-auto" /></td>}
                </tr>
              ))
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length + (rowActions ? 1 : 0)}>
                    <EmptyState
                      type={emptyType}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              )
              : data.map((row, idx) => (
                <tr key={row.id || idx} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  {rowActions && (
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto flex"
                            id={`row-action-${row.id || idx}`}
                          >
                            <MoreHorizontal size={16} style={{ color: 'var(--color-text-secondary)' }} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {rowActions.map((action, aIdx) => (
                            <DropdownMenuItem
                              key={aIdx}
                              onClick={() => action.onClick(row)}
                              className={action.className || ''}
                            >
                              {action.icon && <action.icon size={14} className="mr-2" />}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: 'var(--color-border-subtle)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Showing <strong>{startRow}–{endRow}</strong> of <strong>{total.toLocaleString()}</strong>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--color-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 5) {
                p = i + 1;
              } else if (page <= 3) {
                p = i + 1;
              } else if (page >= totalPages - 2) {
                p = totalPages - 4 + i;
              } else {
                p = page - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: p === page ? 'var(--color-primary)' : 'transparent',
                    color: p === page ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--color-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
