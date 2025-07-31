import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios'; // adjust path as needed
import { Category } from '@/components/Types/categories.type';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories list'],
    queryFn: async () => {
      const res = await api.get("/categories");
      console.log(res.data.data);
      
      return res.data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
