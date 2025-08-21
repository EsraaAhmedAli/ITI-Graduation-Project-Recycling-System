"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React from "react";
import api from "@/lib/axios";
import { useLocalization } from "@/utils/localiztionUtil";
import Button from "@/components/common/Button";
import Loader from "@/components/common/loader";
import { useGetItemsPaginated } from "@/hooks/useGetItemsPaginated";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Use the shared hook for pagination
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
    itemsPerPage: 5, // Items per page for admin table
    keepPreviousData: true,
    role: 'seller' // Add role if your API supports it
  });

  const columns = [
    { 
      key: "image", 
      label: t('categories.image') || "Image", 
      type: "image" 
    },
    { 
      key: "name", 
      label: t('categories.subCategoryName') || "Item Name", 
      sortable: false, // Disable sorting since we're using server-side pagination
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
        // The hook will automatically handle going to the previous page if needed
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
    return decodedName; // Fallback to URL parameter
  };

  const categoryDisplayName = getCategoryDisplayName();

  // if (loading) {
  //   return <Loader  />;
  // }

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

  if (items.length === 0 && !loading) {
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
    

      {/* Dynamic Table */}
     <DynamicTable
      data={items}
      columns={columns}
      title={`${t('common.itemsIn') || 'Items in'} ${categoryDisplayName}`}
      addButtonText={t('common.addNewItem') || "Add New Item"}
      onAdd={() => router.push(`/admin/categories/${name}/add-sub-category`)}
      onEdit={(item) => router.push(`/admin/categories/${name}/edit-sub-category/${item._id}`)}
      onDelete={handleDelete}
      onImageClick={(item) => router.push(`/admin/categories`)}
      // Disable internal pagination controls since we're using backend pagination
      showPagination={false}
      // Add loading state for fetching
      isFetching={isFetching}
      // Disable client-side search since we're using server-side pagination
      disableClientSideSearch={true}

      onPageChange={handlePageChange}
  
    />
    {pagination && pagination.totalPages > 1 && (
      <div className="flex flex-col items-center gap-4 bg-white rounded-lg shadow-sm border border-green-100 p-4">
        {/* Pagination Info */}
     
        
        {/* Pagination Buttons */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("common.previous") || "Previous"}
          </button>
          
          {/* Page Numbers */}
          <div className="flex gap-1">
            {generatePageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
                disabled={pageNum === '...'}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pageNum === currentPage
                    ? 'bg-emerald-500 text-white'
                    : pageNum === '...'
                    ? 'text-slate-400 cursor-default'
                    : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination?.hasNextPage}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("common.next") || "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}

   
      {/* Loading overlay during pagination */}
      {isFetching && (
   <Loader/>
      )}
    </div>
  );
}