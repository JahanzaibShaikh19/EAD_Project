// frontend/src/api/payrollApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

export const payrollApiCalls = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/payroll', { params });
    return response.data;
  },
  getMy: async () => {
    const response = await axiosInstance.get('/payroll/my');
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/payroll', data);
    return response.data;
  },
  update: async ({ id, data }) => {
    const response = await axiosInstance.put(`/payroll/${id}`, data);
    return response.data;
  },
  process: async (id) => {
    const response = await axiosInstance.patch(`/payroll/${id}/process`);
    return response.data;
  },
};

export function usePayroll(params) {
  return useQuery({
    queryKey: ['payroll', params],
    queryFn: () => payrollApiCalls.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useMyPayroll() {
  return useQuery({
    queryKey: ['payroll', 'my'],
    queryFn: payrollApiCalls.getMy,
    staleTime: 30 * 1000,
  });
}

export function useCreatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payrollApiCalls.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record created!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create payroll record.');
    },
  });
}

export function useUpdatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payrollApiCalls.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update payroll record.');
    },
  });
}

export function useProcessPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payrollApiCalls.process,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll processed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process payroll.');
    },
  });
}
