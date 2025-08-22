"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { useLocalization } from "@/utils/localiztionUtil";
import Button from "@/components/common/Button";
import Loader from "@/components/common/loader";
import { useGetItemsPaginated } from "@/hooks/useGetItemsPaginated";

interface SubcategoryItem {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  displayName: string;
  points: number;
  price: number;
  quantity: number;
  measurement_unit: number;
  image: string;
  categoryId: string;
  categoryName: {
    en: string;
    ar: string;
  };
  categoryDisplayName: string;
}

export default function Page() {
  const { name } = useParams(); // category name from dynamic route
  const decodedName = decodeURIComponent(name as string);
  const router = useRouter();
  
  // Use shared localization utilities at component level
  const { getDisplayName, getMeasurementUnit, formatCurrency, t, locale } = useLocalization();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [previousPage, setPreviousPage] = useState(1);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Use the shared hook for pagination with debounced search term
  const {
    data: items,
    pagination,
    isLoading: loading,
    isFetching,
    error,
    currentPage,
    handlePageChange,
    generatePageNumbers,
    categoryStats
  } = useGetItemsPaginated({
    categoryName: decodedName,
    itemsPerPage: 5,
    keepPreviousData: true,
    searchTerm: debouncedSearchTerm // Use debounced search term
  });

  // Store the previous page when starting a new search
  useEffect(() => {
    if (debouncedSearchTerm && currentPage === 1) {
      // Only store previous page when we're starting a fresh search
      if (searchTerm === debouncedSearchTerm) {
        setPreviousPage(currentPage);
      }
    }
  }, [debouncedSearchTerm, currentPage, searchTerm]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // Only reset to first page when the debounced search actually changes
    // This prevents page resets on every keystroke
  }, []);

  // Reset to page 1 only when debounced search term actually changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Wait for debounce
    
    if (debouncedSearchTerm && currentPage !== 1) {
      handlePageChange(1);
    }
  }, [debouncedSearchTerm, currentPage, handlePageChange, searchTerm]);

  const handleBackToResults = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    // Optionally go back to the previous page
    if (previousPage > 1) {
      handlePageChange(previousPage);
    }
  }, [previousPage, handlePageChange]);

  const columns = [
    { 
      key: "image", 
      label: t('categories.image') || "Image", 
      type: "image" 
    },
    { 
      key: "name", 
      label: t('categories.subCategoryName') || "Item Name", 
      sortable: false,
      render: (item: SubcategoryItem) => getDisplayName(item)
    },
    { 
      key: "points", 
      label: t('itemsModal.points') || "Points", 
      sortable: false
    },
    { 
      key: "price", 
      label: `${t('itemsModal.unitPrice') || 'Price'} (${t('itemsModal.currency') || 'EGP'})`, 
      sortable: false,
      render: (item: SubcategoryItem) => formatCurrency(item.price)
    },
    { 
      key: "measurement_unit", 
      label: t('common.measurementUnit') || "Measurement Unit",
      render: (item: SubcategoryItem) => getMeasurementUnit(item.measurement_unit)
    },
    { 
      key: "quantity", 
      label: t('common.quantity') || "Quantity" 
    },
  ];

  const handleDelete = async (item: SubcategoryItem) => {
    const displayName = getDisplayName(item);
    
    const result = await Swal.fire({
      title: t('deleteConfirmation.title') || 'Are you sure to delete this item?',
      text: t('deleteConfirmation.text', { name: displayName }) || `You are about to delete "${displayName}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: t('deleteConfirmation.confirmButton') || "Yes, delete it!",
      cancelButtonText: t('deleteConfirmation.cancelButton') || "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categories/item/${name}/${item._id}`);
        
        // Force a refetch after deletion by reloading the page
        window.location.reload();

        Swal.fire({
          icon: "success",
          title: "Item Deleted",
          text: `"${displayName}" has been deleted.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while deleting.",
        });
      }
    }
  };

  // Get category display name from categoryStats or first item
  const getCategoryDisplayName = (): string => {
    if (categoryStats?.categoryDisplayName) {
      return categoryStats.categoryDisplayName;
    }
    if (items.length > 0 && items[0].categoryDisplayName) {
      return items[0].categoryDisplayName;
    }
    return decodedName;
  };

  const categoryDisplayName = getCategoryDisplayName();

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">
          {typeof error === 'string' ? error : 'Failed to load items'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Show no results found with back button when searching
  if (items.length === 0 && !loading && debouncedSearchTerm) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <div className="mb-6">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No results found
            </h3>
            <p className="text-gray-500 mb-6">
              No items found matching "{debouncedSearchTerm}" in {categoryDisplayName}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button 
              onClick={handleBackToResults}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white"
            >
              ← Back to All Items
            </Button>
            <Button 
              onClick={() => router.push(`/admin/categories/${name}/add-sub-category`)} 
              className="px-6 py-3"
            >
              {t('common.addNewItem') || "Add New Item"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no items at all
  if (items.length === 0 && !loading && !debouncedSearchTerm) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">No items found in this category.</p>
        <Button 
          onClick={() => router.push(`/admin/categories/${name}/add-sub-category`)} 
          className="px-6 py-3"
        >
          {t('common.addNewItem') || "Add New Item"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFetching && <Loader />}

      {/* Show search status */}
      {debouncedSearchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">
                Searching for: "{debouncedSearchTerm}"
              </span>
              <span className="text-blue-500 text-sm">
                ({pagination?.totalItems || 0} results found)
              </span>
            </div>
            <button
              onClick={handleBackToResults}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear search ×
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Table with built-in pagination */}
      <DynamicTable
        data={items}
        columns={columns}
        title={`${t('common.itemsIn') || 'Items in'} ${categoryDisplayName}`}
        addButtonText={t('common.addNewItem') || "Add New Item"}
        onAdd={() => router.push(`/admin/categories/${name}/add-sub-category`)}
        onEdit={(item) => router.push(`/admin/categories/${name}/edit-sub-category/${item._id}`)}
        onDelete={handleDelete}
        onImageClick={(item) => router.push(`/admin/categories`)}
        
        showPagination={true}
        disableClientSideSearch={true}
        searchTerm={searchTerm} // Use immediate search term for UI
        onSearchChange={handleSearchChange}
        showFilter={false}
        
        paginationInfo={{
          currentPage: currentPage,
          totalPages: pagination?.totalPages || 1,
          totalItems: pagination?.totalItems || items.length,
          itemsPerPage: 5,
          hasNextPage: pagination?.hasNextPage || false,
          hasPrevPage: pagination?.hasPrevPage || false,
        }}
        
        onPageChange={handlePageChange}
        isFetching={isFetching}
        isLoading={loading}
        disableClientSideSearch={true}
        itemsPerPage={5}
      />
    </div>
  );
}