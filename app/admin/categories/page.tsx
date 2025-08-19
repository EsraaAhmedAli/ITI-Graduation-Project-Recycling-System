"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React from "react";
import api from "@/lib/axios";
import Loader from "@/components/common/Loader";
import Image from "next/image";
import Button from "@/components/common/Button";
import { useCategories } from "@/hooks/useGetCategories";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalization } from "@/utils/localiztionUtil";

// Type definitions for better type safety
interface BilingualText {
  en: string;
  ar: string;
}

interface CategoryItem {
  _id: string;
  name: BilingualText | string;
  description: BilingualText | string;
  image: string;
  items: any[];
  displayName?: string; // Localized name from backend
  displayDescription?: string; // Localized description from backend
}

export default function Page() {
  const { data, isLoading, error } = useCategories();
  const queryClient = useQueryClient();
  const { getDisplayName, getDisplayDescription, getEnglishName, t, locale } = useLocalization();
  const router = useRouter();
  
  console.log("Categories data:", data?.data);
  
  // Now the backend handles localization, so we can use displayName/displayDescription directly
  const getCategoryDisplayName = (categoryItem: CategoryItem): string => {
    return getDisplayName(categoryItem);
  };

  // Backend should now provide correct localized displayDescription  
  const getCategoryDisplayDescription = (categoryItem: CategoryItem): string => {
    return getDisplayDescription(categoryItem);
  };

  // Get English name for API calls (backend operations)
  const getCategoryEnglishName = (categoryItem: CategoryItem): string => {
    return getEnglishName(categoryItem);
  };

  const columns = [
    {
      key: "image",
      label: "Image",
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
            router.push(`/admin/categories/${encodeURIComponent(categoryName)}/get-sub-category`);
          }}
        />
      ),
    },
    { 
      key: "name", 
      label: "Category Name", 
      sortable: true,
      render: (item: CategoryItem) => getCategoryDisplayName(item)
    },
    { 
      key: "description", 
      label: "Description", 
      sortable: true,
      render: (item: CategoryItem) => getCategoryDisplayDescription(item)
    },
  ];

  const handleAddNewCategory = () => {
    router.push("/admin/categories/add-category");
  };

  const handleDelete = async (item: CategoryItem) => {
    const displayName = getCategoryDisplayName(item);
    
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${displayName}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const categoryName = getCategoryEnglishName(item);
        await api.delete(`/categories/${encodeURIComponent(categoryName)}`);
        queryClient.invalidateQueries({ queryKey: ["categories list"] });
        Swal.fire({
          icon: "success",
          title: "Deleted!",
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

  return (
    <>
      {isLoading ? (
        <Loader title={t('loaders.Categories')} />
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : data?.data?.length === 0 ? (
        <>
          <p className="text-center text-gray-500 py-10">
            {t('staticCategories.errorLoadingCategories') || 'No categories found.'}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleAddNewCategory}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all duration-300">
              {t('common.startAdding') || 'Start adding new category'}
            </Button>
          </div>
        </>
      ) : (
        <DynamicTable
          data={data?.data}
          columns={columns}
          title={t('staticCategories.categories') || 'Categories'}
          itemsPerPage={5}
          addButtonText={t('staticCategories.addNewCategory') || 'Add New Category'}
          onAdd={handleAddNewCategory}
          onEdit={(item: CategoryItem) => {
            const categoryName = getCategoryEnglishName(item);
            router.push(`/admin/categories/${encodeURIComponent(categoryName)}/edit`);
          }}
          onDelete={handleDelete}
          onAddSubCategory={(item: CategoryItem) => {
            const categoryName = getCategoryEnglishName(item);
            router.push(`/admin/categories/${encodeURIComponent(categoryName)}/add-sub-category`);
          }}
          onImageClick={(item: CategoryItem) => {
            const categoryName = getCategoryEnglishName(item);
            router.push(`/admin/categories/${encodeURIComponent(categoryName)}/get-sub-category`);
          }}
        />
      )}
    </>
  );
}