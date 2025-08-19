import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { CartItem } from "@/models/cart";

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetItemsResponse {
  data: CartItem[];
  pagination: Pagination;
}

export function useGetItems({
  currentPage,
  itemsPerPage,
  userRole,
  category,
  search,
}: {
  currentPage: number;
  itemsPerPage: number;
  userRole?: string;
  category?: string;
  search?: string;
}) {
  return useQuery<GetItemsResponse>({
    queryKey: [
      "categories items",
      currentPage,
      itemsPerPage,
      userRole,
      category,
      search,
    ],
    queryFn: async () => {
      const res = await api.get(`/categories/get-items`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          role: userRole,
          category: category === "all" ? undefined : category,
          search: search || undefined,
        },
      });
      console.log("📦 Fetched items:", res.data.data);
      console.log("📦 Pagination info:", res.data.pagination);
      return {
        data: res.data.data || [],
        pagination: res.data.pagination,
      };
    },
    // Only enable the query when userRole is "buyer"
    enabled: userRole === "buyer",
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Keep in cache forever (previously cacheTime)
    refetchOnMount: true, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnReconnect: true, // Don't refetch when network reconnects
  });
}