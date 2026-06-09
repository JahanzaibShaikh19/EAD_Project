import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import { useSubmitLeave } from '../../api/leaveApi';
import { LEAVE_TYPES, INPUT_CLASS } from '../../utils/constants';

const leaveSchema = z.object({
  leave_type:  z.string().min(1, 'Leave type is required'),
  start_date:  z.string().min(1, 'Start date is required'),
  end_date:    z.string().min(1, 'End date is required'),
  reason:      z.string().optional(),
}).refine((data) => {
  if (!data.start_date || !data.end_date) return true;
  return new Date(data.end_date) >= new Date(data.start_date);
}, { message: 'End date must be on or after start date', path: ['end_date'] });

export default function LeaveForm({ open, onClose }) {
  const { mutate: submitLeave, isPending } = useSubmitLeave();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leave_type: '', start_date: '', end_date: '', reason: '' },
  });

  const onSubmit = (data) => {
    submitLeave(data, { onSuccess: () => { reset(); onClose(); } });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[480px] p-0 border-0 rounded-[32px] shadow-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Apply for Leave
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Submit a new leave request for approval.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Leave Type
              </label>
              <select id="leave-type" {...register('leave_type')} className={INPUT_CLASS} style={{ borderColor: errors.leave_type ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }}>
                <option value="">Select leave type...</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.leave_type && <p className="text-xs text-red-500 mt-1">{errors.leave_type.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Start Date
                </label>
                <input id="leave-start" type="date" {...register('start_date')} className={INPUT_CLASS} style={{ borderColor: errors.start_date ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }} />
                {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  End Date
                </label>
                <input id="leave-end" type="date" {...register('end_date')} className={INPUT_CLASS} style={{ borderColor: errors.end_date ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }} />
                {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Reason
              </label>
              <textarea
                id="leave-reason"
                {...register('reason')}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
                style={{ borderColor: 'var(--color-border)' }}
                placeholder="Brief reason for your leave request..."
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
                id="submit-leave-btn"
                disabled={isPending}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-primary)' }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
