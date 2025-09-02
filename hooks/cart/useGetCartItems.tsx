import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface CartItemResponse {
  _id: string;
  name: {
    en: string;
    ar: string;
    [key: string]: string;
  };
  quantity: number;
  price: number;
  points?: number;
  measurement_unit: 1 | 2;
  image?: string;
  categoryName: {
    en: string;
    ar: string;
    [key: string]: string;
  };
  categoryId: string;
  displayName: string;
  categoryDisplayName: string;
}

export interface GetCartItemsResponse {
  data: CartItemResponse[];
  success: boolean;
}

export const useGetCartItems = (itemIds: string[], userRole?: string, language: string = 'en') => {
  return useQuery<GetCartItemsResponse>({
    queryKey: ['cart-items', itemIds.sort(), userRole, language],
    queryFn: async () => {
      if (itemIds.length === 0) {
        return { data: [], success: true };
      }
      
      // API call to get specific items by IDs
   const res = await api.post('/items/get-by-id',{
      itemIds, 
          userRole 
   })

   return res.data;
    },
    enabled: itemIds.length > 0,
    staleTime: 2000, // 2 seconds
    
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};