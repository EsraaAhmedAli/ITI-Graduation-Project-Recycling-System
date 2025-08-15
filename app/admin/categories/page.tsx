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
import { useLanguage } from "@/context/LanguageContext";

export default function Page() {
  const { data, isLoading, error } = useCategories();
  const queryClient = useQueryClient();
  const { t } = useLanguage(); // Get translation function
  const router = useRouter();
  console.log(data?.data);
  
  // Helper function to get translated category name
  const getTranslatedCategoryName = (categoryItem: any) => {
    // Extract the English name from the category name object
    const categoryName = typeof categoryItem.name === 'object' ? categoryItem.name.en : categoryItem.name;
    
    // Convert category name to translation key format
    const translationKey = `categories.${categoryName?.toLowerCase()}.name`;
    
    // Try to get translation, fallback to original name if not found
    const translatedName = t(translationKey);
    
    // If translation returns the key itself (not found), return original name
    return translatedName === translationKey ? categoryName : translatedName;
  };

  // Helper function to get translated description
  const getTranslatedDescription = (categoryItem: any) => {
    // Extract the English name from the category name object
    const categoryName = typeof categoryItem.name === 'object' ? categoryItem.name.en : categoryItem.name;
    console.log(categoryName,'ccaatname');
    
    
    const descriptionKey = `categories.${categoryName?.toLowerCase()}.description`;
    const translatedDesc = t(descriptionKey);
    
    // Return translated description or fallback to empty string
    return translatedDesc === descriptionKey ? '' : translatedDesc;
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      type: "image",
      render: (item: any) => (
        <Image
          src={item.image}
          alt={getTranslatedCategoryName(item)}
          width={70}
          height={70}
          className="rounded-full object-cover cursor-pointer"
          onClick={() => {
            const categoryName = typeof item.name === 'object' ? item.name.en : item.name;
            router.push(`/admin/categories/${categoryName}/get-sub-category`);
          }}
        />
      ),
    },
    { 
      key: "name", 
      label: "Category Name", 
      sortable: true,
      render: (item: any) => getTranslatedCategoryName(item)
    },
    { 
      key: "description", 
      label: "Description", 
      sortable: true,
      render: (item: any) => getTranslatedDescription(item) || item.description
    },
  ];

  const handleAddNewCategory = () => {
    router.push("/admin/categories/add-category");
  };

  const handleDelete = async (item: any) => {
    const translatedName = getTranslatedCategoryName(item);
    
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${translatedName}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const categoryName = typeof item.name === 'object' ? item.name.en : item.name;
        await api.delete(`/categories/${encodeURIComponent(categoryName)}`);
        queryClient.invalidateQueries({ queryKey: ["categories list"] });
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `"${translatedName}" has been deleted.`,
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
        <Loader title="categories" />
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
          onEdit={(item) => {
            const categoryName = typeof item.name === 'object' ? item.name.en : item.name;
            router.push(`/admin/categories/${encodeURIComponent(categoryName)}/edit`);
          }}
          onDelete={handleDelete}
          onAddSubCategory={(item) => {
            const categoryName = typeof item.name === 'object' ? item.name.en : item.name;
            router.push(`/admin/categories/${encodeURIComponent(categoryName)}/add-sub-category`);
          }}
          onImageClick={(item) => {
            const categoryName = typeof item.name === 'object' ? item.name.en : item.name;
            router.push(`/admin/categories/${categoryName}/get-sub-category`);
          }}
        />
      )}
      
    </>
  );
}