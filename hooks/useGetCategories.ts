import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import api from "@/lib/axios";
import { Category } from "@/components/Types/categories.type";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useCategories() {
  const hasShownErrorRef = useRef(false);
  
  // Safe context access with error handling
  let languageContext;
  let locale = 'en';
  let isContextLoaded = false;
  
  try {
    languageContext = useLanguage();
    locale = languageContext?.locale || 'en';
    isContextLoaded = languageContext?.isLoaded || false;
  } catch (error) {
    console.warn('Language context not available, using defaults:', error);
  }

  const query = useQuery<ApiResponse<Category[]>>({
    queryKey: ["categories list", locale],
    queryFn: async () => {
      try {
        console.log(`Fetching categories for locale: ${locale}`);
        const res = await api.get(`/categories?language=${locale}`);
        console.log('Categories fetched successfully');
        return res.data;
      } catch (error) {
        console.error('Categories API error:', error);
        throw error;
      }
    },
    // FIXED: Increase stale time to reduce refetches
    staleTime: 10 * 60 * 1000, // 10 minutes instead of 2
    cacheTime: 15 * 60 * 1000, // 15 minutes cache
    
    // FIXED: Reduce aggressive refetch behaviors
    refetchOnMount: 'stale', // Only refetch if data is stale
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: 'stale', // Only refetch on reconnect if stale
    
    // Only enable query when language context is loaded and we're in browser
    enabled: isContextLoaded && typeof window !== 'undefined',
    
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        console.log(`Retrying categories fetch (attempt ${failureCount + 1})`);
        return true;
      }
      return false;
    },
  });

  // Handle errors only once to prevent multiple toasts
  useEffect(() => {
    if (query.isError && query.failureCount > 1 && !hasShownErrorRef.current) {
      console.error('Categories query failed:', query.error);
      toast.error('Failed to load categories');
      hasShownErrorRef.current = true;
    }
    
    // Reset error flag when query succeeds
    if (query.isSuccess) {
      hasShownErrorRef.current = false;
    }
  }, [query.isError, query.failureCount, query.error, query.isSuccess]);

  // Rest of your helper functions remain the same...
  const getItemDisplayName = (item: any): string => {
    if (!item) {
      console.warn('getItemDisplayName called with null/undefined item');
      return "";
    }
    
    try {
      if (item.displayName) {
        return item.displayName;
      }

      if (item.name && typeof item.name === "object") {
        return item.name[locale] || item.name.en || item.name.ar || "";
      }

      if (typeof item.name === "string") {
        return item.name;
      }

      return "";
    } catch (error) {
      console.error('Error in getItemDisplayName:', error);
      return "";
    }
  };

  const getCategoryIdByItemName = (itemName: string): string => {
    if (!itemName) return "";
    
    try {
      const categories = query.data?.data;
      if (!Array.isArray(categories)) {
        return "";
      }

      for (const category of categories) {
        if (!category?.items || !Array.isArray(category.items)) {
          continue;
        }
        
        const foundItem = category.items.find((item) => {
          if (!item) return false;
          
          try {
            if (
              item.name &&
              typeof item.name === "object" &&
              item.name.en === itemName
            ) {
              return true;
            }

            const itemDisplayName = getItemDisplayName(item);
            if (itemDisplayName === itemName) {
              return true;
            }

            if (
              item.name &&
              typeof item.name === "object" &&
              item.name.en?.toLowerCase() === itemName.toLowerCase()
            ) {
              return true;
            }
            if (itemDisplayName.toLowerCase() === itemName.toLowerCase()) {
              return true;
            }

            return false;
          } catch (error) {
            console.error('Error checking item:', error);
            return false;
          }
        });

        if (foundItem) {
          return category._id;
        }
      }

      return "";
    } catch (error) {
      console.error('Error in getCategoryIdByItemName:', error);
      return "";
    }
  };

  const geItemQuantityInStock = (itemId: string, categoryId: string) => {
    if (!itemId || !categoryId) return -1;
    
    try {
      const categories = query.data?.data;
      if (!Array.isArray(categories)) {
        return -1;
      }

      const category = categories.find((cat) => cat?._id === categoryId);
      if (!category) {
        return -1;
      }

      if (!category.items || !Array.isArray(category.items)) {
        return -1;
      }

      const targetItem = category.items.find((item) => item?._id === itemId);
      if (!targetItem) {
        return -1;
      }

      return targetItem.quantity || 0;
    } catch (error) {
      console.error('Error getting item quantity:', error);
      return -1;
    }
  };

  const getItemById = (itemId: string) => {
    if (!itemId) return null;
    
    try {
      const categories = query.data?.data;
      if (!Array.isArray(categories)) return null;

      for (const category of categories) {
        if (!category?.items || !Array.isArray(category.items)) continue;
        
        const foundItem = category.items.find((item) => item?._id === itemId);
        if (foundItem) {
          return {
            ...foundItem,
            categoryId: category._id,
            displayName: getItemDisplayName(foundItem),
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error in getItemById:', error);
      return null;
    }
  };

  const getAllItems = () => {
    try {
      const categories = query.data?.data;
      if (!Array.isArray(categories)) return [];

      const allItems = [];
      for (const category of categories) {
        if (category?.items && Array.isArray(category.items)) {
          const itemsWithCategory = category.items
            .filter(item => !!item)
            .map((item) => {
              try {
                return {
                  ...item,
                  categoryId: category._id,
                  displayName: getItemDisplayName(item),
                };
              } catch (error) {
                console.error('Error processing item:', error);
                return null;
              }
            })
            .filter(Boolean);
          allItems.push(...itemsWithCategory);
        }
      }
      return allItems;
    } catch (error) {
      console.error('Error in getAllItems:', error);
      return [];
    }
  };

  return {
    ...query,
    getCategoryIdByItemName,
    geItemQuantityInStock,
    getItemById,
    getAllItems,
    getItemDisplayName,
    refetch: query.refetch,
    isContextLoaded,
    locale,
  };
}