import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios'; // adjust path as needed
import { Category } from '@/components/Types/categories.type';

export function useGetItems() {
  return useQuery<Category[]>({
    queryKey: ['categories items'],
    queryFn: async () => {
      const res = await api.get("/categories/get-items");
      return res.data.data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
