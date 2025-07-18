'use client';

import AdminLayout from '@/components/shared/adminLayout';
import DynamicTable from '@/components/shared/dashboardTable';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';

export default function Page() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const columns = [
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'name', label: 'Category Name', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
  ];

  // ✅ fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/categories');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      const formatted = data.map((cat: any) => ({
        id: cat._id,
        image: cat.image,
        name: cat.name,
        description: cat.description,
      }));
      setCategories(formatted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ handle delete with SweetAlert
  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${item.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/categories/${item.name}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Failed to delete');

        await fetchCategories(); 
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `"${item.name}" has been deleted.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong while deleting.',
        });
      }
    }
  };

  return (
    <AdminLayout>
      {loading ? (
        <p className="text-center py-10">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No categories found.</p>
      ) : (
        <DynamicTable
          data={categories}
          columns={columns}
          title="Categories"
          itemsPerPage={5}
          addButtonText="Add New Category"
          onAdd={() => router.push('/admin/categories/add-category')}
          onDelete={handleDelete}
          onEdit={(item) => router.push(`/admin/categories/${item.name}/edit`)}
        />
      )}
    </AdminLayout>
  );
}
