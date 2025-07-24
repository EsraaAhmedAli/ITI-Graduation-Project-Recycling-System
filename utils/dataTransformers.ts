// utils/dataTransformers.ts
import { UserGrowthItem, ChartData, ApiResponse } from '../components/Types';

export const normalizeApiResponse = <T>(response: any): ApiResponse<T> => {
  // Handle different API response structures
  if (response && response.success !== undefined) {
    return response;
  }
  
  // If response has data property but no success flag
  if (response && response.data) {
    return {
      success: true,
      data: response.data,
    };
  }
  
  // If response is direct data
  return {
    success: true,
    data: response,
  };
};

export const transformUserGrowthData = (data: any): UserGrowthItem[] => {
  try {
    let processedData = data;
    
    // Handle wrapped responses
    if (data && data.success && data.data) {
      processedData = data.data;
    }
    
    if (!Array.isArray(processedData)) {
      console.warn('User growth data is not an array:', processedData);
      return [];
    }
    
    // Sort by date to ensure proper chronological order
    const sortedData = processedData.sort((a: UserGrowthItem, b: UserGrowthItem) => {
      const dateA = new Date(a.label || a.month || a.name || '');
      const dateB = new Date(b.label || b.month || b.name || '');
      return dateA.getTime() - dateB.getTime();
    });
    
    return sortedData;
  } catch (error) {
    console.error('Error transforming user growth data:', error);
    return [];
  }
};

export const transformCitiesData = (data: any): ChartData | null => {
  try {
    const processedData = data.data || data;
    
    if (!Array.isArray(processedData) || processedData.length === 0) {
      console.warn('Cities data is empty or invalid:', processedData);
      return null;
    }
    
    const cities = processedData.map((entry: any) => entry.city || entry._id);
    const orderCounts = processedData.map((entry: any) => entry.totalOrders);
    
    return {
      labels: cities,
      datasets: [
        {
          label: 'Total Orders by City',
          data: orderCounts,
          fill: false,
          borderColor: '#22c55e',
          backgroundColor: '#16a34a',
          tension: 0,
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: '#15803d',
          pointHoverRadius: 7,
          pointHitRadius: 10,
          pointBorderWidth: 2,
          pointBorderColor: '#fff',
        },
      ],
    };
  } catch (error) {
    console.error('Error transforming cities data:', error);
    return null;
  }
};

export const formatMonthLabel = (monthString: string): string => {
  if (!monthString) return 'Unknown';
  
  // If already formatted or doesn't contain date separators
  if (!monthString.includes('-') && !monthString.includes('/')) {
    return monthString;
  }
  
  try {
    const date = new Date(monthString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  } catch {
    return monthString;
  }
};

export const getCurrentDayLabels = (): string[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Return days starting from Monday
  const reorderedDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (1 + i) % 7; // Start from Monday (index 1)
    reorderedDays.push(days[dayIndex]);
  }
  
  return reorderedDays;
};

export const calculateTrendPercentage = (current: number, previous: number): string => {
  if (previous === 0) return '0%';
  
  const percentage = ((current - previous) / previous) * 100;
  return `${Math.abs(Math.round(percentage))}%`;
};

export const getTrendType = (current: number, previous: number): 'up' | 'down' | 'steady' => {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'steady';
};