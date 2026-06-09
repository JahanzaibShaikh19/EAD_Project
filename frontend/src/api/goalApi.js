import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

export const goalApiCalls = {
  getCycles: async () => {
    const response = await axiosInstance.get('/goals/cycles');
    return response.data;
  },
  getAll: async ({ employee_id, cycle_id }) => {
    const params = { employee_id, cycle_id };
    const response = await axiosInstance.get('/goals', { params });
    return response.data;
  },
  getMy: async (cycle_id) => {
    const params = cycle_id ? { cycle_id } : {};
    const response = await axiosInstance.get('/goals/my', { params });
    return response.data;
  },
  getSummary: async (cycle_id) => {
    const params = cycle_id ? { cycle_id } : {};
    const response = await axiosInstance.get('/goals/summary', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/goals', data);
    return response.data;
  },
  update: async ({ id, data }) => {
    const response = await axiosInstance.put(`/goals/${id}`, data);
    return response.data;
  },
  updateProgress: async ({ id, progress }) => {
    const response = await axiosInstance.patch(`/goals/${id}/progress`, { progress });
    return response.data;
  },
  updateKRProgress: async ({ id, progress }) => {
    const response = await axiosInstance.patch(`/goals/key-results/${id}/progress`, { progress });
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/goals/${id}`);
    return response.data;
  }
};

export function useCycles() {
  return useQuery({
    queryKey: ['goals', 'cycles'],
    queryFn: goalApiCalls.getCycles,
  });
}

export function useGoals(filters = {}) {
  return useQuery({
    queryKey: ['goals', filters],
    queryFn: () => goalApiCalls.getAll(filters),
  });
}

export function useMyGoals(cycle_id) {
  return useQuery({
    queryKey: ['goals', 'my', cycle_id],
    queryFn: () => goalApiCalls.getMy(cycle_id),
  });
}

export function useGoalSummary(cycle_id) {
  return useQuery({
    queryKey: ['goals', 'summary', cycle_id],
    queryFn: () => goalApiCalls.getSummary(cycle_id),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApiCalls.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    }
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApiCalls.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update goal');
    }
  });
}

export function useUpdateGoalProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApiCalls.updateProgress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateKRProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApiCalls.updateKRProgress,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalApiCalls.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete goal');
    }
  });
}
