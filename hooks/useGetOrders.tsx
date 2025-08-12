// hooks/useOrders.ts
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ordersApi, GetOrdersParams } from "@/lib/api/ordersApi";
import { Order } from "@/components/Types/orders.type";
import Swal from "sweetalert2";

export const useOrders = (params: Omit<GetOrdersParams, "page"> = {}) => {
  const queryClient = useQueryClient();

  // Infinite query
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["orders", params],
    queryFn: ({ pageParam = 1 }) =>
      ordersApi.getOrders({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    staleTime: 2000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
console.log(data,'fromcontext');

  const allOrders: Order[] = data?.pages.flatMap((page) => page.data) ?? [];
  const totalOrders = data?.pages[0]?.pagination?.totalOrders ?? 0;

  // Cancel order mutation with optimistic update
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onMutate: async (orderId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["orders", params] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(["orders", params]);

      // Optimistically update
      queryClient.setQueryData(["orders", params], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((order: Order) =>
              order.id === orderId ? { ...order, status: "cancelled" } : order
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, orderId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["orders", params], context.previousData);
      }
      Swal.fire("Failed to cancel order", "", "error");
    },
    onSuccess: () => {
      Swal.fire("Order cancelled", "", "success");
    },
    onSettled: () => {
      // Always refetch after success/error to ensure latest data
      queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
    },
  });

  const handleCancelOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure you want to cancel this order?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    });

    if (result.isConfirmed) {
      await cancelOrderMutation.mutateAsync(orderId);
    } else {
      Swal.fire("Your order is safe", "", "info");
    }
  };

  const filterOrdersByStatus = (status: string | string[]) => {
    const statusArray = Array.isArray(status) ? status : [status];
    return allOrders.filter((order) => statusArray.includes(order.status));
  };

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
    allOrders,
    totalOrders,
    isLoading,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleCancelOrder,
    refetch,
    filterOrdersByStatus,
    getOrdersByTab,
    isCancellingOrder: cancelOrderMutation.isPending,
  };
};

export default useOrders;
