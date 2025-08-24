"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
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
  
  // Pass pagination to useCategories hook
  const { data, isLoading, error, refetch } = useCategories({
    page: currentPage,
    limit: itemsPerPage
  });
  
  const queryClient = useQueryClient();
  const { getDisplayName, getDisplayDescription, getEnglishName, t } = useLocalization();
  const router = useRouter();
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  console.log("Categories data:", data?.data);
  console.log("Pagination info:", data?.pagination);

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
      render: (item: CategoryItem) => getCategoryDisplayName(item),
    },
    {
      key: "description",
      label: t("categories.description") || "Description",
      sortable: true,
      render: (item: CategoryItem) => getCategoryDisplayDescription(item),
    },
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

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
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

  return (
    <>
      {isLoading ? (
        <TableSkeleton rows={5} columns={3} showActions={true} />
      ) : error ? (
        <p className="text-center text-red-500 py-10">
          {t("categories.errorLoadingCategories") || "Error loading categories"}
        </p>
      ) : data?.data?.length === 0 ? (
        <>
          <p className="text-center text-gray-500 py-10">
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
                  <span>{t("categories.addNewCategory") || "Adding..."}</span>
                </>
              ) : (
                <span>{t("categories.startAddingCategory") || "Start adding new category"}</span>
              )}
            </button>
          </div>
        </>
      ) : (
        <DynamicTable
          data={transformedData}
          columns={columns}
          title={t("categories.categories") || "Categories"}
          itemsPerPage={itemsPerPage}
          showPagination={true}
          isLoading={isLoading}
          addButtonText={
            isAddingCategory 
              ? (t("categories.addNewCategory") || "Adding...")
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
        />
      )}
    </>
  );
}