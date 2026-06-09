// frontend/src/api/departmentApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

export const departmentApiCalls = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/departments', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/departments', data);
    return response.data;
  },
  update: async ({ id, data }) => {
    const response = await axiosInstance.put(`/departments/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/departments/${id}`);
    return response.data;
  },
};

export function useDepartments(params) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentApiCalls.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentApiCalls.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create department.');
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentApiCalls.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update department.');
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentApiCalls.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete department.');
    },
  });
}
