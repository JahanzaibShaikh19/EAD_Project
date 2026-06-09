import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useForgotPassword } from '../../api/authApi';
import { INPUT_CLASS } from '../../utils/constants';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Valid email is required' }),
});

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data) => {
    forgotPassword(data.email, {
      onSuccess: () => setIsSubmitted(true)
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="card w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: 'var(--color-text-primary)' }}>Forgot Password</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="p-4 rounded-lg bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium">Check your email for a reset link.</p>
              <p className="text-xs mt-1 opacity-80">If it doesn't appear within a few minutes, check your spam folder.</p>
            </div>
            <Link to="/login" className="btn-secondary w-full justify-center">
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`${INPUT_CLASS} w-full`}
                style={{ borderColor: errors.email ? 'var(--color-danger)' : 'var(--color-border)' }}
                placeholder="name@company.com"
                disabled={isPending}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                  <span>•</span> {errors.email.message}
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
                  Sending link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
