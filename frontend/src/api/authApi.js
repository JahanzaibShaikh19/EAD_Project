// frontend/src/api/authApi.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';
import { setCredentials, clearCredentials } from '../store/authSlice';
import { toast } from 'sonner';

// API functions
export const authApiCalls = {
  login: async ({ email, password }) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data.data || response.data;
  },
  register: async (data) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data.data || response.data;
  },
  me: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data || response.data;
  },
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async ({ token, newPassword }) => {
    const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// React Query Hooks
export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApiCalls.login,
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApiCalls.register,
    onSuccess: () => {
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApiCalls.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApiCalls.forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset link sent to your email.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send password reset email.');
    },
  });
}

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApiCalls.resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successfully. Please log in.');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    },
  });
}

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    dispatch(clearCredentials());
    queryClient.clear();
    navigate('/login', { replace: true });
  };
}
