// frontend/src/api/dashboardApi.js
import { useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosConfig';

export const dashboardApiCalls = {
  getStats: async ({ month, year } = {}) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await axiosInstance.get(`/dashboard/stats?${params.toString()}`);
    return response.data;
  },
  getMyDashboard: async ({ month, year } = {}) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await axiosInstance.get(`/dashboard/my?${params.toString()}`);
    return response.data;
  },
};

export function useDashboardStats(params = {}) {
  return useQuery({
    queryKey: ['dashboard', 'stats', params.month, params.year],
    queryFn: () => dashboardApiCalls.getStats(params),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export function useMyDashboard(params = {}) {
  return useQuery({
    queryKey: ['dashboard', 'my', params.month, params.year],
    queryFn: () => dashboardApiCalls.getMyDashboard(params),
    staleTime: 5 * 60 * 1000,
  });
}
