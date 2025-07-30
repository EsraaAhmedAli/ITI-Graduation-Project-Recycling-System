// types/payment.types.ts
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

export interface PaymentsQueryParams {
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

export interface PaymentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaymentsStats {
  totalCount: number;
  totalAmount: number;
  totalRevenue: number;
  refundedAmount: number;
  successRate: number;
  statusCounts: Record<string, number>;
  averageAmount: number;
}

export interface PaymentsResponse {
  success: boolean;
  data: PaymentData[];
  pagination: PaymentsPagination;
  stats: PaymentsStats;
  filters: PaymentsQueryParams;
}

export type PaymentStatus = 
  | 'succeeded' 
  | 'pending' 
  | 'failed' 
  | 'refunded' 
  | 'disputed' 
  | 'partially_captured';

export interface PaymentStatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}

// Column type for DynamicTable
export interface PaymentTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: "status" | "price" | "image" | string;
  render?: (item: PaymentData) => React.ReactNode;
  hideOnMobile?: boolean;
  priority?: number;
}