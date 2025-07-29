// hooks/usePayments.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import api from '@/lib/axios';
import { normalizeApiResponse } from '../utils/dataTransformers';

export interface PaymentData {
  id: string;
  object: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  balance_transaction: string;
  billing_details: {
    address: {
      city: string | null;
      country: string;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string;
    name: string | null;
    phone: string | null;
    tax_id: string | null;
  };
  currency?: string;
  status?: string;
  created?: number;
  description?: string;
  receipt_email?: string;
  payment_method?: string;
  refunded?: boolean;
  disputed?: boolean;
  failure_code?: string;
  failure_message?: string;
  outcome?: {
    network_status: string;
    reason: string;
    risk_level: string;
    seller_message: string;
    type: string;
  };
}

interface PaymentsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  currency?: string;
  minAmount?: string;
  maxAmount?: string;
  country?: string;
  refunded?: string;
  disputed?: string;
}

interface PaymentsResponse {
  success: boolean;
  data: PaymentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalCount: number;
    totalAmount: number;
    totalRevenue: number;
    refundedAmount: number;
    successRate: number;
    statusCounts: Record<string, number>;
    averageAmount: number;
  };
  filters: PaymentsQueryParams;
}

// Query keys
export const paymentsKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentsKeys.all, 'list'] as const,
  list: (params: PaymentsQueryParams) => [...paymentsKeys.lists(), params] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
  stats: () => [...paymentsKeys.all, 'stats'] as const,
  stat: (params: Partial<PaymentsQueryParams>) => [...paymentsKeys.stats(), params] as const,
};

// Fetch payments function
const fetchPayments = async (params: PaymentsQueryParams = {}): Promise<PaymentsResponse> => {
  // Clean up undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  );

  const res = await api.get('/payment', { params: cleanParams });
  console.log('Payments response:', res);
  
  const json = normalizeApiResponse(res.data);
  
  if (!json.success) {
    throw new Error(json.message || 'Failed to fetch payments');
  }
  
  return json;
};

// Fetch payment stats function
const fetchPaymentStats = async (params: Partial<PaymentsQueryParams> = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
  );

  const res = await api.get('/payment/stats', { params: cleanParams });
  const json = normalizeApiResponse(res.data);
  
  if (!json.success) {
    throw new Error(json.message || 'Failed to fetch payment stats');
  }
  
  return json.data;
};




const refundPayment = async ({ paymentId, amount, reason }:{paymentId:string,amount?:number , reason:string}) => {
  try {
    const response = await api.post(`/payment/${paymentId}/refund`, {
      amount,
      reason
    });
    
   
    
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const usePayments = (params: PaymentsQueryParams = {}) => {
  const queryClient = useQueryClient();

  // Fetch payments query
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
    isError,
    isPreviousData,
  } = useQuery({
    queryKey: paymentsKeys.list(params),
    queryFn: () => fetchPayments(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });

  // Extract data with fallbacks
  const payments = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const stats = data?.stats || {
    totalCount: 0,
    totalAmount: 0,
    totalRevenue: 0,
    refundedAmount: 0,
    successRate: 0,
    statusCounts: {},
    averageAmount: 0,
  };

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: refundPayment,
    onSuccess: () => {
      // Invalidate and refetch payments
      queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.stats() });
    },
    onError: (error) => {
      console.error('Refund failed:', error);
    },
  });

  return {
    // Data
    payments,
    pagination,
    stats,
    
    // Loading states
    isLoading,
    isFetching,
    isError,
    isPreviousData,
    
    // Error
    error: error as Error | null,
    
    // Actions
    refetch,
    refundPayment: refundMutation.mutate,
    isRefunding: refundMutation.isPending,
    refundError: refundMutation.error as Error | null,
    
    // Computed values for backward compatibility
    totalCount: stats.totalCount,
    totalAmount: stats.totalAmount,
    totalRevenue: stats.totalRevenue,
    successRate: stats.successRate,
  };
};

// Hook for individual payment details
export const usePayment = (paymentId: string) => {
  return useQuery({
    queryKey: paymentsKeys.detail(paymentId),
    queryFn: async () => {
      const res = await api.get(`/payments/${paymentId}`);
      const json = normalizeApiResponse(res.data);
      
      if (!json.success) {
        throw new Error(json.message || 'Failed to fetch payment');
      }
      
      return json.data as PaymentData;
    },
    enabled: !!paymentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for payments statistics only
export const usePaymentsStats = (params: Partial<PaymentsQueryParams> = {}) => {
  return useQuery({
    queryKey: paymentsKeys.stat(params),
    queryFn: () => fetchPaymentStats(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for prefetching next page
export const usePrefetchPayments = () => {
  const queryClient = useQueryClient();

  return (params: PaymentsQueryParams) => {
    queryClient.prefetchQuery({
      queryKey: paymentsKeys.list(params),
      queryFn: () => fetchPayments(params),
      staleTime: 1000 * 60 * 5,
    });
  };
};

