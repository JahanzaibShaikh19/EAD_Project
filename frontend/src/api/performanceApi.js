// frontend/src/api/performanceApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

export const performanceApiCalls = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/performance', { params });
    return response.data;
  },
  getMy: async () => {
    const response = await axiosInstance.get('/performance/my');
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/performance/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/performance', data);
    return response.data;
  },
  update: async ({ id, data }) => {
    const response = await axiosInstance.put(`/performance/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/performance/${id}`);
    return response.data;
  },
};

export function usePerformanceReviews(params) {
  return useQuery({
    queryKey: ['performance', params],
    queryFn: () => performanceApiCalls.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useMyPerformanceReviews() {
  return useQuery({
    queryKey: ['performance', 'my'],
    queryFn: performanceApiCalls.getMy,
    staleTime: 30 * 1000,
  });
}

export function usePerformanceReview(id) {
  return useQuery({
    queryKey: ['performance', id],
    queryFn: () => performanceApiCalls.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreatePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: performanceApiCalls.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review created!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create review.');
    },
  });
}

export function useUpdatePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: performanceApiCalls.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update review.');
    },
  });
}

export function useDeletePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: performanceApiCalls.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review deleted.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete review.');
    },
  });
}
