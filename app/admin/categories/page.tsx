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
import Loader from "@/components/common/Loader";

// Type definitions for better type safety
// Updated to match the actual Category type from the API
interface CategoryItem extends Category {
  id: string; // Added for DynamicTable compatibility
  displayName?: string; // Localized name from backend
  displayDescription?: string; // Localized description from backend
}

export default function Page() {
  const { data, isLoading, error, refetch } = useCategories();
  const queryClient = useQueryClient();
  const { getDisplayName, getDisplayDescription, getEnglishName, t } =
    useLocalization();
  const router = useRouter();
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  console.log("Categories data:", data?.data);

  // Listen for navigation back from add category page
  useEffect(() => {
    const handleRouteChange = () => {
      setIsAddingCategory(false);
      // Refetch categories when returning to this page
      refetch();
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [refetch]);

  // Also listen for focus events (when user returns to tab/page)
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

  // Now the backend handles localization, so we can use displayName/displayDescription directly
  const getCategoryDisplayName = (categoryItem: Category): string => {
    return getDisplayName(categoryItem);
  };

  // Backend should now provide correct localized displayDescription
  const getCategoryDisplayDescription = (
    categoryItem: Category
  ): string => {
    return getDisplayDescription(categoryItem);
  };

  // Get English name for API calls (backend operations)
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
              `/admin/categories/${encodeURIComponent(
                categoryName
              )}/get-sub-category`
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
  // Transform data to include id property for DynamicTable compatibility
  const transformedData = data?.data?.map((item: Category) => ({
    ...item,
    id: item._id, // Map _id to id for DynamicTable
  })) || [];

  return (
    <>
      {isLoading ? (
        <Loader  />
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
          itemsPerPage={5}
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
              `/admin/categories/${encodeURIComponent(
                categoryName
              )}/add-sub-category`
            );
          }}
          onImageClick={(item: CategoryItem) => {
            const categoryName = getCategoryEnglishName(item);
            router.push(
              `/admin/categories/${encodeURIComponent(
                categoryName
              )}/get-sub-category`
            );
          }}
        />
      )}
    </>
  );
}