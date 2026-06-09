import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useResetPassword } from '../../api/authApi';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isValidToken, setIsValidToken] = useState(true);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const onSubmit = (data) => {
    resetPassword({ token, newPassword: data.password });
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="card w-full max-w-md p-8 shadow-xl text-center">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: 'var(--color-text-primary)' }}>Invalid Link</h1>
          <p className="text-sm mt-2 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary w-full justify-center">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="card w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: 'var(--color-text-primary)' }}>Create New Password</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Your new password must be different from previous used passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              New Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`input-base w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
              disabled={isPending}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <span>•</span> {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={`input-base w-full ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
              disabled={isPending}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                <span>•</span> {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full justify-center mt-2"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
