import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Category } from "@/components/Types/categories.type";
import { CartItem } from "@/models/cart";
import { useLanguage } from "@/context/LanguageContext";

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
  enabled = true,
}: {
  currentPage: number;
  itemsPerPage: number;
  userRole?: string;
  category?: string;
  search?: string;
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
const{locale} = useLanguage()
  const query = useQuery<GetItemsResponse>({
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
          lang:locale,
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
    enabled,
    // Updated cache settings to allow for updates
    staleTime:2000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
    refetchOnMount: true, 
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  // Helper function to update item quantity in cache after purchase
  const updateItemQuantityInCache = (itemId: string, newQuantity: number) => {
    const queryKey = [
      "categories items",
      currentPage,
      itemsPerPage,
      userRole,
      category,
      search,
    ];

    queryClient.setQueryData<GetItemsResponse>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const updatedItems = oldData.data.map((item) => {
        if (item._id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            measurement_unit: newQuantity, // If measurement_unit represents available quantity
          };
        }
        return item;
      });

      return {
        ...oldData,
        data: updatedItems,
      };
    });

    // Also update other related queries if they exist
    queryClient.setQueriesData<GetItemsResponse>(
      { queryKey: ["categories items"], exact: false },
      (oldData) => {
        if (!oldData) return oldData;

        const updatedItems = oldData.data.map((item) => {
          if (item._id === itemId) {
            return {
              ...item,
              quantity: newQuantity,
              measurement_unit: newQuantity,
            };
          }
          return item;
        });

        return {
          ...oldData,
          data: updatedItems,
        };
      }
    );
  };

  // Helper function to invalidate and refetch items
  const invalidateItems = () => {
    queryClient.invalidateQueries({ 
      queryKey: ["categories items"],
      exact: false 
    });
  };

  // Helper function to refetch current query
  const refetchItems = () => {
    return query.refetch();
  };

  return {
    ...query,
    // Export helper functions
    updateItemQuantityInCache,
    invalidateItems,
    refetchItems,
  };
}