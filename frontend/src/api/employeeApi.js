// frontend/src/api/employeeApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

// API functions
export const employeeApiCalls = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/employees', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
  },
  create: async (formData) => {
    const response = await axiosInstance.post('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async ({ id, data }) => {
    const response = await axiosInstance.put(`/employees/${id}`, data);
    return response.data;
  },
  patch: async ({ id, data }) => {
    const response = await axiosInstance.patch(`/employees/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/employees/${id}`);
    return response.data;
  },
  updatePhoto: async ({ id, formData }) => {
    const response = await axiosInstance.patch(`/employees/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateMyProfile: async (data) => {
    const response = await axiosInstance.patch('/employees/me', data);
    return response.data;
  },
  updateMyPhoto: async (file) => {
    const form = new FormData();
    form.append('photo', file);
    const response = await axiosInstance.patch('/employees/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// React Query Hooks
export function useEmployees(params) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApiCalls.getAll(params),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeApiCalls.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApiCalls.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create employee.');
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApiCalls.update,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['employees', id] });
      toast.success('Employee updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update employee.');
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApiCalls.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee removed successfully.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee.');
    },
  });
}

export function useUpdateEmployeePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApiCalls.updatePhoto,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['employees', id] });
      toast.success('Photo updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update photo.');
    },
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApiCalls.updateMyProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    },
  });
}

  export function useUpdateMyPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApiCalls.updateMyPhoto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Photo updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update photo.');
    },
  });
}
