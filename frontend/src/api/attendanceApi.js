// frontend/src/api/attendanceApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

export const attendanceApiCalls = {
  getAll: async (params) => {
    const response = await axiosInstance.get('/attendance', { params });
    return response.data;
  },
  getMy: async (params) => {
    const response = await axiosInstance.get('/attendance/my', { params });
    return response.data;
  },
  checkIn: async () => {
    const response = await axiosInstance.post('/attendance/check-in');
    return response.data;
  },
  checkOut: async () => {
    const response = await axiosInstance.patch('/attendance/check-out');
    return response.data;
  },
  manualEntry: async (data) => {
    const response = await axiosInstance.post('/attendance/manual', data);
    return response.data;
  },
};

export function useAttendance(params) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => attendanceApiCalls.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useMyAttendance(params) {
  return useQuery({
    queryKey: ['attendance', 'my', params],
    queryFn: () => attendanceApiCalls.getMy(params),
    staleTime: 30 * 1000,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApiCalls.checkIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked in successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Check-in failed. Already checked in today?');
    },
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApiCalls.checkOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked out successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Check-out failed.');
    },
  });
}

export function useManualAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApiCalls.manualEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance entry added!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add attendance entry.');
    },
  });
}
