import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Play, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Avatar from '../../components/shared/Avatar';
import { usePayroll, useMyPayroll, useCreatePayroll, useProcessPayroll } from '../../api/payrollApi';
import { useEmployees } from '../../api/employeeApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, getMonthName, formatDate } from '../../utils/helpers';
import { MONTHS, PAYROLL_STATUSES, INPUT_CLASS } from '../../utils/constants';

const payrollSchema = z.object({
  employee_id: z.string().min(1, 'Employee required'),
  month:       z.string().min(1, 'Month required'),
  year:        z.string().min(1, 'Year required'),
  base_salary: z.string().min(1, 'Base salary required'),
  allowances:  z.string().optional(),
  deductions:  z.string().optional(),
  tax:         z.string().optional(),
});

function PayslipCard({ payslip }) {
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (progressRef.current) {
        gsap.from(progressRef.current, {
          scaleX: 0, transformOrigin: 'left', duration: 0.8, ease: 'power2.out', delay: 0.2,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const net = parseFloat(payslip.net_salary || 0);
  const base = parseFloat(payslip.base_salary || 0);
  const pct = base > 0 ? Math.round((net / base) * 100) : 0;

  return (
    <div
      className="stat-card card card-hover p-5"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-heading font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {getMonthName(payslip.month)} {payslip.year}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Processed: {payslip.processed_at ? formatDate(payslip.processed_at) : 'Pending'}
          </p>
        </div>
        <StatusBadge type="payroll" value={payslip.status} />
      </div>

      <div className="space-y-2 mb-4">
        {[
          { label: 'Base Salary', value: formatCurrency(payslip.base_salary), positive: true },
          { label: 'Allowances',  value: `+${formatCurrency(payslip.allowances || 0)}`, positive: true },
          { label: 'Deductions',  value: `-${formatCurrency(payslip.deductions || 0)}`, positive: false },
          { label: 'Tax',         value: `-${formatCurrency(payslip.tax || 0)}`, positive: false },
        ].map(({ label, value, positive }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
            <span style={{ color: positive ? 'var(--color-text-primary)' : 'var(--color-danger)' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Net Pay
          </span>
          <span
            className="font-heading font-bold"
            style={{ fontSize: '18px', color: 'var(--color-primary)' }}
          >
            {formatCurrency(payslip.net_salary)}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            ref={progressRef}
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {pct}% of base salary
        </p>
      </div>
    </div>
  );
}

function CreatePayrollDialog({ open, onClose, employees }) {
  const { mutate: create, isPending } = useCreatePayroll();
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      month: String(new Date().getMonth() + 1),
      year: String(new Date().getFullYear()),
      base_salary: '',
      allowances: '0',
      deductions: '0',
      tax: '',
    },
  });

  const selectedEmployeeId = watch('employee_id');

  useEffect(() => {
    if (selectedEmployeeId && employees) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp && emp.salary) {
        const base = Number(emp.salary) || 0;
        setValue('base_salary', String(base));
        setValue('tax', String(base * 0.10));
      }
    }
  }, [selectedEmployeeId, employees, setValue]);

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  const onSubmit = (data) => {
    create({
      ...data,
      month: parseInt(data.month),
      year: parseInt(data.year),
      base_salary: parseFloat(data.base_salary),
      allowances: parseFloat(data.allowances || 0),
      deductions: parseFloat(data.deductions || 0),
      tax: parseFloat(data.tax || (parseFloat(data.base_salary) * 0.10) || 0),
    }, { onSuccess: () => { reset(); onClose(); } });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[480px] p-0 border-0 rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: 'var(--color-surface)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Create Payroll
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Generate a new payroll record.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Employee
              </label>
              <select id="payroll-employee" {...register('employee_id')} className={INPUT_CLASS} style={{ borderColor: errors.employee_id ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }}>
                <option value="">Select employee...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name} ({e.employee_code})
                  </option>
                ))}
              </select>
              {errors.employee_id && <p className="text-xs text-red-500 mt-1">{errors.employee_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Month</label>
                <select id="payroll-month" {...register('month')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }}>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Year</label>
                <select id="payroll-year" {...register('year')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Base Salary</label>
                <input id="payroll-base" type="number" step="0.01" {...register('base_salary')} className={INPUT_CLASS} style={{ borderColor: errors.base_salary ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="75000" />
                {errors.base_salary && <p className="text-xs text-red-500 mt-1">{errors.base_salary.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Allowances</label>
                <input id="payroll-allow" type="number" step="0.01" {...register('allowances')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)' }} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Deductions</label>
                <input id="payroll-deduct" type="number" step="0.01" {...register('deductions')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)' }} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Tax (10%)</label>
                <input id="payroll-tax" type="number" step="0.01" {...register('tax')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)' }} placeholder="auto" />
              </div>
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
                Create Record
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Payroll() {
  const { isHR } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear] = useState(new Date().getFullYear());

  const { data: hrData, isLoading: hrLoading } = usePayroll(
    isHR ? { month: filterMonth || undefined, year: filterYear, page, limit: 10 } : null
  );
  const { data: myData, isLoading: myLoading } = useMyPayroll();
  const { data: empData } = useEmployees(isHR ? { limit: 200 } : null);

  const { mutate: processPayroll, isPending: processing } = useProcessPayroll();

  const records = isHR ? (hrData?.records || hrData?.data || []) : (myData?.data || []);
  const total = hrData?.total || records.length;
  const employees = empData?.employees || empData?.data || [];

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
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{row.employee_code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      label: 'Period',
      render: (_, row) => `${getMonthName(row.month)} ${row.year}`,
    },
    { key: 'base_salary', label: 'Base Salary', render: (v) => formatCurrency(v) },
    { key: 'allowances',  label: 'Allowances',  render: (v) => formatCurrency(v || 0) },
    { key: 'deductions',  label: 'Deductions',  render: (v) => formatCurrency(v || 0) },
    { key: 'tax',         label: 'Tax',         render: (v) => formatCurrency(v || 0) },
    { key: 'net_salary',  label: 'Net Pay',
      render: (v) => (
        <span className="font-semibold font-heading" style={{ color: 'var(--color-primary)' }}>
          {formatCurrency(v)}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge type="payroll" value={v} /> },
    {
      key: 'process',
      label: '',
      render: (_, row) => row.status === 'pending' ? (
        <button
          id={`process-payroll-${row.id}`}
          onClick={(e) => { e.stopPropagation(); processPayroll(row.id); }}
          disabled={processing}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
        >
          <Play size={11} /> Process
        </button>
      ) : null,
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Payroll"
        subtitle={isHR ? `${total} payroll records` : 'Your payslips'}
        actions={
          isHR && (
            <button
              id="create-payroll-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              <Plus size={14} /> Create Record
            </button>
          )
        }
      />

      {isHR && (
        <div
          className="data-card flex items-center gap-3 mb-4 p-4"
          style={{
            background: 'var(--color-surface)', borderRadius: '12px',
            border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)',
          }}
        >
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Month:
          </label>
          <div className="flex gap-2 flex-wrap">
            {[0, ...MONTHS.map(m => m.value)].map((m) => (
              <button
                key={m}
                onClick={() => { setFilterMonth(m); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: filterMonth === m ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: filterMonth === m ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${filterMonth === m ? 'transparent' : 'var(--color-border)'}`,
                }}
              >
                {m === 0 ? 'All' : MONTHS.find(mo => mo.value === m)?.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isHR ? (
        <DataTable
          columns={hrColumns}
          data={records}
          total={total}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          loading={hrLoading}
          emptyType="payroll"
          emptyTitle="No payroll records"
          emptyDescription="Create payroll records for your employees."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="stat-card card" style={{ height: '200px' }}>
                <div className="animate-pulse space-y-3 p-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))
            : records.length === 0
            ? <p className="col-span-3 text-center py-12 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No payslips found.
              </p>
            : records.map((p) => <PayslipCard key={p.id} payslip={p} />)
          }
        </div>
      )}

      {showCreate && (
        <CreatePayrollDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          employees={employees}
        />
      )}
    </PageWrapper>
  );
}
