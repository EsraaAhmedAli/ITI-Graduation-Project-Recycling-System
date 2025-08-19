import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/axios";
import { Category } from "@/components/Types/categories.type";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useCategories() {
  // ✅ Safe context access with error handling
  let languageContext;
  let locale = 'en';
  let isContextLoaded = false;
  
  try {
    languageContext = useLanguage();
    locale = languageContext?.locale || 'en';
    isContextLoaded = languageContext?.isLoaded || false;
  } catch (error) {
    console.warn('Language context not available, using defaults:', error);
    // Use defaults
  }

  const query = useQuery<ApiResponse<Category[]>>({
    queryKey: ["categories list", locale],
    queryFn: async () => {
      try {
        console.log(`🔍 Fetching categories for locale: ${locale}`);
        const res = await api.get(`/categories?language=${locale}`);
        console.log('✅ Categories fetched successfully:', res.data);
        return res.data;
      } catch (error) {
        console.error('❌ Categories API error:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Only enable query when language context is loaded and we're in browser
    enabled: isContextLoaded && typeof window !== 'undefined',
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        console.log(`🔄 Retrying categories fetch (attempt ${failureCount + 1})`);
        return true;
      }
      return false;
    },
    // ✅ Remove onError and onSuccess - handle in useEffect instead
  });

  // ✅ Handle query state changes in useEffect
  useEffect(() => {
    if (query.isError && query.failureCount > 1) {
      console.error('Categories query failed:', query.error);
      toast.error('Failed to load categories');
    }
  }, [query.isError, query.failureCount, query.error]);

  useEffect(() => {
    if (query.isSuccess) {
      console.log('✅ Categories loaded successfully');
    }
  }, [query.isSuccess]);

  // Helper function to get the correct name based on locale or fallback
  const getItemDisplayName = (item: any): string => {
    if (!item) {
      console.warn('⚠️ getItemDisplayName called with null/undefined item');
      return "";
    }
    
    try {
      // First priority: displayName field
      if (item.displayName) {
        return item.displayName;
      }

      // Second priority: name object based on current locale
      if (item.name && typeof item.name === "object") {
        return item.name[locale] || item.name.en || item.name.ar || "";
      }

      // Fallback: if name is still a string (backward compatibility)
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
        console.warn('⚠️ Categories data is not an array:', categories);
        return "";
      }

      for (const category of categories) {
        if (!category?.items || !Array.isArray(category.items)) {
          continue;
        }
        
        const foundItem = category.items.find((item) => {
          if (!item) return false;
          
          try {
            // First check the English name directly
            if (
              item.name &&
              typeof item.name === "object" &&
              item.name.en === itemName
            ) {
              return true;
            }

            // Then check the display name
            const itemDisplayName = getItemDisplayName(item);
            if (itemDisplayName === itemName) {
              return true;
            }

            // Case-insensitive checks
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
        console.warn("Categories data not available or not an array");
        return -1;
      }

      const category = categories.find((cat) => cat?._id === categoryId);
      if (!category) {
        console.warn(`Category with id ${categoryId} not found`);
        return -1;
      }

      if (!category.items || !Array.isArray(category.items)) {
        console.warn(`Category ${categoryId} has no items array`);
        return -1;
      }

      const targetItem = category.items.find((item) => item?._id === itemId);
      if (!targetItem) {
        console.warn(`Item with id ${itemId} not found in category ${categoryId}`);
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
            .filter(item => !!item) // Filter out null/undefined items
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
            .filter(Boolean); // Remove any failed items
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
    // Add debug info
    isContextLoaded,
    locale,
  };
}