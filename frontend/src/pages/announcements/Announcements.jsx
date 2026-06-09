import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Megaphone, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import PageWrapper from '../../components/layout/PageWrapper';
import PageHeader from '../../components/shared/PageHeader';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import StatusBadge from '../../components/shared/StatusBadge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement,
} from '../../api/announcementApi';
import { useAuth } from '../../hooks/useAuth';
import { formatRelative } from '../../utils/helpers';
import { PRIORITY_LEVELS, INPUT_CLASS } from '../../utils/constants';

const annSchema = z.object({
  title:    z.string().min(1, 'Title is required'),
  content:  z.string().min(1, 'Content is required'),
  priority: z.string().min(1, 'Priority is required'),
});

const PRIORITY_BORDER = {
  low:    '#E5EAE8',
  normal: 'var(--color-info)',
  high:   'var(--color-warning)',
  urgent: 'var(--color-danger)',
};

function AnnFormDialog({ open, onClose, announcement }) {
  const isEdit = !!announcement;
  const { mutate: create, isPending: creating } = useCreateAnnouncement();
  const { mutate: update, isPending: updating } = useUpdateAnnouncement();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(annSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      priority: announcement?.priority || 'normal',
    },
  });

  const onSubmit = (data) => {
    if (isEdit) {
      update({ id: announcement.id, data }, { onSuccess: () => { reset(); onClose(); } });
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
              {isEdit ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Broadcast a message to all employees.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Title
              </label>
              <input 
                id="ann-title" 
                {...register('title')} 
                className={INPUT_CLASS} 
                style={{ borderColor: errors.title ? 'var(--color-danger)' : 'var(--color-border)' }} 
                placeholder="Announcement title..." 
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Priority
              </label>
              <select 
                id="ann-priority" 
                {...register('priority')} 
                className={INPUT_CLASS} 
                style={{ borderColor: 'var(--color-border)', cursor: 'pointer' }}
              >
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Content
              </label>
              <textarea
                id="ann-content"
                {...register('content')}
                rows={5}
                className={`${INPUT_CLASS} resize-none`}
                style={{ borderColor: errors.content ? 'var(--color-danger)' : 'var(--color-border)' }}
                placeholder="Write your announcement here..."
              />
              {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
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
                id="save-ann-btn"
                disabled={isPending}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-primary)' }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? 'Save Changes' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AnnouncementCard({ ann, isHR, onEdit, onDelete }) {
  const borderColor = PRIORITY_BORDER[ann.priority] || 'var(--color-border)';

  return (
    <div
      className="stat-card card card-hover p-5"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className="font-heading font-semibold"
            style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}
          >
            {ann.title}
          </h3>
          <StatusBadge type="priority" value={ann.priority} />
        </div>
        {isHR && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(ann)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              id={`edit-ann-${ann.id}`}
            >
              <Pencil size={13} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
            <button
              onClick={() => onDelete(ann)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              id={`delete-ann-${ann.id}`}
            >
              <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        {ann.content}
      </p>
      <div className="flex items-center gap-1.5">
        <Megaphone size={11} style={{ color: 'var(--color-text-tertiary)' }} />
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {formatRelative(ann.created_at)}
          {ann.creator_name && ` · Posted by ${ann.creator_name}`}
        </span>
      </div>
    </div>
  );
}

export default function Announcements() {
  const { isHR } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editAnn, setEditAnn] = useState(null);
  const [deleteAnn, setDeleteAnn] = useState(null);

  const { data, isLoading } = useAnnouncements();
  const { mutate: deleteOne, isPending: deleting } = useDeleteAnnouncement();

  const announcements = data?.data || [];

  return (
    <PageWrapper>
      <PageHeader
        title="Announcements"
        subtitle={`${announcements.length} announcements`}
        actions={
          isHR && (
            <button
              id="post-announcement-btn"
              onClick={() => { setEditAnn(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              <Plus size={14} /> Post Announcement
            </button>
          )
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card card p-5">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="data-card card">
          <EmptyState
            type="announcements"
            title="No announcements yet"
            description={isHR ? 'Post your first company announcement.' : 'No announcements have been posted yet.'}
            action={isHR && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: 'var(--color-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
              >
                Post Announcement
              </button>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              ann={ann}
              isHR={isHR}
              onEdit={(a) => { setEditAnn(a); setShowForm(true); }}
              onDelete={setDeleteAnn}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AnnFormDialog
          open={showForm}
          onClose={() => { setShowForm(false); setEditAnn(null); }}
          announcement={editAnn}
        />
      )}

      <ConfirmDialog
        open={!!deleteAnn}
        onOpenChange={(open) => !open && setDeleteAnn(null)}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${deleteAnn?.title}"?`}
        onConfirm={() => deleteOne(deleteAnn.id, { onSettled: () => setDeleteAnn(null) })}
        loading={deleting}
      />
    </PageWrapper>
  );
}
