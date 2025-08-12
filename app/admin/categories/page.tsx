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

export default function Page() {
  const { data, isLoading, error } = useCategories();
  const queryClient = useQueryClient(); // 👈 init queryClient

  const router = useRouter();

  const columns = [
    {
      key: "image",
      label: "Image",
      type: "image",
      render: (item: any) => (
        <Image
          src={item.image}
          alt={item.name}
          width={70}
          height={70}
          className="rounded-full object-cover cursor-pointer"
          onClick={() =>
            router.push(`/admin/categories/${item.name}/get-sub-category`)
          }
        />
      ),
    },
    { key: "name", label: "Category Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
  ];

  const handleAddNewCategory = () => {
    router.push("/admin/categories/add-category");
  };

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
        await api.delete(`/categories/${encodeURIComponent(item.name)}`);
        queryClient.invalidateQueries({ queryKey: ["categories list"] });
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
      {isLoading ? (
        <Loader title="categories" />
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : data.data?.length === 0 ? (
        <>
          <p className="text-center text-gray-500 py-10">
            No categories found.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleAddNewCategory}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all duration-300">
              Start adding new category
            </Button>
          </div>
        </>
      ) : (
        <DynamicTable
          data={data?.data}
          columns={columns}
          title="Categories"
          itemsPerPage={5}
          addButtonText="Add New Category"
          onAdd={handleAddNewCategory}
          onEdit={(item) =>
            router.push(
              `/admin/categories/${encodeURIComponent(item.name)}/edit`
            )
          }
          onDelete={handleDelete}
          onAddSubCategory={(item) =>
            router.push(
              `/admin/categories/${encodeURIComponent(
                item.name
              )}/add-sub-category`
            )
          }
          onImageClick={(item) =>
            router.push(`/admin/categories/${item.name}/get-sub-category`)
          }
        />
      )}
    </>
  );
}
