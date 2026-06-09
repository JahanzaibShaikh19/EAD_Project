// frontend/src/api/announcementApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';
import { toast } from 'sonner';

export const announcementApiCalls = {
  getAll: async () => {
    const response = await axiosInstance.get('/announcements');
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/announcements', data);
    return response.data;
  },
  update: async ({ id, data }) => {
    const response = await axiosInstance.put(`/announcements/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/announcements/${id}`);
    return response.data;
  },
};

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: announcementApiCalls.getAll,
    staleTime: 60 * 1000,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: announcementApiCalls.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement posted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post announcement.');
    },
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: announcementApiCalls.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update announcement.');
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: announcementApiCalls.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete announcement.');
    },
  });
}
