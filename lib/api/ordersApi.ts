import api from "@/lib/axios";
import { OrdersResponse } from "@/components/Types/orders.type";

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const ordersApi = {
  getOrders: async ({ page = 1, limit = 10, status }: GetOrdersParams = {}): Promise<OrdersResponse> => {
    // Build query string with optional status parameter
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      queryParams.append('status', status);
    }
    
    const response = await api.get<OrdersResponse>(`/orders?${queryParams.toString()}`);
    return response.data;
  },

  cancelOrder: async (orderId: string) => {
    const response = await api.put(`/orders/${orderId}/status`, {
      status: 'cancelled'
    });
    return response.data;
  },

  cancelOrderWithReason: async (orderId: string, reason: string) => {
    const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  autoApproveOrder: async (orderId: string) => {
    const response = await api.put(`/orders/${orderId}/status`, {
      status: "assigntocourier",
    });
    return response.data;
  },

  completeOrder: async (orderId: string) => {
    const response = await api.put(`/orders/${orderId}/status`, {
      status: "completed",
    });
    return response.data;
  },
};

export default ordersApi;