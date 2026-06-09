import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Target, Loader2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useGoals, useMyGoals, useCycles, useCreateGoal, useDeleteGoal, useUpdateKRProgress } from '../../api/goalApi';
import { useEmployees } from '../../api/employeeApi';
import { useAuth } from '../../hooks/useAuth';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import { INPUT_CLASS } from '../../utils/constants';

const goalSchema = z.object({
  employee_id: z.string().min(1, 'Employee required'),
  cycle_id: z.string().min(1, 'Cycle required'),
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  target: z.string().min(1, 'Target required'),
  key_results: z.array(z.object({
    title: z.string().min(1, 'Title required')
  })).min(1, 'At least one key result is required')
});

function CreateGoalDialog({ open, onClose, isHR, cycles }) {
  const { data: empData } = useEmployees(isHR ? { limit: 200 } : null);
  const { user } = useAuth();
  const employees = empData?.employees || empData?.data || [];
  
  const { mutate: createGoal, isPending } = useCreateGoal();
  
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      employee_id: isHR ? '' : (user?.id || ''),
      cycle_id: cycles?.[0]?.id || '',
      key_results: [{ title: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "key_results"
  });

  const onSubmit = (data) => {
    createGoal(data, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) {
        reset();
        onClose();
      }
    }}>
      <DialogContent className="w-[480px] p-0 border-0 rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: 'var(--color-surface)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Create OKR
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Set a new objective and key results.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isHR && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Employee
                </label>
                <select {...register('employee_id')} className={INPUT_CLASS} style={{ borderColor: errors.employee_id ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }}>
                  <option value="">Select employee...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
                {errors.employee_id && <p className="text-xs text-red-500 mt-1">{errors.employee_id.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Cycle
              </label>
              <select {...register('cycle_id')} className={INPUT_CLASS} style={{ borderColor: errors.cycle_id ? 'var(--color-danger)' : 'var(--color-border)', cursor: 'pointer' }}>
                <option value="">Select cycle...</option>
                {cycles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.cycle_id && <p className="text-xs text-red-500 mt-1">{errors.cycle_id.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Objective Title
              </label>
              <input type="text" {...register('title')} className={INPUT_CLASS} style={{ borderColor: errors.title ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="e.g., Improve Code Review" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Target / Metric
              </label>
              <input type="text" {...register('target')} className={INPUT_CLASS} style={{ borderColor: errors.target ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="e.g., 90% review rate" />
              {errors.target && <p className="text-xs text-red-500 mt-1">{errors.target.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Description
              </label>
              <textarea {...register('description')} className={`${INPUT_CLASS} resize-none`} rows={2} style={{ borderColor: 'var(--color-border)' }} placeholder="Objective details..." />
            </div>

            <div className="pt-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Key Results
              </label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      {...register(`key_results.${index}.title`)} 
                      className={INPUT_CLASS}
                      style={{ borderColor: errors.key_results?.[index]?.title ? 'var(--color-danger)' : 'var(--color-border)' }} 
                      placeholder={`Key Result ${index + 1}`} 
                    />
                    {errors.key_results?.[index]?.title && <p className="text-xs text-red-500 mt-1">{errors.key_results[index].title.message}</p>}
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="p-2 mb-auto mt-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              {errors.key_results?.root && <p className="text-xs text-red-500 mt-1 mb-2">{errors.key_results.root.message}</p>}
              <button 
                type="button" 
                onClick={() => append({ title: '' })} 
                className="text-sm font-medium mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-colors" 
                style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)', background: 'var(--color-primary-light)' }}
              >
                <Plus size={14} /> Add Key Result
              </button>
            </div>

            <div className="flex items-center justify-between mt-10 pt-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={() => { reset(); onClose(); }}
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
                Save OKR
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KeyResultItem({ kr }) {
  const { mutate: updateKRProgress } = useUpdateKRProgress();
  const [progress, setProgress] = useState(kr.progress || 0);

  const handleBlur = () => {
    if (progress !== kr.progress) {
      updateKRProgress({ id: kr.id, progress: Number(progress) });
    }
  };

  return (
    <div className="flex items-center justify-between text-sm py-2 border-b last:border-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
      <span style={{ color: 'var(--color-text-secondary)' }}>• {kr.title}</span>
      <div className="flex items-center gap-2">
        <input 
          type="number" 
          value={progress} 
          onChange={(e) => setProgress(e.target.value)}
          onBlur={handleBlur}
          min="0" max="100" 
          className="w-16 px-2 py-1 text-right border rounded-lg bg-transparent text-xs font-medium outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>%</span>
      </div>
    </div>
  );
}

export default function Goals({ employeeId }) {
  const { isHR } = useAuth();
  
  const { data: cyclesData } = useCycles();
  const cycles = cyclesData?.data || [];
  const [selectedCycle, setSelectedCycle] = useState('');
  
  const cycleId = selectedCycle || cycles[0]?.id || '';

  const { data: hrGoalsData, isLoading: hrLoading } = useGoals(isHR ? { cycle_id: cycleId } : null);
  const { data: myGoalsData, isLoading: myLoading } = useMyGoals(!isHR ? cycleId : null);
  
  const goals = isHR ? (hrGoalsData?.data || []) : (myGoalsData?.data || []);
  const isLoading = isHR ? hrLoading : myLoading;

  const [showCreate, setShowCreate] = useState(false);
  const [expandedGoals, setExpandedGoals] = useState({});

  const { mutate: deleteGoal } = useDeleteGoal();

  const toggleExpand = (id) => {
    setExpandedGoals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" style={{ color: 'var(--color-primary)' }} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-heading font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Target size={20} style={{ color: 'var(--color-primary)' }} /> Goals & OKRs
          </h3>
          {cycles.length > 0 && (
            <select 
              value={cycleId} 
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="text-sm px-3 py-2 rounded-xl border outline-none cursor-pointer"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        
        {isHR && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--color-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            <Plus size={16} /> Add OKR
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="card overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleExpand(goal.id)}
                >
                  <button className="p-1 rounded-md transition-colors" style={{ color: 'var(--color-text-tertiary)', hover: { background: 'var(--color-bg)' } }}>
                    {expandedGoals[goal.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <h4 className="font-medium text-base line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>{goal.title}</h4>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{goal.progress}%</span>
                    <div className="w-20 h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${goal.progress}%`, background: 'var(--color-primary)' }}></div>
                    </div>
                  </div>
                  {isHR && (
                    <button onClick={() => deleteGoal(goal.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {isHR && (
                <div className="text-sm mb-3 ml-10" style={{ color: 'var(--color-text-secondary)' }}>
                  Owner: <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{goal.first_name} {goal.last_name}</span>
                </div>
              )}
              
              <div className="ml-10 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Target: {goal.target}
              </div>

              {/* Key Results Expanded */}
              {expandedGoals[goal.id] && (
                <div className="mt-5 ml-10 pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Key Results</p>
                  <div className="space-y-1">
                    {goal.key_results?.map(kr => (
                      <KeyResultItem key={kr.id} kr={kr} />
                    ))}
                    {(!goal.key_results || goal.key_results.length === 0) && (
                      <p className="text-sm italic" style={{ color: 'var(--color-text-tertiary)' }}>No key results defined.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: 'var(--color-border)' }}>
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-base font-semibold" style={{ color: 'var(--color-text-secondary)' }}>No goals found in this cycle</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Start setting OKRs to track performance.</p>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateGoalDialog open={showCreate} onClose={() => setShowCreate(false)} isHR={isHR} cycles={cycles} />
      )}
    </div>
  );
}
