'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/shared/adminLayout';
import Swal from 'sweetalert2';

export default function EditCategoryPage() {
  const router = useRouter();
  const { name } = useParams();
  const [category, setCategory] = useState({ name: '', description: '', image: '' });
  const [loading, setLoading] = useState(true);

  // ✅ fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/categories/${name}`);
        if (!res.ok) throw new Error('Failed to fetch category');
        const data = await res.json();
        setCategory({
          name: data.name,
          description: data.description,
          image: data.image,
        });
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to fetch category.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [name]);

  // ✅ handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_recycle'); // البريست اللي عملتيه في Cloudinary

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dyz4a4ume/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed");

      setCategory((prev) => ({ ...prev, image: data.secure_url }));
      Swal.fire('Uploaded!', 'Image uploaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Image upload failed.', 'error');
    }
  };


  // ✅ handle update submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/categories/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!res.ok) throw new Error('Failed to update category');

      Swal.fire('Success', 'Category updated successfully.', 'success');
      router.push('/admin/categories');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Update failed.', 'error');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
        <h2 className="text-xl font-bold mb-4">Edit Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={category.name}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold">Description</label>
            <textarea
              name="description"
              value={category.description}
              onChange={handleChange}
              className="w-full border rounded p-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-semibold">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded p-2"
            />
            {category.image && (
              <img
                src={category.image}
                alt="Preview"
                className="w-32 h-32 object-cover mt-2 rounded shadow"
              />
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
