import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Category } from "@/components/Types/categories.type";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface UseCategoriesOptions {
  language?: 'en' | 'ar';
  role?: 'buyer' | 'seller';
}

interface CategoriesResponse {
  data: Category[];
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { language = 'en', role } = options;
const{locale}=useLanguage()
  const query = useQuery<CategoriesResponse>({
    queryKey: ["categories list", language, role], // Include language and role in cache key
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('lang', language);
        if (role) params.append('role', role);

        console.log(`Fetching categories with language: ${language}, role: ${role || 'none'}`);
        
        const res = await api.get(`/categories?lang=${locale}`);
        
        // Handle different response structures from your backend
        let responseData: CategoriesResponse;
        
        if (res.data?.data) {
          // Paginated response from getCategoriesWithPagination
          responseData = {
            data: res.data.data,
            pagination: res.data.pagination
          };
        } else if (Array.isArray(res.data)) {
          // Direct array response from getAllCategories
          responseData = {
            data: res.data
          };
        } else {
          console.warn('Unexpected response structure:', res.data);
          responseData = {
            data: []
          };
        }
        
        console.log(`Received ${responseData.data?.length || 0} categories in ${language}`);
        console.log('Sample categories:', responseData.data?.slice(0, 2).map(c => ({ name: c.name, originalName: c.originalName })));
        
        return responseData;
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
        throw error;
      }
    },
    staleTime: 2000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const getCategoryIdByItemName = (itemName: string): string => {
    console.log(itemName,'itteemmnameeee');
    
    const categories = query.data?.data;

    
    if (!Array.isArray(categories)) return "";

    for (const category of categories) {
      const foundItem = category.items?.find((item) => {
        console.log("in comparison");
        console.log(`${item.slug} Vs ${itemName} == ${item.slug === itemName}`);
        console.log('wholeeeitem' , item);
        
        // Also check original name if it exists (for translated items)
        const nameMatches = item.slug === itemName;
        const originalNameMatches = item.originalName && item.originalName === itemName;
        
        console.log("-------------------------");
        return nameMatches || originalNameMatches;
      });

      if (foundItem) {
        console.log("We Found Something");
        console.log(foundItem);
        return category._id;
      }
    }

    return "";
  };

  const getItemQuantityInStock = (itemId: string, categoryId: string) => {
    const categories = query.data?.data;
    console.log("CATEGORIES");
    console.log(categories);
    
    if (!Array.isArray(categories)) {
      toast.error("Categories NOT ARRAY");
      return -1;
    }

    const category = categories.find((cat) => cat._id == categoryId);
    if (!category) {
      toast.error(`Category with id ${categoryId} not Found`);
      return -1;
    }
    
    const targetItem = category.items.find((item) => item._id === itemId);
    if (!targetItem) {
      toast.error(`Item with id ${itemId} not Found`);
      return -1;
    }
    
    return targetItem.quantity || 0;
  };

  // Helper methods for working with translations
  const getCategoryByOriginalName = (originalName: string): Category | undefined => {
    const categories = query.data?.data;
    if (!Array.isArray(categories)) return undefined;
    
    return categories.find(cat => 
      cat.originalName === originalName || cat.name === originalName
    );
  };

  const findItemByName = (itemName: string, searchMode: 'current' | 'original' | 'both' = 'both') => {
    const categories = query.data?.data;
    if (!Array.isArray(categories)) return null;

    for (const category of categories) {
      const foundItem = category.items?.find((item) => {
        switch (searchMode) {
          case 'current':
            return item.name === itemName;
          case 'original':
            return item.originalName === itemName;
          case 'both':
          default:
            return item.name === itemName || (item.originalName && item.originalName === itemName);
        }
      });

      if (foundItem) {
        return {
          item: foundItem,
          category: category,
          categoryId: category._id
        };
      }
    }

    return null;
  };

  // Get categories array directly (for easier access)
  const categories = query.data?.data || [];

  return {
    ...query,
    categories, // Direct access to categories array
    getCategoryIdByItemName,
    getItemQuantityInStock, // Fixed typo
    getCategoryByOriginalName,
    findItemByName,
    currentLanguage: language,
    isArabic: language === 'ar',
    isEnglish: language === 'en',
    refetch: query.refetch,
  };
}