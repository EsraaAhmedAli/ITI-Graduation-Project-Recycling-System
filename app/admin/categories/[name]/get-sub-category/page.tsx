"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import React, { useMemo } from "react";
import api from "@/lib/axios";
import Loader from "@/components/common/Loader";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const { name: rawName } = useParams();
    const searchParams = useSearchParams();

  const name = searchParams.get('name');
  
  
  
  const categoryKey = decodeURIComponent(rawName || "");
  const router = useRouter();
  const { locale, t } = useLanguage();

  const columns = [
    { key: "image", label: t("admin.items.image") || "Image", type: "image" },
    { key: "name", label: t("admin.items.itemName") || "Item Name", sortable: true },
    { key: "points", label: t("admin.items.points") || "Points", sortable: true },
    { key: "price", label: t("admin.items.price") || "Price (EGP)", sortable: true },
    { key: "measurement_unit", label: t("admin.items.unit") || "Measurement Unit" },
    { key: "quantity", label: t("admin.items.quantity") || "Quantity" },
  ];

  const fetchItems = async () => {
    const res = await api.get(`/get-items/${categoryKey}?lang=${locale}`);
    
    return res.data?.items.map((item: any) => ({
      id: item._id,
      image: item.image,
      name: item.name || "No name",
      points: item.points,
      price: item.price,
      quantity: item.quantity,
      categoryName: item.categoryName, // Keep the translated category name from backend
      measurement_unit:
        item.measurement_unit === 1
          ? locale === "ar" ? "كجم" : "KG"
          : item.measurement_unit === 2
          ? locale === "ar" ? "قطع" : "Pieces"
          : "Unknown",
    }));
  };

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["category-items", categoryKey, locale],
    queryFn: fetchItems,
    enabled: !!categoryKey,
  });

  // Extract the translated category name from the first item (since all items have the same categoryName)
  const displayName = useMemo(() => {
    if (items.length > 0 && items[0].categoryName) {
      return items[0].categoryName;
    }
    // Fallback to categoryKey if no items or no categoryName
    return categoryKey;
  }, [items, categoryKey]);

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: t("admin.items.deleteConfirmTitle") || "Are you sure?",
      text: t("admin.items.deleteConfirmText", { name: item.name }) ||
        `You are about to delete "${item.name}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: t("admin.items.deleteConfirm") || "Yes, delete it!",
      cancelButtonText: t("admin.items.deleteCancel") || "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categories/item/${categoryKey}/${item.id}`);
        await refetch();
        Swal.fire({
          icon: "success",
          title: t("admin.items.deleted") || "Deleted!",
          text: t("admin.items.deletedText", { name: item.name }) || `"${item.name}" has been deleted.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: t("admin.items.error") || "Error",
          text: t("admin.items.errorText") || "Something went wrong while deleting.",
        });
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader title={`${t("admin.categories.itemsIn") || "Items in"} ${name}`} />
      ) : isError ? (
        <p className="text-center text-red-500 py-10">{(error as any)?.message || t("admin.items.errorText")}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 py-10">{t("admin.items.noItems") || "No items found for this category."}</p>
      ) : (
        <DynamicTable
          data={items}
          columns={columns}
          title={`${t("admin.categories.itemsIn") || "Items in"} ${name}`}
          itemsPerPage={5}
          addButtonText={t("admin.items.addNew") || "Add New Item"}
          onAdd={() => router.push(`/admin/categories/${categoryKey}/add-sub-category`)}
          onEdit={(item) => router.push(`/admin/categories/${categoryKey}/edit-sub-category/${item.id}`)}
          onDelete={handleDelete}
          onImageClick={() => router.push(`/admin/categories`)}
        />
      )}
    </>
  );
}