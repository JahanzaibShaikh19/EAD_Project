import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Plus, LogIn, LogOut, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import AttendanceHeatmap from '../../components/charts/AttendanceHeatmap';
import Avatar from '../../components/shared/Avatar';
import { useAttendance, useMyAttendance, useCheckIn, useCheckOut, useManualAttendance } from '../../api/attendanceApi';
import { useEmployees } from '../../api/employeeApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';
import { ATTENDANCE_STATUSES, INPUT_CLASS } from '../../utils/constants';
import { format } from 'date-fns';

const manualSchema = z.object({
  employee_id: z.string().min(1, 'Employee required'),
  work_date:   z.string().min(1, 'Date required'),
  check_in:    z.string().optional(),
  check_out:   z.string().optional(),
  status:      z.string().min(1, 'Status required'),
  note:        z.string().optional(),
});

function ManualEntryDialog({ open, onClose, employees }) {
  const { mutate: addEntry, isPending } = useManualAttendance();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(manualSchema),
    defaultValues: { work_date: format(new Date(), 'yyyy-MM-dd'), status: 'present' },
  });
  const onSubmit = (data) => addEntry(data, { onSuccess: () => { reset(); onClose(); } });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[480px] p-0 border-0 rounded-[32px] shadow-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Manual Attendance
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Add or modify an attendance record manually.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Employee
              </label>
              <select id="att-employee" {...register('employee_id')} className={INPUT_CLASS} style={{ borderColor: errors.employee_id ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }}>
                <option value="">Select employee...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                  </option>
                ))}
              </select>
              {errors.employee_id && <p className="text-xs text-red-500 mt-1">{errors.employee_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Date</label>
                <input id="att-date" type="date" {...register('work_date')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Status</label>
                <select id="att-status" {...register('status')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }}>
                  {ATTENDANCE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Check In</label>
                <input id="att-checkin" type="time" {...register('check_in')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Check Out</label>
                <input id="att-checkout" type="time" {...register('check_out')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Note</label>
              <input id="att-note" {...register('note')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)' }} placeholder="Optional note..." />
            </div>

            <div className="flex items-center justify-between mt-10 pt-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-primary)' }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Add Entry
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Attendance() {
  const { isHR } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showManual, setShowManual] = useState(false);
  const [selectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

  const debouncedSearch = useDebounce(search, 300);

  const { data: allData, isLoading: hrLoading } = useAttendance(
    isHR ? { month: selectedMonth, year: selectedYear, search: debouncedSearch || undefined, page, limit: 10 } : null
  );
  const { data: myData, isLoading: myLoading } = useMyAttendance(
    !isHR ? { month: selectedMonth, year: selectedYear } : null
  );
  const { data: empData } = useEmployees(isHR ? { limit: 200 } : null);

  const { mutate: checkIn, isPending: checkingIn } = useCheckIn();
  const { mutate: checkOut, isPending: checkingOut } = useCheckOut();

  const records = isHR ? (allData?.records || allData?.data || []) : (myData?.data || []);
  const total = allData?.total || records.length;
  const employees = empData?.data || [];
  const isLoading = isHR ? hrLoading : myLoading;

  const columns = [
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
    { key: 'work_date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'check_in',  label: 'Check In', render: (v) => v || '—' },
    { key: 'check_out', label: 'Check Out', render: (v) => v || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const colors = {
          present: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
          absent:  { bg: 'var(--color-danger-light)',  color: 'var(--color-danger)' },
          late:    { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
          'on-leave': { bg: 'var(--color-info-light)', color: 'var(--color-info)' },
          holiday: { bg: '#F3F4F6', color: '#6B7280' },
        };
        const c = colors[v] || colors.absent;
        return (
          <span className="badge-base capitalize" style={{ background: c.bg, color: c.color }}>
            {v?.replace('-', ' ') || '—'}
          </span>
        );
      },
    },
    { key: 'note', label: 'Note', render: (v) => v || '—' },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Attendance"
        subtitle={`${format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')} attendance records`}
        actions={
          isHR ? (
            <button
              id="manual-attendance-btn"
              onClick={() => setShowManual(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              <Plus size={14} /> Manual Entry
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="check-in-btn"
                onClick={() => checkIn()}
                disabled={checkingIn}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: 'var(--color-success)', cursor: checkingIn ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => !checkingIn && (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={(e) => !checkingIn && (e.currentTarget.style.filter = 'none')}
              >
                {checkingIn ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                Check In
              </button>
              <button
                id="check-out-btn"
                onClick={() => checkOut()}
                disabled={checkingOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: 'var(--color-danger)', cursor: checkingOut ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => !checkingOut && (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={(e) => !checkingOut && (e.currentTarget.style.filter = 'none')}
              >
                {checkingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                Check Out
              </button>
            </div>
          )
        }
      />

      {!isHR && (
        <div className="data-card card p-6 mb-4">
          <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            My Attendance — {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
          </h3>
          <AttendanceHeatmap records={records} month={new Date(selectedYear, selectedMonth - 1)} />
        </div>
      )}

      {isHR && (
        <>
          <div
            className="data-card flex items-center gap-3 mb-4 p-4"
            style={{
              background: 'var(--color-surface)', borderRadius: '12px',
              border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)',
            }}
          >
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search employee..."
              id="attendance-search"
            />
          </div>
          <DataTable
            columns={columns}
            data={records}
            total={total}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            loading={isLoading}
            emptyType="attendance"
            emptyTitle="No attendance records"
            emptyDescription="No records found for the selected period."
          />
        </>
      )}

      {!isHR && records.length > 0 && (
        <div className="data-card card mt-4" style={{ padding: 0 }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-heading font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Attendance Records
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td>{formatDate(r.work_date)}</td>
                    <td>{r.check_in || '—'}</td>
                    <td>{r.check_out || '—'}</td>
                    <td>
                      <span className="badge-base capitalize" style={{
                        background: r.status === 'present' ? 'var(--color-success-light)' :
                          r.status === 'late' ? 'var(--color-warning-light)' :
                          r.status === 'on-leave' ? 'var(--color-info-light)' : 'var(--color-danger-light)',
                        color: r.status === 'present' ? 'var(--color-success)' :
                          r.status === 'late' ? 'var(--color-warning)' :
                          r.status === 'on-leave' ? 'var(--color-info)' : 'var(--color-danger)',
                      }}>
                        {r.status?.replace('-', ' ') || '—'}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {r.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ManualEntryDialog
        open={showManual}
        onClose={() => setShowManual(false)}
        employees={employees}
      />
    </PageWrapper>
  );
}
