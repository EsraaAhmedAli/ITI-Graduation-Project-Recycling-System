"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Loader from "@/components/common/Loader";
import { useLocalization } from "@/utils/localiztionUtil";

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
  const [items, setItems] = useState<SubcategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { name } = useParams(); // category name from dynamic route
  const router = useRouter();
  
  // Use shared localization utilities at component level
  const { getDisplayName, getEnglishName, getMeasurementUnit, formatCurrency, t, locale } = useLocalization();

  const columns = [
    { 
      key: "image", 
      label: t('itemsModal.image') || "Image", 
      type: "image" 
    },
    { 
      key: "name", 
      label: t('itemsModal.name') || "Item Name", 
      sortable: true,
      render: (item: SubcategoryItem) => getDisplayName(item) // Uses backend's displayName
    },
    { 
      key: "points", 
      label: t('itemsModal.points') || "Points", 
      sortable: true 
    },
    { 
      key: "price", 
      label: `${t('itemsModal.unitPrice') || 'Price'} (${t('itemsModal.currency') || 'EGP'})`, 
      sortable: true,
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

  const fetchItems = async () => {
    try {
      // Use locale from hook (already called at component level)
      const res = await api.get(`categories/get-items/${name}?language=${locale}`);
      const data = res.data;

      // No need to transform data - backend provides localized displayName
      setItems(data.data);
    } catch (err: any) {
      setError(err.message || t('staticCategories.errorLoadingCategories') || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name) fetchItems();
  }, [name, locale]); // Add locale as dependency to refetch when language changes

  const handleDelete = async (item: SubcategoryItem) => {
    const displayName = getDisplayName(item);
    
    const result = await Swal.fire({
      title: t('profile.orders.cancelConfirm') || "Are you sure?",
      text: `You are about to delete "${displayName}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: t('profile.orders.confirmYes') || "Yes, delete it!",
      cancelButtonText: t('profile.orders.confirmNo') || "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categories/item/${name}/${item._id}`);
        await fetchItems(); // Refresh items list

        Swal.fire({
          icon: "success",
          title: t('profile.orders.cancelled') || "Deleted!",
          text: `"${displayName}" has been deleted.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: t('profile.orders.failed') || "Something went wrong while deleting.",
        });
      }
    }
  };

  // Get category display name from first item (if available)
  const getCategoryDisplayName = (): string => {
    if (items.length > 0 && items[0].categoryDisplayName) {
      return items[0].categoryDisplayName;
    }
    return name as string; // Fallback to URL parameter
  };

  const categoryDisplayName = getCategoryDisplayName();

  return (
    <>
      {loading ? (
        <Loader title={`${t('common.items') || 'items'} ${t('common.in') || 'in'} ${categoryDisplayName}`} />
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          {t('profile.orders.empty') || 'No items found for this category.'}
        </p>
      ) : (
        <DynamicTable
          data={items}
          columns={columns}
          title={`${t('common.items') || 'Items'} ${t('common.in') || 'in'} ${t('breadcrumbs.category') || 'Category'} ${categoryDisplayName}`}
          itemsPerPage={5}
          addButtonText={t('common.addNewItem') || "Add New Item"}
          onAdd={() =>
            router.push(`/admin/categories/${name}/add-sub-category`)
          }
          onEdit={(item) =>
            router.push(
              `/admin/categories/${name}/edit-sub-category/${item._id}`
            )
          }
          onDelete={handleDelete}
          onImageClick={(item) => router.push(`/admin/categories`)}
        />
      )}
    </>
  );
}