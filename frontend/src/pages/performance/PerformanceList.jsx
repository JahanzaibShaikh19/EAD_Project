import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Avatar from '../../components/shared/Avatar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { usePerformanceReviews, useMyPerformanceReviews, useCreatePerformanceReview, useDeletePerformanceReview } from '../../api/performanceApi';
import { useEmployees } from '../../api/employeeApi';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';
import { PERFORMANCE_METRIC_LABELS, INPUT_CLASS } from '../../utils/constants';
import Goals from './Goals';

const reviewSchema = z.object({
  employee_id:    z.string().min(1, 'Employee required'),
  review_date:    z.string().min(1, 'Review date required'),
  rating:         z.string().min(1, 'Overall rating required'),
  quality_of_work:z.string().optional(),
  collaboration:  z.string().optional(),
  initiative:     z.string().optional(),
  punctuality:    z.string().optional(),
  communication:  z.string().optional(),
  problem_solving:z.string().optional(),
  comments:       z.string().optional(),
});

function ScoreInput({ label, name, register, watch, defaultValue = 7 }) {
  const currentValue = watch(name) || defaultValue;
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          defaultValue={defaultValue}
          {...register(name)}
          className="flex-1"
          style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
        />
        <span className="text-sm font-semibold w-6 text-right" style={{ color: 'var(--color-primary)' }}>
          {currentValue}
        </span>
      </div>
    </div>
  );
}

function CreateReviewDialog({ open, onClose, employees }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { mutate: create, isPending } = useCreatePerformanceReview();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      review_date: new Date().toISOString().substring(0, 10),
      rating: '3',
    },
  });

  const onSubmit = (data) => {
    const parsed = {
      ...data,
      rating: parseInt(data.rating),
      quality_of_work: parseInt(data.quality_of_work || 7),
      collaboration: parseInt(data.collaboration || 7),
      initiative: parseInt(data.initiative || 7),
      punctuality: parseInt(data.punctuality || 7),
      communication: parseInt(data.communication || 7),
      problem_solving: parseInt(data.problem_solving || 7),
    };
    create(parsed, { onSuccess: () => { reset(); onClose(); } });
  };

  const filteredEmployees = employees.filter(e => 
    `${e.first_name} ${e.last_name} ${e.employee_code || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRating = parseInt(watch('rating') || '3');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[480px] p-0 border-0 rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: 'var(--color-surface)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Create Review
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Evaluate an employee's performance.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Employee
                </label>
                <input 
                  type="text" 
                  placeholder="Search employee by name..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${INPUT_CLASS} mb-2`} 
                  style={{ borderColor: 'var(--color-border)' }}
                />
                <select id="perf-employee" {...register('employee_id')} className={INPUT_CLASS} style={{ borderColor: errors.employee_id ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }}>
                  <option value="">Select...</option>
                  {filteredEmployees.map((e) => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
                {errors.employee_id && <p className="text-xs text-red-500 mt-1">{errors.employee_id.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Review Date
                </label>
                <input id="perf-date" type="date" {...register('review_date')} className={INPUT_CLASS} style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Overall Rating
              </label>
              <div className="flex items-center gap-4">
                {[1,2,3,4,5].map((n) => {
                  const isSelected = n === selectedRating;
                  return (
                    <label key={n} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <input type="radio" value={n} {...register('rating')} className="sr-only" />
                      <div className={`p-2 rounded-full transition-all duration-200 ${isSelected ? 'bg-primary/10 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <span
                          className={`text-3xl transition-transform block ${isSelected ? 'scale-110 drop-shadow-md' : 'scale-100 grayscale-[0.8] opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}
                        >⭐</span>
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                        {n}/5
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-2xl border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border-subtle)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Detailed Metrics
              </p>
              {Object.entries(PERFORMANCE_METRIC_LABELS).map(([key, label]) => (
                <ScoreInput key={key} label={label} name={key} register={register} watch={watch} />
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Comments
              </label>
              <textarea
                id="perf-comments"
                {...register('comments')}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
                style={{ borderColor: 'var(--color-border)' }}
                placeholder="Overall feedback and areas for improvement..."
              />
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
                Create Review
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PerformanceList() {
  const navigate = useNavigate();
  const { isHR } = useAuth();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');

  const { data: hrData, isLoading: hrLoading } = usePerformanceReviews(
    isHR ? { page, limit: 10 } : null
  );
  const { data: myData, isLoading: myLoading } = useMyPerformanceReviews();
  const { data: empData } = useEmployees(isHR ? { limit: 200 } : null);
  const { mutate: deleteReview, isPending: deleting } = useDeletePerformanceReview();

  const records = isHR ? (hrData?.reviews || hrData?.data || []) : (myData?.data || []);
  const total = hrData?.total || records.length;
  const employees = empData?.employees || empData?.data || [];

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
    { key: 'review_date', label: 'Review Date', sortable: true, render: (v) => formatDate(v) },
    {
      key: 'rating',
      label: 'Rating',
      render: (v) => (
        <span>{'⭐'.repeat(parseInt(v || 0))} <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{v}/5</span></span>
      ),
    },
    { key: 'quality_of_work', label: 'Quality', render: (v) => `${v || 0}/10` },
    { key: 'collaboration',   label: 'Collab',  render: (v) => `${v || 0}/10` },
    { key: 'comments', label: 'Comments', render: (v) => v ? (v.length > 40 ? v.substring(0, 40) + '...' : v) : '—' },
  ];

  const rowActions = [
    { label: 'View', icon: Eye, onClick: (row) => navigate(`/performance/${row.id}`) },
    ...(isHR ? [
      { label: 'Delete', icon: Trash2, className: 'text-red-600', onClick: (row) => setDeleteId(row.id) },
    ] : []),
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Performance Reviews"
        subtitle={`${total} reviews`}
        actions={
          activeTab === 'reviews' && isHR && (
            <button
              id="create-review-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              <Plus size={14} /> New Review
            </button>
          )
        }
      />

      <div className="flex border-b mb-6" style={{ borderColor: 'var(--color-border)' }}>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          Performance Reviews
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'goals'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('goals')}
        >
          Goals & OKRs
        </button>
      </div>

      {activeTab === 'reviews' ? (
        <>
          <DataTable
            columns={columns}
            data={records}
            rowActions={rowActions}
            total={total}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            loading={isHR ? hrLoading : myLoading}
            emptyType="performance"
            emptyTitle="No performance reviews"
            emptyDescription="No reviews found."
          />

          {showCreate && (
            <CreateReviewDialog
              open={showCreate}
              onClose={() => setShowCreate(false)}
              employees={employees}
            />
          )}

          <ConfirmDialog
            open={!!deleteId}
            onOpenChange={(open) => !open && setDeleteId(null)}
            title="Delete Review"
            description="Are you sure you want to delete this performance review?"
            onConfirm={() => deleteReview(deleteId, { onSettled: () => setDeleteId(null) })}
            loading={deleting}
          />
        </>
      ) : (
        <Goals />
      )}
    </PageWrapper>
  );
}
