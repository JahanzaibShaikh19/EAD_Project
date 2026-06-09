// frontend/src/pages/auth/Login.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import { Leaf, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../api/authApi';
import { INPUT_CLASS } from '../../utils/constants';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef(null);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from('.login-logo', { y: -30, opacity: 0, duration: 0.5, ease: 'power2.out' })
        .from('.login-card', { y: 20, opacity: 0, scale: 0.97, duration: 0.45, ease: 'back.out(1.4)' }, '-=0.2')
        .from('.login-field', { y: 12, opacity: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' }, '-=0.1');
    });
    return () => ctx.revert();
  }, []);

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-primary-light) 100%)' }}
    >
      {/* Logo */}
      <div className="login-logo flex items-center gap-3 mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
          style={{ background: 'var(--color-primary)' }}
        >
          <Leaf size={22} className="text-white" />
        </div>
        <div>
          <h1
            className="font-heading font-bold"
            style={{ fontSize: '24px', color: 'var(--color-text-primary)', lineHeight: 1.1 }}
          >
            HRFlow
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            HR Management System
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div
        ref={cardRef}
        className="login-card w-full max-w-md"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--color-border)',
          padding: '36px',
        }}
      >
        <div className="mb-6">
          <h2
            className="font-heading font-semibold mb-1"
            style={{ fontSize: '22px', color: 'var(--color-text-primary)' }}
          >
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Sign in to your HRFlow account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email field */}
          <div className="login-field">
            <label
              htmlFor="login-email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="hr@hrflow.com"
                {...register('email')}
                className={`${INPUT_CLASS} !pl-9`}
                style={{
                  borderColor: errors.email ? 'var(--color-danger)' : 'var(--color-border)',
                }}
              />
            </div>
            {errors.email && (
              <p className="field-error mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="login-field">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register('password')}
                className={`${INPUT_CLASS} !pl-9 !pr-10`}
                style={{
                  borderColor: errors.password ? 'var(--color-danger)' : 'var(--color-border)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors hover:bg-gray-100"
              >
                {showPassword
                  ? <EyeOff size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  : <Eye size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                }
              </button>
            </div>
            {errors.password && (
              <p className="field-error mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-primary)' }}
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
        © 2026 HRFlow. All rights reserved.
      </p>
    </div>
  );
}
