import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Category } from '@/components/Types/categories.type';

interface Pagination {
  total: number;
  limit: number;
  page: number;
  pages: number;
}

interface GetItemsResponse {
  data: Category[];
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
    queryKey: ['categories items', currentPage, itemsPerPage, userRole, category, search],
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

      return {
        data: res.data.data || [],
        pagination: res.data.pagination,
      };
    },
    staleTime: 2000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
}
