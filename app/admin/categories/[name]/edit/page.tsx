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
  const { locale } = useLanguage();
    const [initialData, setInitialData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    image: ''
  });
const [englishCategoryName, setEnglishCategoryName] = useState('');

  const [category, setCategory] = useState({ 
    name: '', 
    nameAr: '',
    description: '', 
    descriptionAr: '',
    image: '' 
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/get-items/${encodeURIComponent(name)}?lang=${locale}`);
        const info = res.data;
        
        setCategory({
          name: info.name || '',
          nameAr: info.name || '',
          description: info.description || '',
          descriptionAr: info.description || '',
          image: info.image || ''
        });
        
        // Store initial data for comparison
        setInitialData({
          name: info.name || '',
          nameAr: info.nameAr || '',
          description: info.description || '',
          descriptionAr: info.descriptionAr || '',
          image: info.image || ''
        });
        
        setEnglishCategoryName(info.name);
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
  }, [name, locale]);


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

      setCategory(prev => ({ ...prev, image: data.secure_url }));
      await Swal.fire({
        icon: 'success',
        title: 'Uploaded!',
        text: 'Image uploaded successfully',
        showConfirmButton: false,
        timer: 1500,
      });
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
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Only include fields for the current locale
      if (locale === 'en') {
        formData.append('name', category.name);
        formData.append('description', category.description);
      } else {
        formData.append('nameAr', category.nameAr);
        formData.append('descriptionAr', category.descriptionAr);
      }
      
      // Always include image if changed
      if (category.image !== initialData.image) {
        formData.append('image', category.image);
      }

      await api.put(`/categories/${encodeURIComponent(name)}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Category updated successfully',
        showConfirmButton: false,
        timer: 1500,
      });

      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/admin/categories');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Update failed',
        confirmButtonColor: '#10b981',
      });
    } finally {
      setUploading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <h1 className="text-2xl font-bold">
            {locale === 'en' ? 'Edit Category' : 'تعديل الفئة'}
          </h1>
          <p className="mt-1 opacity-90">
            {locale === 'en' ? 'Update the details of your category' : 'قم بتحديث تفاصيل الفئة'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Conditionally render fields based on locale */}
         {locale === 'en' ? (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">English Content</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name (English) *</label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description (English)</label>
              <textarea
                name="description"
                value={category.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">المحتوى العربي</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">الاسم (عربي)</label>
              <input
                type="text"
                name="nameAr"
                value={category.nameAr}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">الوصف (عربي)</label>
              <textarea
                name="descriptionAr"
                value={category.descriptionAr}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-right"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>
        )}

          {/* Image Upload (always visible) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {locale === 'en' ? 'Category Image' : 'صورة الفئة'}
            </label>
            
            {category.image && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  {locale === 'en' ? 'Current Image:' : 'الصورة الحالية:'}
                </p>
                <img
                  src={category.image}
                  alt={locale === 'en' ? 'Current category' : 'الفئة الحالية'}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors">
              {/* ... existing image upload UI ... */}
            </div>
            {uploading && (
              <p className="text-sm text-emerald-600 mt-2 flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'en' ? 'Uploading image...' : 'جاري رفع الصورة...'}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/categories')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              {locale === 'en' ? 'Cancel' : 'إلغاء'}
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-70"
            >
              {uploading ? 
                (locale === 'en' ? 'Saving...' : 'جاري الحفظ...') : 
                (locale === 'en' ? 'Save Changes' : 'حفظ التغييرات')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}