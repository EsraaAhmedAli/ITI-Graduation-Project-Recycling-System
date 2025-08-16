import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Category } from "@/components/Types/categories.type";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

export function useCategories() {
  const { locale } = useLanguage();
  
  const query = useQuery<Category[]>({
    queryKey: ["categories list", locale],
    queryFn: async () => {
      const res = await api.get(`/categories?language=${locale}`);
      return res.data;
    },
    staleTime: 2000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Helper function to get the correct name based on locale or fallback
  const getItemDisplayName = (item: any): string => {
    // First priority: displayName field
    if (item.displayName) {
      return item.displayName;
    }
    
    // Second priority: name object based on current locale
    if (item.name && typeof item.name === 'object') {
      return item.name[locale] || item.name.en || item.name.ar || '';
    }
    
    // Fallback: if name is still a string (backward compatibility)
    if (typeof item.name === 'string') {
      return item.name;
    }
    
    return '';
  };

  const getCategoryIdByItemName = (itemName: string): string => {
    const categories = query.data?.data;
    
    if (!Array.isArray(categories)) return "";
    
    for (const category of categories) {
      const foundItem = category.items?.find((item) => {
        // First check the English name directly
        if (item.name?.en && item.name.en === itemName) {
          return true;
        }
        
        // Then check the display name (which might fall back to English)
        const itemDisplayName = getItemDisplayName(item);
        if (itemDisplayName === itemName) {
          return true;
        }
        
        // Case-insensitive checks
        if (item.name?.en && item.name.en.toLowerCase() === itemName.toLowerCase()) {
          return true;
        }
        if (itemDisplayName.toLowerCase() === itemName.toLowerCase()) {
          return true;
        }
        
        return false;
      });
      
      if (foundItem) {
        return category._id;
      }
    }
    
    return "";
  };

  const geItemQuantityInStock = (itemId: string, categoryId: string) => {
    const categories = query.data?.data;
    
    if (!Array.isArray(categories)) {
      toast.error("Categories NOT ARRAY");
      return -1;
    }
    
    const category = categories.find((cat) => cat._id == categoryId);
    if (!category) {
      toast.error(`category with id ${categoryId} not Found`);
      return -1;
    }
    
    const targetItem = category.items.find((item) => item._id === itemId);
    if (!targetItem) {
      toast.error(`item with id ${itemId} not Found`);
      return -1;
    }
    
    return targetItem.quantity;
  };

  const getItemById = (itemId: string) => {
    const categories = query.data?.data;
    if (!Array.isArray(categories)) return null;
    
    for (const category of categories) {
      const foundItem = category.items?.find((item) => item._id === itemId);
      if (foundItem) {
        return {
          ...foundItem,
          categoryId: category._id,
          displayName: getItemDisplayName(foundItem)
        };
      }
    }
    return null;
  };

  const getAllItems = () => {
    const categories = query.data?.data;
    if (!Array.isArray(categories)) return [];
    
    const allItems = [];
    for (const category of categories) {
      if (category.items && Array.isArray(category.items)) {
        const itemsWithCategory = category.items.map(item => ({
          ...item,
          categoryId: category._id,
          displayName: getItemDisplayName(item)
        }));
        allItems.push(...itemsWithCategory);
      }
    }
    return allItems;
  };

  return {
    ...query,
    getCategoryIdByItemName,
    geItemQuantityInStock,
    getItemById,
    getAllItems,
    getItemDisplayName,
    refetch: query.refetch,
  };
}