"use client";

import DynamicTable from "@/components/shared/dashboardTable";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function Page() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { name } = useParams(); // category name from dynamic route
  const router = useRouter();

  const columns = [
    { key: "image", label: "Image", type: "image" },
    { key: "name", label: "Item Name", sortable: true },
    { key: "points", label: "Points", sortable: true },
    { key: "price", label: "Price (EGP)", sortable: true },
    { key: "measurement_unit", label: "Measurement Unit" },
    { key: "quantity", label: "Quantity" },
  ];

  const fetchItems = async () => {
    try {
      const res = await api.get(`categories/get-items/${name}`);
      const data = res.data;

      const formatted = data.map((item: any) => ({
        id: item._id,
        image: item.image,
        name: item.name || "No name",
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
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name) fetchItems();
  }, [name]);

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${item.name}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!",
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
          title: "Deleted!",
          text: `"${item.name}" has been deleted.`,
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
      {loading ? (
        <p className="text-center py-10">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No items found for this category.
        </p>
      ) : (
        <DynamicTable
          data={items}
          columns={columns}
          title={`Items in Category ${name}`}
          itemsPerPage={5}
          addButtonText="Add New Item"
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
