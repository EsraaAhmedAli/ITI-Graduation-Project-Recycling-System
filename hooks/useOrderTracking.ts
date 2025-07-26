import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPoints: number;
  image: string;
  points: number;
  measurement_unit: number;
  itemName: string;
}

interface Order {
  _id: string;
  userId: string;
  user: {
    userId: string;
    userName: string;
    phoneNumber: string;
    email: string;
    imageUrl: string;
  };
  items: OrderItem[];
  address: {
    city: string;
    area: string;
    street: string;
    building: string;
    floor: string;
  };
  status: 'pending' | 'confirmed' | 'assigntocourier' | 'completed' | 'cancelled';
  courier: {
    _id: string;
    name: string;
    email: string;
  } | null;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    notes: string;
  }>;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  safetyReports?: any[];
}

interface UseOrderTrackingProps {
  orderId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  onStatusChange?: (oldStatus: string, newStatus: string) => void;
}

export const useOrderTracking = ({
  orderId,
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds
  onStatusChange
}: UseOrderTrackingProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/orders?id=${orderId}`);
      
      if (response.data.success) {
        const newOrder = response.data.data;
        const oldStatus = order?.status;
        
        setOrder(newOrder);
        setLastUpdated(new Date());
        
        // Notify if status changed
        if (oldStatus && oldStatus !== newOrder.status && onStatusChange) {
          onStatusChange(oldStatus, newOrder.status);
          
          // Show toast for status changes
          const statusMessages = {
            'confirmed': '🎉 Your order has been confirmed!',
            'assigntocourier': '🚚 A driver has been assigned to your order!',
            'completed': '✅ Your order has been completed successfully!',
            'cancelled': '❌ Your order has been cancelled.'
          };
          
          if (statusMessages[newOrder.status as keyof typeof statusMessages]) {
            toast.success(statusMessages[newOrder.status as keyof typeof statusMessages]);
          }
        }
      } else {
        setError('Failed to fetch order');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, order?.status, onStatusChange]);

  // Initial fetch
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  // Auto-refresh for active orders
  useEffect(() => {
    if (!autoRefresh || !orderId || !order) return;

    // Only auto-refresh for orders that are not completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return;
    }

    const interval = setInterval(() => {
      fetchOrder();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, orderId, order?.status, refreshInterval, fetchOrder]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Get order status info
  const getStatusInfo = useCallback(() => {
    if (!order) return null;

    const statusConfig = {
      pending: {
        icon: '⏳',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        text: 'Pending Approval',
        description: 'Your order is being reviewed by our team'
      },
      confirmed: {
        icon: '✅',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        text: 'Confirmed',
        description: 'Your order has been approved and is being processed'
      },
      assigntocourier: {
        icon: '🚚',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        text: 'Driver Assigned',
        description: 'A driver has been assigned and is on the way'
      },
      completed: {
        icon: '🎉',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        text: 'Completed',
        description: 'Your order has been successfully completed'
      },
      cancelled: {
        icon: '❌',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        text: 'Cancelled',
        description: 'Your order has been cancelled'
      }
    };

    return statusConfig[order.status] || statusConfig.pending;
  }, [order]);

  // Check if order is active (not completed or cancelled)
  const isActive = order && order.status !== 'completed' && order.status !== 'cancelled';

  // Get estimated time based on status
  const getEstimatedTime = useCallback(() => {
    if (!order) return null;

    const status = order.status;
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const elapsed = now.getTime() - createdAt.getTime();

    switch (status) {
      case 'pending':
        return 'Usually within 1-2 hours';
      case 'confirmed':
        return 'Driver assignment within 30 minutes';
      case 'assigntocourier':
        return 'Pickup within 1 hour';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return null;
    }
  }, [order]);

  return {
    order,
    loading,
    error,
    lastUpdated,
    refresh,
    getStatusInfo,
    isActive,
    getEstimatedTime
  };
}; 