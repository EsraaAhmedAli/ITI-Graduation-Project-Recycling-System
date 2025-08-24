import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, useMemo } from "react";
import api from "@/lib/axios";
import { Category } from "@/components/Types/categories.type";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  searchInfo?: {
    searchTerm: string;
    hasSearch: boolean;
    resultsCount: number;
    currentPageResults: number;
  };
}

interface UseCategoriesOptions {
  enabled?: boolean;
  page?: number;
  limit?: number;
  search?: string; // Add search parameter
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { enabled = true, page = 1, limit = 10, search, ...queryOptions } = options;
  const hasShownErrorRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(search || "");

  let languageContext;
  let locale = "en";
  let isContextLoaded = false;

  try {
    languageContext = useLanguage();
    locale = languageContext?.locale || "en";
    isContextLoaded = languageContext?.isLoaded || false;
  } catch (error) {
    console.warn("Language context not available, using defaults:", error);
  }

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update search term when external search prop changes
  useEffect(() => {
    if (search !== undefined) {
      setSearchTerm(search);
    }
  }, [search]);

  const query = useQuery<ApiResponse<Category[]>>({
    queryKey: ["categories list", locale, page, limit, debouncedSearchTerm],
    queryFn: async () => {
      try {
        console.log(`Fetching categories for locale: ${locale}, page: ${page}, limit: ${limit}, search: "${debouncedSearchTerm}"`);
        
        // Build query parameters
        const params = new URLSearchParams({
          language: locale,
          page: page.toString(),
          limit: limit.toString(),
        });

        // Add search parameter if it exists
        if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
          params.append('search', debouncedSearchTerm.trim());
        }

        // Use different endpoints based on search
        const endpoint = debouncedSearchTerm && debouncedSearchTerm.trim() 
          ? '/categories/search' 
          : '/categories';
        
        const res = await api.get(`${endpoint}?${params.toString()}`);
        console.log("Categories fetched successfully:", res.data);
        console.log("Search info from API:", res.data.searchInfo);
        return res.data;
      } catch (error) {
        console.error("Categories API error:", error);
        throw error;
      }
    },
    enabled,
    staleTime: debouncedSearchTerm ? 1000 : 5000, // Shorter stale time for search results
    cacheTime: debouncedSearchTerm ? 5000 : 30000, // Shorter cache time for search results
    refetchOnMount: false, // Don't refetch on mount for search results
    refetchOnWindowFocus: false, // Don't refetch on focus for search results
    refetchOnReconnect: "stale",
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        console.log(`Retrying categories fetch (attempt ${failureCount + 1})`);
        return true;
      }
      return false;
    },
    // Keep previous data while fetching new search results to avoid flickering
    keepPreviousData: true,
  });

  useEffect(() => {
    if (query.isError && query.failureCount > 1 && !hasShownErrorRef.current) {
      console.error("Categories query failed:", query.error);
      toast.error("Failed to load categories");
      hasShownErrorRef.current = true;
    }

    if (query.isSuccess) {
      hasShownErrorRef.current = false;
    }
  }, [query.isError, query.failureCount, query.error, query.isSuccess]);

  const getItemDisplayName = (item: any): string => {
    if (!item) {
      console.warn("getItemDisplayName called with null/undefined item");
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
      console.error("Error in getItemDisplayName:", error);
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
            console.error("Error checking item:", error);
            return false;
          }
        });

        if (foundItem) {
          return category._id;
        }
      }

      return "";
    } catch (error) {
      console.error("Error in getCategoryIdByItemName:", error);
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
      console.error("Error getting item quantity:", error);
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
      console.error("Error in getItemById:", error);
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
            .filter((item) => !!item)
            .map((item) => {
              try {
                return {
                  ...item,
                  categoryId: category._id,
                  displayName: getItemDisplayName(item),
                };
              } catch (error) {
                console.error("Error processing item:", error);
                return null;
              }
            })
            .filter(Boolean);
          allItems.push(...itemsWithCategory);
        }
      }
      return allItems;
    } catch (error) {
      console.error("Error in getAllItems:", error);
      return [];
    }
  };

  // Search functionality
  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  // Check if currently searching - improved logic
  const isSearching = useMemo(() => {
    // We're searching if:
    // 1. The search term is different from debounced term (user is typing)
    // 2. OR we're fetching and there's an active search term
    const isTyping = searchTerm !== debouncedSearchTerm;
    const isFetchingWithSearch = query.isFetching && Boolean(debouncedSearchTerm);
    
    return isTyping || isFetchingWithSearch;
  }, [query.isFetching, searchTerm, debouncedSearchTerm]);

  // Get search info from API response
  const searchInfo = query.data?.searchInfo;

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
    pagination: query.data?.pagination,
    // Search related returns
    searchTerm,
    handleSearch,
    isSearching,
    hasActiveSearch: Boolean(debouncedSearchTerm && debouncedSearchTerm.trim()),
    searchInfo, // Include search info from API response
    // Additional useful properties
    totalSearchResults: searchInfo?.resultsCount || 0,
    currentPageResults: searchInfo?.currentPageResults || 0,
  };
}