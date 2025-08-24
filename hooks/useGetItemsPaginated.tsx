    import { useState, useMemo, useEffect } from "react";
    import { useQuery } from "@tanstack/react-query";
    import { useSearchParams } from "next/navigation";
    import api from "@/lib/axios";
    import { useLanguage } from "@/context/LanguageContext";

    export interface LocalizedItem {
    _id: string;
    name: {
        en: string;
        ar: string;
    };
    displayName: string;
    image: string;
    points: number;
    price: number;
    categoryName: {
        en: string;
        ar: string;
    };
    categoryDisplayName: string;
    measurement_unit: 1 | 2;
    quantity: number;
    categoryId: string;
    }

    export interface PaginationInfo {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage?: boolean;
    }

    interface ApiResponse {
    data: LocalizedItem[];
    pagination: PaginationInfo;
    }

    interface UseGetItemsPaginatedOptions {
    categoryName?: string;
    itemsPerPage?: number;
    enabled?: boolean;
    keepPreviousData?: boolean;
    staleTime?: number;
    searchTerm?: string; // Add search term parameter

    role?: 'buyer' | 'seller';
    }

    interface UseGetItemsPaginatedReturn {
    // Data
    data: LocalizedItem[];
    pagination: PaginationInfo | undefined;
        isSearching: boolean; // Add this line

    // Loading states
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: any;
    
    // Pagination controls
    currentPage: number;
    setCurrentPage: (page: number) => void;
    handlePageChange: (page: number) => void;
    
    // Utility functions
    generatePageNumbers: () => (number | string)[];
    getPointsRange: (points: number[]) => string;
    
    // Stats
    categoryStats: {
        totalItems: number;
        categoryDisplayName: string;
        pointsRange: string;
    } | null;
    }

    export const useGetItemsPaginated = (
    options: UseGetItemsPaginatedOptions = {}
    ): UseGetItemsPaginatedReturn => {
    const {
        
        categoryName,
        itemsPerPage = 12,
        enabled = true,
        keepPreviousData = true,
        staleTime = 2000,
        role,
            searchTerm = '' ,// Default to empty string

    } = options;

    const { locale } = useLanguage();
    const searchParams = useSearchParams();
    
    // Get page from URL params or default to 1
    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = searchParams.get('page');
        return pageParam ? parseInt(pageParam, 10) : 1;
    });
// Add this useEffect in your useGetItemsPaginated hook
useEffect(() => {
  const pageParam = searchParams.get('page');
  const urlPage = pageParam ? parseInt(pageParam, 10) : 1;
  if (urlPage !== currentPage) {
    setCurrentPage(urlPage);
  }
}, [searchParams,currentPage]); // This will react to URL changes
    // Build query key based on available parameters
    const queryKey = useMemo(() => {
        const key = ["items-paginated", currentPage, locale, itemsPerPage];
        if (categoryName) key.push(categoryName);
        if (role) key.push(role);
            if (searchTerm) key.push(searchTerm); // Include search term in query key

        return key;
    }, [categoryName, locale, currentPage, itemsPerPage, role,searchTerm]);

    // Build API endpoint and params
    const { endpoint, params } = useMemo(() => {
        const baseParams = {
        language: locale,
        page: currentPage,
        limit: itemsPerPage,
        };

        if (role) {
        baseParams.role = role;
        }
          if (searchTerm) {
      baseParams.search = searchTerm; // Add search parameter
    }


        if (categoryName) {
        // Use category-specific endpoint
        return {
            endpoint: `/categories/get-items/${encodeURIComponent(categoryName)}/`,
            params: baseParams
        };
        } else {
        // Use general items endpoint
        return {
            endpoint: `/items`,
            params: baseParams
        };
        }
    }, [categoryName, locale, currentPage, itemsPerPage, role,searchTerm]);

    const { 
        data: apiResponse, 
        isLoading, 
        error, 
        isFetching,
        isError ,
        
    } = useQuery<ApiResponse>({
        queryKey,
        queryFn: async () => {
        const res = await api.get(endpoint, { params });
        return {
            data: res.data.data,
            pagination: res.data.pagination
        };
        },
        enabled,
        staleTime,
        keepPreviousData,
        refetchOnMount: true,
        refetchOnWindowFocus:true
    });

    const data = apiResponse?.data || [];
    const pagination = apiResponse?.pagination;

    // Utility function to get points range
    const getPointsRange = (points: number[]): string => {
        if (points.length === 0) return "0 pts";
        const min = Math.min(...points);
        const max = Math.max(...points);
        return min === max ? `${min} pts` : `${min}-${max} pts`;
    };

    // Calculate category stats
    const categoryStats = useMemo(() => {
        if (!data || data.length === 0) return null;
        
        const points = data.map((item) => item.points);
        const categoryDisplayName = data[0]?.categoryDisplayName || categoryName || 'Items';
        
        return {
        totalItems: pagination?.totalItems || 0,
        categoryDisplayName,
        pointsRange: getPointsRange(points),
        };
    }, [data, categoryName, pagination]);

const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
    // Update URL first
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', newPage.toString());
    window.history.pushState(
      null, 
      '', 
      `?${newSearchParams.toString()}`
    );
    
    // State will be updated by the useEffect that watches searchParams
    // Don't call setCurrentPage here to avoid race conditions
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
    // Generate page numbers for pagination UI
    const generatePageNumbers = (): (number | string)[] => {
        if (!pagination) return [];
        
        const totalPages = pagination.totalPages;
        const current = pagination.currentPage;
        const pageNumbers: (number | string)[] = [];
        
        if (totalPages <= 7) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
        } else {
        // Always show first page
        pageNumbers.push(1);
        
        // Show pages around current page
        let start = Math.max(2, current - 2);
        let end = Math.min(totalPages - 1, current + 2);
        
        // Add ellipsis if needed
        if (start > 2) {
            pageNumbers.push('...');
        }
        
        // Add middle pages
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) {
            pageNumbers.push(i);
            }
        }
        
        // Add ellipsis if needed
        if (end < totalPages - 1) {
            pageNumbers.push('...');
        }
        
        // Always show last page
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }
        }
        
        return pageNumbers;
    };

    return {
        // Data
        data,
        pagination,
        
        // Loading states
        isLoading,
        isFetching,
        isError,
isSearching: Boolean(searchTerm && isFetching), // Replace with this

        error,
        
        // Pagination controls
        currentPage,
        setCurrentPage,
        handlePageChange,
        
        // Utility functions
        generatePageNumbers,
        getPointsRange,
        
        // Stats
        categoryStats,
    };
    };