'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';

export default function EditCategoryPage() {
  const queryClient = useQueryClient();

  const router = useRouter();
const params = useParams();
const name = decodeURIComponent(params.name as string);
console.log(encodeURIComponent(name),'ttt');

  const [category, setCategory] = useState({ 
    name: '', 
    nameAr:'',
    descriptionAr:'',
    description: '', 
    image: '' 
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const{tAr}= useLanguage()
  

  
useEffect(() => {
  const fetchCategory = async () => {
    try {
      const res = await api.get(`get-items/${encodeURIComponent(name)}`);
      console.log(res.data);
      
      // Handle both string and object name formats
      const categoryName = typeof res.data.name === 'object' 
        ? res.data.name.en 
        : res.data.name;

      // Generate translation keys
      const translationKey = `categories.${categoryName.toLowerCase()}.name`;
      const translationDesc = `categories.${categoryName.toLowerCase()}.description`;
      
      // Always get Arabic translations using tAr
      const arKey = tAr(translationKey);
      const arDesc = tAr(translationDesc);
      
      console.log('Translation key:', translationKey);
      console.log('Arabic translation:', arKey);
      console.log('Arabic description:', arDesc);

      setCategory({
        name: categoryName,
        nameAr: arKey,        // Always Arabic regardless of current language
        description: res.data.description,
        descriptionAr: arDesc, // Always Arabic regardless of current language
        image: res.data.image,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch category',
        confirmButtonColor: '#10b981',
      });
    } finally {
      setLoading(false);
    }
  };
  
  fetchCategory();
}, [name, tAr]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_recycle');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dyz4a4ume/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.secure_url) throw new Error('Upload failed');

      setCategory((prev) => ({ ...prev, image: data.secure_url }));
  
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Image upload failed',
        confirmButtonColor: '#10b981',
      });
    } finally {
      setUploading(false);
    }
  };
  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const updateData = {
      name: category.name,
      nameAr: category.nameAr,
      description: category.description,
      descriptionAr: category.descriptionAr,
      image: category.image
    };

    await api.put(`/categories/${encodeURIComponent(name)}`, updateData);
    
    // Invalidate and refresh data
    await queryClient.invalidateQueries({ queryKey: ['categories list'] });
    await queryClient.refetchQueries({ queryKey: ['categories list'] });

    // Show success message and handle navigation
    await Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Category has been updated successfully',
      confirmButtonColor: '#10b981',
      willClose: () => {
        // This will execute when the alert closes
        window.location.href = '/admin/categories';
      }
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Update failed',
      confirmButtonColor: '#10b981',
    });
  } finally {
    setLoading(false);
  }
};
  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <h1 className="text-2xl font-bold">Edit Category</h1>
            <p className="mt-1 opacity-90">Update the details of your category</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6"  style={{background: "var(--background)"}}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>

          {/* Arabic Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Arabic Name *</label>
            <input
              type="text"
              name="nameAr"
              value={category.nameAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-right dir-rtl"
              required
            />
          </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={category.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                rows={3}
              />
            </div>
                 <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Arabic Description</label>
            <textarea
              name="descriptionAr"
              value={category.descriptionAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-right dir-rtl"
              rows={3}
            />
          </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category Image</label>
              
              {category.image && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                  <img
                    src={category.image}
                    alt="Current category"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {uploading && (
                <p className="text-sm text-emerald-600 mt-2 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading image...
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/categories')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}