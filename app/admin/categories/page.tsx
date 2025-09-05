"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import Image from "next/image";
import { useCategories } from "@/hooks/useGetCategories";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalization } from "@/utils/localiztionUtil";
import { Category } from "@/components/Types/categories.type";
import TableSkeleton from "@/components/shared/tableSkeleton";

interface CategoryItem extends Category {
  id: string;
  displayName?: string;
  displayDescription?: string;
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const queryClient = useQueryClient();
  const { getDisplayName, getDisplayDescription, getEnglishName, t } = useLocalization();
  const router = useRouter();
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Pass pagination and debounced search to useCategories hook
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isSearching: hookIsSearching,
    isFetching
  } = useCategories({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchTerm // Use debounced search term
  });

  const handleSearchChange = useCallback((term: string) => {
    if (term !== searchTerm) {
      setIsSearching(true);
      setSearchTerm(term);
      // Only reset to page 1 if we're starting a new search from empty
      if (!searchTerm && term) {
        setCurrentPage(1);
      }
    }
  }, [searchTerm]);

  // Update isSearching state based on search activity
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  const handleBackToResults = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(1); // Reset to page 1 when clearing search
  }, []);

  console.log("Categories data:", data?.data);
  console.log("Pagination info:", data?.pagination);
  console.log("Search info:", { searchTerm, debouncedSearchTerm, isSearching, hookIsSearching });

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAddingCategory(false);
      refetch();
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [refetch]);

  useEffect(() => {
    const handleFocus = () => {
      if (!isAddingCategory) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAddingCategory, refetch]);

  const getCategoryDisplayName = (categoryItem: Category): string => {
    return getDisplayName(categoryItem);
  };

  const getCategoryDisplayDescription = (categoryItem: Category): string => {
    return getDisplayDescription(categoryItem);
  };

  const getCategoryEnglishName = (categoryItem: Category): string => {
    return getEnglishName(categoryItem);
  };

  const columns = [
    {
      key: "image",
      label: t("categories.image") || "Image",
      type: "image",
      render: (item: CategoryItem) => (
        <Image
          src={item.image}
          alt={getCategoryDisplayName(item)}
          width={70}
          height={70}
          className="rounded-full object-cover cursor-pointer"
          onClick={() => {
            const categoryName = getCategoryEnglishName(item);
            router.push(
              `/admin/categories/${encodeURIComponent(categoryName)}/get-sub-category`
            );
          }}
        />
      ),
    },
    {
      key: "name",
      label: t("categories.categoryName") || "Category Name",
      sortable: true,
      render: (item: CategoryItem) => {
        const displayName = getCategoryDisplayName(item);
        
        // Highlight search terms in the name
        if (debouncedSearchTerm) {
          const regex = new RegExp(`(${debouncedSearchTerm})`, 'gi');
          const parts = displayName.split(regex);
          
          return (
            <span>
              {parts.map((part, index) =>
                regex.test(part) ? (
                  <mark key={index} className="bg-yellow-200 px-1 rounded">
                    {part}
                  </mark>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </span>
          );
        }
        
        return displayName;
      },
    },
    {
      key: "description",
      label: t("categories.description") || "Description",
      sortable: true,
      render: (item: CategoryItem) => {
        const displayDescription = getCategoryDisplayDescription(item);
        
        // Highlight search terms in the description
        if (debouncedSearchTerm) {
          const regex = new RegExp(`(${debouncedSearchTerm})`, 'gi');
          const parts = displayDescription.split(regex);
          
          return (
            <span>
              {parts.map((part, index) =>
                regex.test(part) ? (
                  <mark key={index} className="bg-yellow-200 px-1 rounded">
                    {part}
                  </mark>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </span>
          );
        }
        
        return displayDescription;
      },
    },
    // Add items count column when searching
    ...(debouncedSearchTerm ? [{
      key: "itemsCount",
      label: t("categories.matchingItems") || "Matching Items",
      render: (item: CategoryItem) => {
        const matchingItemsCount = item.items?.length || 0;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            matchingItemsCount > 0 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {matchingItemsCount} {matchingItemsCount === 1 ? 'item' : 'items'}
          </span>
        );
      },
    }] : [])
  ];

  const handleDelete = async (item: CategoryItem) => {
    const displayName = getCategoryDisplayName(item);

    const result = await Swal.fire({
      title: t("categories.deleteConfirmTitle") || "Are you sure?",
      text: t("categories.deleteConfirmText", { name: displayName }) || 
            `You are about to delete "${displayName}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: t("categories.confirmDelete") || "Yes, delete it!",
      cancelButtonText: t("common.cancel") || "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const categoryName = getCategoryEnglishName(item);
        await api.delete(`/categories/${encodeURIComponent(categoryName)}`);
        queryClient.invalidateQueries({ queryKey: ["categories list"] });
        if (data?.data?.length === 1 && currentPage > 1) {
  setCurrentPage(currentPage - 1);
}
        Swal.fire({
          icon: "success",
          title: t("categories.deleteSuccessTitle") || "Deleted!",
          text: t("categories.deleteSuccessText", { name: displayName }) || 
                `"${displayName}" has been deleted.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: t("categories.deleteErrorTitle") || "Error",
          text: t("categories.deleteErrorText") || "Something went wrong while deleting.",
          confirmButtonText: t("common.ok") || "OK",
        });
      }
    }
  };

  const handleAddNewCategory = () => {
    setIsAddingCategory(true);
    router.push("/admin/categories/add-category");
  };

  // Handle page changes - don't reset search
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  };

  const transformedData = data?.data?.map((item: Category) => ({
    ...item,
    id: item._id,
  })) || [];

  // Create pagination info object from API response
  const paginationInfo = data?.pagination ? {
    currentPage: data.pagination.currentPage,
    totalPages: data.pagination.totalPages,
    totalItems: data.pagination.totalItems,
    itemsPerPage: data.pagination.itemsPerPage,
    hasNextPage: data.pagination.hasNextPage,
    hasPrevPage: data.pagination.currentPage > 1,
  } : undefined;

  // Loading state - show skeleton only when initially loading, not when searching
  if (isLoading && !isSearching && !hookIsSearching && !debouncedSearchTerm) {
    return <TableSkeleton rows={5} columns={3} showActions={true} />;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">
          {t("categories.errorLoadingCategories") || "Error loading categories"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          {t("common.retry") || "Retry"}
        </button>
      </div>
    );
  }

  // Show no results found with back button when searching
  if (data?.data?.length === 0 && !isLoading && !isSearching && debouncedSearchTerm) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <div className="mb-6">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t("categories.noSearchResults") || "No categories found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {t("categories.noSearchResultsDesc", { term: debouncedSearchTerm }) || 
               `No categories match "${debouncedSearchTerm}". Try adjusting your search terms.`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={handleBackToResults}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              ← {t("common.backToAllCategories") || "Back to All Categories"}
            </button>
            <button
              onClick={handleAddNewCategory}
              disabled={isAddingCategory}
              className={`
                inline-flex items-center justify-center gap-2 
                font-semibold py-3 px-6 rounded shadow-md 
                transition-all duration-300 min-w-[180px]
                ${isAddingCategory 
                  ? 'bg-emerald-500 cursor-not-allowed opacity-75 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }
              `}
            >
              {isAddingCategory ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{t("categories.addingCategory") || "Adding..."}</span>
                </>
              ) : (
                <span>{t("categories.addNewCategory") || "Add New Category"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no categories at all
  if (data?.data?.length === 0 && !isLoading && !debouncedSearchTerm) {
    return (
      <div className="text-center py-10">
        <p className="text-center text-gray-500 py-10 mb-6">
          {t("categories.noCategoriesFound") || "No categories found."}
        </p>
        <div className="flex justify-center">
          <button
            aria-label={t("categories.startAddingCategory") || "Start adding new category"}
            onClick={handleAddNewCategory}
            disabled={isAddingCategory}
            className={`
              inline-flex items-center justify-center gap-2 
              font-semibold py-2 px-4 rounded-xl shadow-md 
              transition-all duration-300 min-w-[180px]
              ${isAddingCategory 
                ? 'bg-emerald-500 cursor-not-allowed opacity-75 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            `}
          >
            {isAddingCategory ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{t("categories.addingCategory") || "Adding..."}</span>
              </>
            ) : (
              <span>{t("categories.startAddingCategory") || "Start adding new category"}</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  console.log('=== CATEGORIES DEBUG INFO ===');
  console.log('searchTerm:', searchTerm);
  console.log('debouncedSearchTerm:', debouncedSearchTerm);
  console.log('isSearching (local):', isSearching);
  console.log('hookIsSearching:', hookIsSearching);
  console.log('isLoading:', isLoading);
  console.log('isFetching:', isFetching);
  console.log('currentPage:', currentPage);
  console.log('Combined isSearching for DynamicTable:', isSearching || hookIsSearching);
  console.log('===============================');

  return (
    <>
      <DynamicTable
        data={transformedData}
        columns={columns}
        title={debouncedSearchTerm ? 
          `${t("categories.categories") || "Categories"}` : 
          (t("categories.categories") || "Categories")
        }
        itemsPerPage={itemsPerPage}
        showPagination={true}
        isLoading={isLoading && !debouncedSearchTerm && !isSearching && !hookIsSearching}
        isSearching={isSearching || hookIsSearching}
        addButtonText={
          isAddingCategory 
            ? (t("categories.addingCategory") || "Adding...")
            : (t("categories.addNewCategory") || "Add New Category")
        }
        addButtonLoading={isAddingCategory}
        onAdd={handleAddNewCategory}
        onEdit={(item: CategoryItem) => {
          const categoryName = getCategoryEnglishName(item);
          router.push(
            `/admin/categories/${encodeURIComponent(categoryName)}/edit`
          );
        }}
        onDelete={handleDelete}
        onAddSubCategory={(item: CategoryItem) => {
          const categoryName = getCategoryEnglishName(item);
          router.push(
            `/admin/categories/${encodeURIComponent(categoryName)}/add-sub-category`
          );
        }}
        showFilter={false}
        onImageClick={(item: CategoryItem) => {
          const categoryName = getCategoryEnglishName(item);
          router.push(
            `/admin/categories/${encodeURIComponent(categoryName)}/get-sub-category`
          );
        }}
        // Pass backend pagination info and handlers
        paginationInfo={paginationInfo}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        disableClientSideSearch={true} // Disable client-side pagination
        // Search props
        searchTerm={searchTerm} // Use immediate search term for UI
        onSearchChange={handleSearchChange}
        isFetching={isFetching}
      />
      
    
    </>
  );
}