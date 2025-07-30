import api from "@/lib/axios";
import { OrdersResponse } from "@/components/Types/orders.type";

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}

export const ordersApi = {
  getOrders: async ({ page = 1, limit = 10 }: GetOrdersParams = {}): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  cancelOrder: async (orderId: string) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export default ordersApi;