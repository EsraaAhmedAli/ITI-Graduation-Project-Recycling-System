// hooks/useOrders.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, GetOrdersParams } from '@/lib/api/ordersApi';
import { Order, OrdersResponse } from '@/components/Types/orders.type';
import Swal from 'sweetalert2';

export const useOrders = (params: Omit<GetOrdersParams, 'page'> = {}) => {
  const queryClient = useQueryClient();

  // Infinite query for paginated orders
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['orders', params],
    queryFn: ({ pageParam = 1 }) => 
      ordersApi.getOrders({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasNextPage 
        ? lastPage.pagination.currentPage + 1 
        : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Flatten all orders from all pages
  const allOrders: Order[] = data?.pages.flatMap(page => page.data) ?? [];
  
  // Get total count from first page
  const totalOrders = data?.pages[0]?.pagination?.totalOrders ?? 0;

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      // Update the cache optimistically
      queryClient.setQueryData(['orders', params], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: OrdersResponse) => ({
            ...page,
            data: page.data.map((order: Order) =>
              order._id === orderId 
                ? { ...order, status: 'cancelled' as const }
                : order
            ),
          })),
        };
      });
      
      Swal.fire("Order cancelled", "", "success");
    },
    onError: (error) => {
      console.error("Failed to cancel order:", error);
      Swal.fire("Failed to cancel order", "", "error");
    },
  });

  // Helper function to handle cancel with confirmation
  const handleCancelOrder = (orderId: string) => {
    Swal.fire({
      title: "Are you sure you want to cancel this order?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    }).then((result) => {
      if (result.isConfirmed) {
        cancelOrderMutation.mutate(orderId);
      } else {
        Swal.fire("Your order is safe", "", "info");
      }
    });
  };

  // Filter orders by status
  const filterOrdersByStatus = (status: string | string[]) => {
    const statusArray = Array.isArray(status) ? status : [status];
    return allOrders.filter(order => statusArray.includes(order.status));
  };

  // Get orders by tab
  const getOrdersByTab = (activeTab: string, userRole?: string) => {
    return allOrders.filter((order) => {
      const status = order.status;

      if (userRole === "buyer" && status === "cancelled") {
        return false;
      }
      
      if (activeTab === "incoming") {
        return ["pending", "assigntocourier"].includes(status);
      }
      if (activeTab === "completed") {
        return status === "completed";
      }
      if (activeTab === "cancelled") {
        return status === "cancelled";
      }
      return true;
    });
  };

  return {
    // Data
    allOrders,
    totalOrders,
    
    // Loading states
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    
    // Pagination
    hasNextPage,
    fetchNextPage,
    
    // Actions
    handleCancelOrder,
    refetch,
    
    // Helpers
    filterOrdersByStatus,
    getOrdersByTab,
    
    // Mutation states
    isCancellingOrder: cancelOrderMutation.isPending,
  };
};

export default useOrders;