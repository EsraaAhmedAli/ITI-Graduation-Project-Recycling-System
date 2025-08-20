// hooks/useDashboardData.ts - Ultra Conservative Version
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import api from '@/lib/axios';

import { normalizeApiResponse, transformUserGrowthData, transformCitiesData } from '../utils/dataTransformers';
import { DashboardData, LoadingState } from '@/components/Types/dashboard.types';

// Combined fetch function that gets all data at once
const fetchAllDashboardData = async (): Promise<DashboardData> => {
  console.log('Fetching dashboard data...'); // Debug log
  
  const [analyticsRes, usersRes, materialsRes, statsRes, citiesRes, categoriesRes] = await Promise.allSettled([
    api.get("/orders/analytics"),
    api.get("/users/points/leaderboard"),
    api.get("/top-materials-recycled"),
    api.get("/stats"),
    api.get('/orders/analytics/top-cities'),
    api.get("categories/get-items"),
  ]);

  // Process analytics
  let totalOrders = 0;
  let orderStatus = {};
  let ordersPerDay = [];
  if (analyticsRes.status === 'fulfilled') {
    const json = normalizeApiResponse(analyticsRes.value.data);
    if (json.success) {
      totalOrders = json.data.totalOrders;
      orderStatus = json.data.statusCounts;
      ordersPerDay = json.data.dailyOrders || [];
    }
  }

  // Process users
  let topUsers = [];
  if (usersRes.status === 'fulfilled') {
    const json = normalizeApiResponse(usersRes.value.data);
    if (json.success) {
      topUsers = json.data;
    }
  }

  // Process materials
  let topMaterials = [];
  if (materialsRes.status === 'fulfilled') {
    const json = normalizeApiResponse(materialsRes.value.data);
    if (json.success) {
      topMaterials = json.data || [];
    }
  }

  // Process user stats
  let userGrowth = [];
  if (statsRes.status === 'fulfilled') {
    const data = normalizeApiResponse(statsRes.value.data);
    userGrowth = transformUserGrowthData(data);
  }

  // Process cities
  let citiesData = null;
  if (citiesRes.status === 'fulfilled') {
    const data = normalizeApiResponse(citiesRes.value.data);
    citiesData = transformCitiesData(data);
  }

  // Process categories
  let categories = [];
  if (categoriesRes.status === 'fulfilled') {
    const json = normalizeApiResponse(categoriesRes.value.data);
    if (json.success) {
      categories = json.data;
    }
  }

  return {
    totalOrders,
    orderStatus,
    ordersPerDay,
    topUsers,
    userGrowth,
    topMaterials,
    citiesData,
    categories,
  };
};

export const useDashboardData = () => {
  const query = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchAllDashboardData,
    staleTime: 10 * 60 * 1000, // 10 minutes - very conservative
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Never refetch on mount if we have cached data
    refetchOnReconnect: false,
    refetchInterval: false, // Disable automatic refetching
  });

  const { data, isLoading, error, refetch, isFetching } = query;

  // Default data structure
  const defaultData: DashboardData = useMemo(() => ({
    totalOrders: 0,
    orderStatus: {},
    ordersPerDay: [],
    topUsers: [],
    userGrowth: [],
    topMaterials: [],
    citiesData: null,
    categories: [],
  }), []);

  // Only show loading on initial load, not refetch
  const loading: LoadingState = useMemo(() => {
    const showLoading = isLoading && !data;
    return {
      analytics: showLoading,
      users: showLoading,
      materials: showLoading,
      userStats: showLoading,
      cities: showLoading,
      categories: showLoading,
    };
  }, [isLoading, data]);

  const fetchTopMaterials = async (category = 'All') => {
    // For category filtering, you might want to create a separate query
    // For now, just refetch all data
    return refetch();
  };

  return {
    data: data || defaultData,
    loading,
    error: error?.message || null,
    refetch,
    fetchTopMaterials,
    isFetching,
  };
};