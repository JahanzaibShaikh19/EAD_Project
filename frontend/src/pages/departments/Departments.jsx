import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Building2, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import SearchInput from '../../components/shared/SearchInput';
import { Skeleton } from '../../components/ui/skeleton';
import {
  useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
} from '../../api/departmentApi';
import { INPUT_CLASS } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

const deptSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
});

const DEPT_COLORS = [
  '#1A6B5A', '#2D9E80', '#2563EB', '#7C3AED', '#D97706', '#DC2626',
  '#0891B2', '#059669', '#C026D3', '#65A30D',
];

function DeptFormDialog({ open, onClose, department }) {
  const isEdit = !!department;
  const { mutate: create, isPending: creating } = useCreateDepartment();
  const { mutate: update, isPending: updating } = useUpdateDepartment();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
    },
  });

  const onSubmit = (data) => {
    if (isEdit) {
      update({ id: department.id, data }, { onSuccess: () => { reset(); onClose(); } });
    } else {
      create(data, { onSuccess: () => { reset(); onClose(); } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[480px] p-0 border-0 rounded-[32px] shadow-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {isEdit ? 'Edit Department' : 'Add Department'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your organization's departments.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Department Name
              </label>
              <input
                id="dept-name"
                {...register('name')}
                className={INPUT_CLASS}
                style={{ borderColor: errors.name ? 'var(--color-danger)' : 'var(--color-border)' }}
                placeholder="e.g. Engineering"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Description
              </label>
              <textarea
                id="dept-description"
                {...register('description')}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
                style={{ borderColor: errors.description ? 'var(--color-danger)' : 'var(--color-border)' }}
                placeholder="Brief description of the department..."
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
                {isEdit ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeptCard({ dept, colorIdx, onEdit, onDelete }) {
  const color = DEPT_COLORS[colorIdx % DEPT_COLORS.length];
  return (
    <div
      className="stat-card card card-hover p-5 flex flex-col"
      style={{ minHeight: '160px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Building2 size={20} style={{ color }} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(dept)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit"
            id={`edit-dept-${dept.id}`}
          >
            <Pencil size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
          <button
            onClick={() => onDelete(dept)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
            id={`delete-dept-${dept.id}`}
          >
            <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
          </button>
        </div>
      </div>

      <h3 className="font-heading font-semibold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {dept.name}
      </h3>
      {dept.description && (
        <p className="text-sm flex-1 mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
          {dept.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 mt-auto pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Users size={13} style={{ color: 'var(--color-text-tertiary)' }} />
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>{dept.employee_count || 0}</strong> employees
        </span>
        {dept.manager_name && (
          <>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Manager: {dept.manager_name}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Departments() {
  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useDepartments({ search: debouncedSearch || undefined });
  const { mutate: deleteFn, isPending: deleting } = useDeleteDepartment();

  const departments = data?.data || [];

  function handleDeleteConfirm() {
    deleteFn(deleteDept.id, { onSettled: () => setDeleteDept(null) });
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments`}
        actions={
          <button
            id="add-department-btn"
            onClick={() => { setEditDept(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--color-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            <Plus size={14} /> Add Department
          </button>
        }
      />

      <div className="data-card flex flex-wrap items-center gap-3 mb-4 p-4"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}>
        <SearchInput
          value={search}
          onChange={(v) => setSearch(v)}
          placeholder="Search departments..."
          id="department-search"
        />
        {search && (
          <button
            className="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => setSearch('')}
          >
            Clear search
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card card" style={{ height: '160px' }}>
              <Skeleton className="h-12 w-12 rounded-xl mb-3" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="data-card card">
          <EmptyState
            type="default"
            title={search ? "No departments found" : "No departments yet"}
            description={search ? "Try adjusting your search query." : "Create your first department to start organizing your team."}
            action={
              !search && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Add Department
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.map((dept, idx) => (
            <DeptCard
              key={dept.id}
              dept={dept}
              colorIdx={idx}
              onEdit={(d) => { setEditDept(d); setShowForm(true); }}
              onDelete={setDeleteDept}
            />
          ))}
        </div>
      )}

      {showForm && (
        <DeptFormDialog
          open={showForm}
          onClose={() => { setShowForm(false); setEditDept(null); }}
          department={editDept}
        />
      )}

      <ConfirmDialog
        open={!!deleteDept}
        onOpenChange={(open) => !open && setDeleteDept(null)}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteDept?.name}"? This cannot be undone and will fail if employees are assigned to it.`}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </PageWrapper>
  );
}
