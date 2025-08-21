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
      search?.trim() || '', // Normalize search term
    ],
    queryFn: async () => {
      // Build parameters object
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Only add parameters if they have meaningful values
      if (userRole) {
        params.role = userRole;
      }
      
      if (category && category !== "all") {
        params.category = category;
      }
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      console.log('🔍 API Request params:', params);
      
      const res = await api.get(`/get-items`, { params });
      
      console.log("📦 API Response - Items found:", res.data.data?.length || 0);
      console.log("📦 API Response - Total items:", res.data.pagination?.totalItems || 0);
      
      return {
        data: res.data.data || [],
        pagination: res.data.pagination,
      };
    },
    // Enable the query for all users, not just buyers
    enabled: true, // Remove the userRole === "buyer" restriction if not needed
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}