"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Loader from "@/components/common/Loader";
import { useLanguage } from "@/context/LanguageContext";

export default function Page() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { name } = useParams(); // category name from dynamic route
  const router = useRouter();
  const { t } = useLanguage(); // Get translation function

  // Helper function to get translated category name
  const getTranslatedCategoryName = (categoryName: string) => {
    const translationKey = `categories.${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
    const translatedName = t(translationKey);
    return translatedName === translationKey ? categoryName : translatedName;
  };

  // Helper function to get translated item name
  const getTranslatedItemName = (itemName: string, categoryName: string) => {
    // First try specific category subcategory
    const subcategoryKey = `categories.subcategories.${itemName.toLowerCase().replace(/\s+/g, '-')}`;
    let translatedName = t(subcategoryKey);
    
    // If not found, try items structure
    if (translatedName === subcategoryKey) {
      const itemKey = `items.${categoryName}.${itemName.toLowerCase().replace(/\s+/g, '-')}`;
      translatedName = t(itemKey);
      
      // If still not found, return original name
      if (translatedName === itemKey) {
        return itemName;
      }
    }
    
    return translatedName;
  };

  // Helper function to translate measurement units
  const getTranslatedMeasurementUnit = (unit: string) => {
    switch (unit.toLowerCase()) {
      case 'kg':
        return t('common.unitKg') || 'KG';
      case 'pieces':
        return t('common.unitPiece') || 'Pieces';
      default:
        return unit;
    }
  };

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
      render: (item: any) => getTranslatedItemName(item.originalName || item.name, name as string)
    },
    { 
      key: "points", 
      label: t('itemsModal.points') || "Points", 
      sortable: true 
    },
    { 
      key: "price", 
      label: `${t('itemsModal.unitPrice') || 'Price'} (${t('itemsModal.currency') || 'EGP'})`, 
      sortable: true 
    },
    { 
      key: "measurement_unit", 
      label: t('common.measurementUnit') || "Measurement Unit",
      render: (item: any) => getTranslatedMeasurementUnit(item.measurement_unit)
    },
    { 
      key: "quantity", 
      label: t('common.quantity') || "Quantity" 
    },
  ];

  const fetchItems = async () => {
    try {
      const res = await api.get(`categories/get-items/${name}`);
      const data = res.data;

      const formatted = data.data.map((item: any) => ({
        id: item._id,
        image: item.image,
        name: getTranslatedItemName(item.name || "No name", name as string),
        originalName: item.name || "No name", // Keep original name for translation lookup
        points: item.points,
        price: item.price,
        quantity: item.quantity,
        measurement_unit:
          item.measurement_unit === 1
            ? "KG"
            : item.measurement_unit === 2
              ? "Pieces"
              : "Unknown",
      }));

      setItems(formatted);
    } catch (err: any) {
      setError(err.message || t('staticCategories.errorLoadingCategories') || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name) fetchItems();
  }, [name]);

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: t('profile.orders.cancelConfirm') || "Are you sure?",
      text: `You are about to delete "${item.name}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: t('profile.orders.confirmYes') || "Yes, delete it!",
      cancelButtonText: t('profile.orders.confirmNo') || "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // ✅ correct DELETE endpoint
        await api.delete(`/categories/item/${name}/${item.id}`, {
          method: "DELETE",
        });

        await fetchItems(); // ✅ refresh items list

        Swal.fire({
          icon: "success",
          title: t('profile.orders.cancelled') || "Deleted!",
          text: `"${item.name}" has been deleted.`,
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

  const translatedCategoryName = getTranslatedCategoryName(name as string);

  return (
    <>
      {loading ? (
        <Loader title={`${t('common.items') || 'items'} ${t('common.in') || 'in'} ${translatedCategoryName}`} />
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
          title={`${t('common.items') || 'Items'} ${t('common.in') || 'in'} ${t('breadcrumbs.category') || 'Category'} ${translatedCategoryName}`}
          itemsPerPage={5}
          addButtonText={t('common.addNewItem') || "Add New Item"}
          onAdd={() =>
            router.push(`/admin/categories/${name}/add-sub-category`)
          }
          onEdit={(item) =>
            router.push(
              `/admin/categories/${name}/edit-sub-category/${item.id}`
            )
          }
          onDelete={handleDelete}
          onImageClick={(item) => router.push(`/admin/categories`)}
        />
      )}
    </>
  );
}