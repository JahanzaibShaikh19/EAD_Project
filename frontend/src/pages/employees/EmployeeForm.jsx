import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, X, Check } from 'lucide-react';
import {
  Dialog, DialogContent,
} from '../../components/ui/dialog';
import { useDepartments } from '../../api/departmentApi';
import { useCreateEmployee, useUpdateEmployee } from '../../api/employeeApi';
import { CONTRACT_TYPES, EMPLOYEE_STATUSES, INPUT_CLASS } from '../../utils/constants';

const employeeSchema = z.object({
  first_name:    z.string().min(1, 'First name is required'),
  last_name:     z.string().min(1, 'Last name is required'),
  email:         z.string().email('Valid email required'),
  phone:         z.string().optional(),
  hire_date:     z.string().min(1, 'Hire date is required'),
  department_id: z.string().optional(),
  position_title:z.string().optional(),
  contract_type: z.string().min(1, 'Contract type is required'),
  salary:        z.string().min(1, 'Salary is required'),
  address:       z.string().optional(),
  status:        z.string().optional(),
});

export default function EmployeeForm({ open, onClose, employee }) {
  const isEdit = !!employee;
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(employee?.photo_url || null);

  const { data: deptData } = useDepartments();
  const departments = deptData?.data || [];

  const { mutate: createEmployee, isPending: creating } = useCreateEmployee();
  const { mutate: updateEmployee, isPending: updating } = useUpdateEmployee();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name:    employee?.first_name || '',
      last_name:     employee?.last_name || '',
      email:         employee?.email || '',
      phone:         employee?.phone || '',
      hire_date:     employee?.hire_date?.substring(0, 10) || '',
      department_id: employee?.department_id || '',
      position_title:employee?.position_title || '',
      contract_type: employee?.contract_type || 'full-time',
      salary:        employee?.salary?.toString() || '',
      address:       employee?.address || '',
      status:        employee?.status || 'active',
    },
  });

  const contractType = watch('contract_type');
  const status = watch('status');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('firstName', data.first_name);
    formData.append('lastName', data.last_name);
    formData.append('email', data.email);
    
    if (data.phone) formData.append('phone', data.phone);
    if (data.hire_date) formData.append('hire_date', data.hire_date);
    if (data.department_id) formData.append('department_id', data.department_id);
    if (data.position_title) formData.append('position_title', data.position_title);
    if (data.contract_type) formData.append('contract_type', data.contract_type);
    if (data.salary) formData.append('salary', data.salary);
    if (data.address) formData.append('address', data.address);
    if (isEdit && data.status) formData.append('status', data.status);
    
    if (photoFile) formData.append('photo', photoFile);

    if (isEdit) {
      updateEmployee({ id: employee.id, data: formData }, { onSuccess: () => { reset(); onClose(); setStep(1); } });
    } else {
      createEmployee(formData, { onSuccess: () => { reset(); onClose(); setStep(1); } });
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (step < totalSteps) {
      nextStep();
    } else {
      handleSubmit(onSubmit)(e);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ['first_name', 'last_name', 'email', 'phone'];
    if (step === 2) fieldsToValidate = ['department_id', 'position_title', 'contract_type', 'salary', 'hire_date'];
    if (step === 3) fieldsToValidate = ['address', 'status'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleClose = () => {
    reset();
    setStep(1);
    setPhotoFile(null);
    setPhotoPreview(employee?.photo_url || null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="w-[480px] p-0 border-0 rounded-[32px] shadow-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        
        <div className="p-8">
          {/* Progress Bar & Step Indicator */}
          <div className="mb-8">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Step {step}/{totalSteps}
            </p>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full" 
                style={{ width: `${(step / totalSteps) * 100}%`, background: 'var(--color-primary)' }} 
              />
            </div>
          </div>

          <form onSubmit={onFormSubmit}>
            
            <div className="h-[420px] overflow-y-auto pr-4 flex flex-col justify-start custom-scrollbar">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>Personal Information</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Let's start with the basics. Who are we onboarding?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>First Name</label>
                    <input {...register('first_name')} className={INPUT_CLASS} style={{ borderColor: errors.first_name ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="Sarah" />
                    {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Last Name</label>
                    <input {...register('last_name')} className={INPUT_CLASS} style={{ borderColor: errors.last_name ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="Connor" />
                    {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email Address</label>
                  <input type="email" {...register('email')} className={INPUT_CLASS} style={{ borderColor: errors.email ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="sarah@hrflow.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Phone Number</label>
                  <input type="tel" {...register('phone')} className={INPUT_CLASS} style={{ borderColor: errors.phone ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            )}

            {/* Step 2: Role & Compensation */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>Role & Details</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>What role will they play in the company?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Job type</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTRACT_TYPES.map(type => {
                      const isSelected = contractType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setValue('contract_type', type.value, { shouldValidate: true })}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2`}
                          style={{
                            borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                            background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                            color: isSelected ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
                          }}
                        >
                          {isSelected && <Check size={14} />}
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.contract_type && <p className="text-xs text-red-500 mt-1">{errors.contract_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Expected salary range</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>$</span>
                    <input type="number" {...register('salary')} className={INPUT_CLASS} style={{ paddingLeft: '2rem', borderColor: errors.salary ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="80000" />
                  </div>
                  {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Your role</label>
                    <input {...register('position_title')} className={INPUT_CLASS} style={{ borderColor: errors.position_title ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="e.g. UI/UX designer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Department</label>
                    <select {...register('department_id')} className={INPUT_CLASS} style={{ cursor: 'pointer', borderColor: errors.department_id ? 'var(--color-danger)' : 'var(--color-border)' }}>
                      <option value="">Select...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Start Date</label>
                  <input type="date" {...register('hire_date')} className={INPUT_CLASS} style={{ cursor: 'pointer', borderColor: errors.hire_date ? 'var(--color-danger)' : 'var(--color-border)' }} />
                  {errors.hire_date && <p className="text-xs text-red-500 mt-1">{errors.hire_date.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Location & Status */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>Location & Status</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Where will they be working from?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Residential Address</label>
                  <textarea {...register('address')} rows={3} className={`${INPUT_CLASS} resize-none`} style={{ borderColor: errors.address ? 'var(--color-danger)' : 'var(--color-border)' }} placeholder="123 Corporate Blvd..." />
                </div>

                {isEdit && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Account Status</label>
                    <div className="flex flex-wrap gap-2">
                      {EMPLOYEE_STATUSES.map(s => {
                        const isSelected = status === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setValue('status', s.value, { shouldValidate: true })}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2`}
                            style={{
                              borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                              background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                              color: isSelected ? 'var(--color-primary-hover)' : 'var(--color-text-secondary)',
                            }}
                          >
                            {isSelected && <Check size={14} />}
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Photo */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-text-primary)' }}>Profile Photo</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Upload a professional headshot for their profile.</p>
                </div>

                <div
                  {...getRootProps()}
                  className="w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all"
                  style={{
                    borderColor: isDragActive ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isDragActive ? 'var(--color-primary-light)' : 'var(--color-bg)',
                  }}
                >
                  <input {...getInputProps()} />
                  {photoPreview ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md group">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white" size={24} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--color-primary-light)' }}>
                        <Upload size={20} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Click or drag photo here</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>

                {photoPreview && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors hover:bg-red-50 hover:text-red-600"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <X size={16} /> Remove Photo
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between mt-4 pt-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={step === 1 ? handleClose : prevStep}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {isEdit ? 'Save Changes' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
