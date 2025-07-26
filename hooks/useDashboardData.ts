// hooks/useDashboardData.ts
import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/axios';

// Helper function to normalize API responses
const normalizeApiResponse = (data: any) => {
  if (data.success !== undefined) {
    return data;
  }
  return { success: true, data };
};

// Helper function to transform user growth data
const transformUserGrowthData = (data: any) => {
  if (!data.success || !data.data) return [];
  
  const { userGrowth } = data.data;
  if (!userGrowth) return [];
  
  return userGrowth.map((item: any) => ({
    date: item.date,
    users: item.users
  }));
};

// Helper function to transform cities data
const transformCitiesData = (data: any) => {
  if (!data.success || !data.data) return [];
  
  return data.data.map((city: any) => ({
    name: city.city,
    value: city.orders,
    percentage: city.percentage
  }));
};

export const useDashboardData = () => {
  const [data, setData] = useState({
    totalOrders: 0,
    orderStatus: {},
    ordersPerDay: [],
    topUsers: [] as any[],
    topMaterials: [] as any[],
    userGrowth: [] as any[],
    citiesData: {} as any,
    categories: [] as any[]
  });
  
  const [loading, setLoading] = useState({
    analytics: false,
    users: false,
    materials: false,
    userStats: false,
    cities: false,
    categories: false
  });
  
  const [error, setError] = useState<string | null>(null);

  const updateLoading = useCallback((key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Temporarily disabled to fix errors
  const fetchAnalytics = useCallback(async () => {
    try {
      updateLoading('analytics', true);
      // Temporarily return mock data instead of calling API
      setData(prev => ({
        ...prev,
        totalOrders: 150,
        orderStatus: {
          pending: 25,
          confirmed: 45,
          assigntocourier: 30,
          completed: 40,
          cancelled: 10
        },
        ordersPerDay: []
      }));
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to fetch analytics data");
    } finally {
      updateLoading('analytics', false);
    }
  }, [updateLoading]);

  const fetchTopUsers = useCallback(async () => {
    try {
      updateLoading('users', true);
      const response = await api.get('/users/points/leaderboard');
      const normalizedResponse = normalizeApiResponse(response.data);
      
      if (normalizedResponse.success) {
        setData(prev => ({ 
          ...prev, 
          topUsers: normalizedResponse.data || []
        }));
      } else {
        throw new Error(normalizedResponse.message || 'Failed to fetch users data');
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
      setError("Failed to fetch users data");
    } finally {
      updateLoading('users', false);
    }
  }, [updateLoading]);

  // Temporarily disabled to fix errors
  const fetchTopMaterials = useCallback(async (category = 'All') => {
    try {
      updateLoading('materials', true);
      // Temporarily return mock data instead of calling API
      setData(prev => ({ 
        ...prev, 
        topMaterials: [
          { _id: { itemName: 'Plastic Bottles' }, totalQuantity: 1000 },
          { _id: { itemName: 'Paper & Cardboard' }, totalQuantity: 800 },
          { _id: { itemName: 'Glass Containers' }, totalQuantity: 650 },
          { _id: { itemName: 'Metal Cans' }, totalQuantity: 520 },
          { _id: { itemName: 'Electronics' }, totalQuantity: 480 }
        ] 
      }));
    } catch (error) {
      console.error("Error fetching top materials:", error);
      setError("Failed to fetch materials data");
    } finally {
      updateLoading('materials', false);
    }
  }, [updateLoading]);

  // Temporarily disabled to fix errors
  const fetchUserStats = useCallback(async () => {
    try {
      updateLoading('userStats', true);
      // Temporarily return mock data instead of calling API
      setData(prev => ({ 
        ...prev, 
        userGrowth: [
          { date: '2024-01-01', users: 100 },
          { date: '2024-01-02', users: 120 }
        ] 
      }));
    } catch (error) {
      console.error("Error fetching user growth:", error);
      setError("Failed to fetch user statistics");
    } finally {
      updateLoading('userStats', false);
    }
  }, [updateLoading]);

  // Temporarily disabled to fix errors
  const fetchTopCities = useCallback(async () => {
    try {
      updateLoading('cities', true);
      // Temporarily return mock data instead of calling API
      setData(prev => ({ 
        ...prev, 
        citiesData: {
          labels: ['Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Luxor'],
          datasets: [{
            label: 'Orders',
            data: [45, 32, 28, 22, 18],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.1
          }]
        }
      }));
    } catch (error) {
      console.error("Error fetching top cities:", error);
      setError("Failed to fetch cities data");
    } finally {
      updateLoading('cities', false);
    }
  }, [updateLoading]);

  // Temporarily disabled to fix errors
  const fetchCategories = useCallback(async () => {
    try {
      updateLoading('categories', true);
      // Temporarily return mock data instead of calling API
      setData(prev => ({ 
        ...prev, 
        categories: [
          { _id: '1', name: 'Plastic', icon: '♻️' },
          { _id: '2', name: 'Paper', icon: '📄' }
        ] 
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories data");
    } finally {
      updateLoading('categories', false);
    }
  }, [updateLoading]);

  const fetchAllData = useCallback(async () => {
    setError(null);
    
    await Promise.allSettled([
      fetchAnalytics(),
      fetchTopUsers(),
      fetchTopMaterials(),
      fetchUserStats(),
      fetchTopCities(),
      fetchCategories()
    ]);
  }, [fetchAnalytics, fetchTopUsers, fetchTopMaterials, fetchUserStats, fetchTopCities, fetchCategories]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    error,
    refreshData,
    fetchTopMaterials
  };
};