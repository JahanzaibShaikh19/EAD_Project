import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';

export const notificationApiCalls = {
  getMy: async () => {
    const response = await axiosInstance.get('/notifications/my');
    return response.data;
  },
  markRead: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await axiosInstance.patch('/notifications/my/read-all');
    return response.data;
  }
};

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApiCalls.getMy,
    refetchInterval: 30000, // Polling every 30s
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationApiCalls.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationApiCalls.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}
