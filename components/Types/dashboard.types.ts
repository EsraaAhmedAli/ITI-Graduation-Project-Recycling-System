// types/dashboard.types.ts

export interface TopUser {
  id: string;
  userName: string;
  email: string;
  imageUrl?: string;
  totalPoints: number;
}

export interface TopMaterial {
  _id: {
    itemName: string;
  };
  totalQuantity: number;
}

export interface UserGrowthItem {
  label?: string;
  month?: string;
  name?: string;
  count?: number;
  users?: number;
  value?: number;
}

export interface OrderStatus {
  [status: string]: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    backgroundColor: string;
    tension: number;
    borderWidth: number;
    pointRadius: number;
    pointBackgroundColor: string;
    pointHoverRadius: number;
    pointHitRadius: number;
    pointBorderWidth: number;
    pointBorderColor: string;
  }>;
}

export interface DashboardData {
  totalOrders: number;
  orderStatus: OrderStatus;
  ordersPerDay: number[];
  topUsers: TopUser[];
  userGrowth: UserGrowthItem[];
  topMaterials: TopMaterial[];
  citiesData: ChartData | null;
  categories: string[];
}

export interface LoadingState {
  analytics: boolean;
  users: boolean;
  materials: boolean;
  userStats: boolean;
  cities: boolean;
  categories: boolean;
}

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'steady';
  trendValue?: string;
  loading?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export enum OrderStatusEnum {
  PENDING = 'Pending',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TrendType {
  UP = 'up',
  DOWN = 'down',
  STEADY = 'steady',
}