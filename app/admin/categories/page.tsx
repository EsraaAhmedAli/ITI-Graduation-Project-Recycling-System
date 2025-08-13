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
  const { locale, t } = useLanguage();
  const { data, isLoading, error } = useCategories({ language: locale });
  const queryClient = useQueryClient();
  const router = useRouter();

  const columns = [
    {
      key: "image",
      label: t("admin.categories.image") || "Image",
      type: "image",
      render: (item: any) => (
        <Image
          src={item.image}
          alt={item.name}
          width={70}
          height={70}
          className="rounded-full object-cover cursor-pointer"
          onClick={() => handleImageClick(item)}
        />
      ),
    },
    { 
      key: "name", 
      label: t("admin.categories.categoryName") || "Category Name", 
      sortable: true 
    },
    { 
      key: "description", 
      label: t("admin.categories.description") || "Description", 
      sortable: true 
    },
  ];

  const handleAddNewCategory = () => {
    router.push("/admin/categories/add-category");
  };

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: t("admin.categories.deleteConfirmTitle") || "Are you sure?",
      text: t("admin.categories.deleteConfirmText", { name: item.name }) || 
            `You are about to delete "${item.name}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: t("admin.categories.deleteConfirm") || "Yes, delete it!",
      cancelButtonText: t("admin.categories.deleteCancel") || "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Use original name or the current name for the API call
        const nameForApi = item.originalName || item.name;
        // Single encoding is enough - the backend middleware will handle decoding
        await api.delete(`/categories/${encodeURIComponent(nameForApi)}`);
        
        queryClient.invalidateQueries({ queryKey: ["categories list"] });
        
        Swal.fire({
          icon: "success",
          title: t("admin.categories.deleteSuccess") || "Deleted!",
          text: t("admin.categories.deleteSuccessText", { name: item.name }) || 
                `"${item.name}" has been deleted.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: t("admin.categories.deleteError") || "Error",
          text: t("admin.categories.deleteErrorText") || "Something went wrong while deleting.",
        });
      }
    }
  };

  const handleEdit = (item: any) => {
    const nameForEdit = item.originalName || item.name;
    // Single encoding - backend will decode properly
    router.push(`/admin/categories/${encodeURIComponent(nameForEdit)}/edit`);
  };

  const handleAddSubCategory = (item: any) => {
    const nameForSub = item.originalName || item.name;
    router.push(`/admin/categories/${encodeURIComponent(nameForSub)}/add-sub-category`);
  };

  const handleImageClick = (item: any) => {
    const nameForNav = item.originalName || item.name;
    // This is the key fix - single encoding only
    router.push(`/admin/categories/${encodeURIComponent(nameForNav)}/get-sub-category`);
  };

  return (
    <>
      {isLoading ? (
        <Loader title={t("admin.categories.loading") || "categories"} />
      ) : error ? (
        <p className="text-center text-red-500 py-10">
          {t("admin.categories.error") || error}
        </p>
      ) : data?.length === 0 ? (
        <>
          <p className="text-center text-gray-500 py-10">
            {t("admin.categories.noCategories") || "No categories found."}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleAddNewCategory}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all duration-300">
              {t("admin.categories.startAdding") || "Start adding new category"}
            </Button>
          </div>
        </>
      ) : (
        <DynamicTable
          data={data.data}
          columns={columns}
          title={t("admin.categories.title") || "Categories"}
          itemsPerPage={5}
          addButtonText={t("admin.categories.addNew") || "Add New Category"}
          onAdd={handleAddNewCategory}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSubCategory={handleAddSubCategory}
          onImageClick={handleImageClick}
        />
      )}
    </>
  );
}