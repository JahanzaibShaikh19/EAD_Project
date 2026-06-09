// frontend/src/pages/leave/LeaveList.jsx
import { useState } from 'react';
import { Plus, CheckCircle, XCircle, Calendar, List as ListIcon, Loader2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Avatar from '../../components/shared/Avatar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import LeaveForm from './LeaveForm';
import LeaveCalendar from '../../components/charts/LeaveCalendar';
import { useLeaveRequests, useMyLeaveRequests, useApproveLeave, useRejectLeave, useCancelLeave } from '../../api/leaveApi';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';
import { LEAVE_STATUSES } from '../../utils/constants';

export default function LeaveList() {
  const { isHR } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const { data: hrData, isLoading: hrLoading } = useLeaveRequests(
    isHR ? { status: filterStatus || undefined, page, limit: 10 } : null
  );
  const { data: myData, isLoading: myLoading } = useMyLeaveRequests();

  const { mutate: approve, isPending: approving, variables: approvingId } = useApproveLeave();
  const { mutate: reject, isPending: rejecting, variables: rejectingId } = useRejectLeave();
  const { mutate: cancel, isPending: cancelling } = useCancelLeave();

  const records = isHR ? (hrData?.requests || hrData?.data || []) : (myData?.data || []);
  const total = hrData?.total || records.length;
  const isLoading = isHR ? hrLoading : myLoading;

  const hrColumns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.first_name} lastName={row.last_name} photoUrl={row.photo_url} size={32} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {row.first_name} {row.last_name}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{row.dept_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'leave_type',
      label: 'Type',
      render: (v) => <span className="capitalize text-sm">{v}</span>,
    },
    { key: 'start_date', label: 'From', render: (v) => formatDate(v) },
    { key: 'end_date',   label: 'To',   render: (v) => formatDate(v) },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge type="leave" value={v} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => row.status === 'pending' ? (
        <div className="flex items-center gap-1">
          <button
            id={`approve-leave-${row.id}`}
            onClick={(e) => { e.stopPropagation(); approve(row.id); }}
            disabled={approving || rejecting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}
          >
            {approving && approvingId === row.id ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCircle size={12} />
            )}
            {approving && approvingId === row.id ? 'Approving...' : 'Approve'}
          </button>
          <button
            id={`reject-leave-${row.id}`}
            onClick={(e) => { e.stopPropagation(); reject(row.id); }}
            disabled={approving || rejecting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}
          >
            {rejecting && rejectingId === row.id ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <XCircle size={12} />
            )}
            {rejecting && rejectingId === row.id ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      ) : null,
    },
  ];

  const empColumns = [
    {
      key: 'leave_type',
      label: 'Leave Type',
      render: (v) => <span className="capitalize font-medium text-sm">{v}</span>,
    },
    { key: 'start_date', label: 'From', render: (v) => formatDate(v) },
    { key: 'end_date',   label: 'To',   render: (v) => formatDate(v) },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge type="leave" value={v} />,
    },
    { key: 'reason', label: 'Reason', render: (v) => v || '—' },
    { key: 'created_at', label: 'Applied', render: (v) => formatDate(v) },
  ];

  const empRowActions = [
    {
      label: 'Cancel',
      className: 'text-red-600',
      onClick: (row) => row.status === 'pending' && setCancelId(row.id),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Leave Requests"
        subtitle={isHR ? `${total} total requests` : 'Manage your leave requests'}
        actions={
          !isHR && (
            <button
              id="apply-leave-btn"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              <Plus size={14} /> Apply for Leave
            </button>
          )
        }
      />

      <div className="flex items-center gap-2 mb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button 
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors`}
          style={{
            borderColor: viewMode === 'list' ? 'var(--color-primary)' : 'transparent',
            color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <ListIcon size={16} /> List View
        </button>
        <button 
          onClick={() => setViewMode('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors`}
          style={{
            borderColor: viewMode === 'calendar' ? 'var(--color-primary)' : 'transparent',
            color: viewMode === 'calendar' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <Calendar size={16} /> Calendar View
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <LeaveCalendar />
      ) : (
        <>
          {/* Filter bar (HR only) */}
          {isHR && (
        <div
          className="data-card flex items-center gap-3 mb-4 p-4"
          style={{
            background: 'var(--color-surface)', borderRadius: '12px',
            border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)',
          }}
        >
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Filter by status:
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {['', ...LEAVE_STATUSES.map(s => s.value)].map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: filterStatus === s ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: filterStatus === s ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${filterStatus === s ? 'transparent' : 'var(--color-border)'}`,
                }}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <DataTable
        columns={isHR ? hrColumns : empColumns}
        data={records}
        rowActions={!isHR ? empRowActions : undefined}
        total={total}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        loading={isLoading}
        emptyType="leave"
        emptyTitle="No leave requests"
        emptyDescription={isHR ? 'No leave requests have been submitted yet.' : 'You have no leave requests. Apply for leave above.'}
        emptyAction={!isHR && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            Apply for Leave
          </button>
        )}
      />
      </>
      )}

      {showForm && (
        <LeaveForm open={showForm} onClose={() => setShowForm(false)} />
      )}

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancel Leave Request"
        description="Are you sure you want to cancel this leave request?"
        confirmLabel="Cancel Request"
        onConfirm={() => cancel(cancelId, { onSettled: () => setCancelId(null) })}
        loading={cancelling}
      />
    </PageWrapper>
  );
}
