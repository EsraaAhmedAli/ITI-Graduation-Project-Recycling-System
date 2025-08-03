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
}: {
  currentPage: number;
  itemsPerPage: number;
  userRole?: string;
}) {
  return useQuery<GetItemsResponse>({
    queryKey: ['categories items', currentPage, itemsPerPage, userRole],
    queryFn: async () => {
      const res = await api.get(
        `/categories/get-items?page=${currentPage}&limit=${itemsPerPage}&role=${userRole || ''}`
      );
      return {
        data: res.data.data || [],
        pagination: res.data.pagination,
      };
    },
    staleTime: 2000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    keepPreviousData: true, // useful for pagination UX
  });
}
