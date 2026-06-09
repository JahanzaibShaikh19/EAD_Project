// frontend/src/api/leaveApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

export const leaveApiCalls = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/leave', { params });
    return response.data;
  },
  getMy: async () => {
    const response = await axiosInstance.get('/leave/my');
    return response.data;
  },
  getCalendar: async (params) => {
    const response = await axiosInstance.get('/leave/calendar', { params });
    return response.data;
  },
  submit: async (data) => {
    const response = await axiosInstance.post('/leave', data);
    return response.data;
  },
  approve: async (id) => {
    const response = await axiosInstance.patch(`/leave/${id}/approve`);
    return response.data;
  },
  reject: async (id) => {
    const response = await axiosInstance.patch(`/leave/${id}/reject`);
    return response.data;
  },
  cancel: async (id) => {
    const response = await axiosInstance.delete(`/leave/${id}`);
    return response.data;
  },
};

export function useLeaveRequests(params) {
  return useQuery({
    queryKey: ['leave', params],
    queryFn: () => leaveApiCalls.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useMyLeaveRequests() {
  return useQuery({
    queryKey: ['leave', 'my'],
    queryFn: leaveApiCalls.getMy,
    staleTime: 30 * 1000,
  });
}

export function useLeaveCalendar(params) {
  return useQuery({
    queryKey: ['leave', 'calendar', params],
    queryFn: () => leaveApiCalls.getCalendar(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leaveApiCalls.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request submitted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request.');
    },
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leaveApiCalls.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Leave request approved!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve leave.');
    },
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leaveApiCalls.reject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request rejected.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject leave.');
    },
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leaveApiCalls.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request cancelled.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel leave.');
    },
  });
}
