"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";

// More robust category name normalization
const normalizeCategoryName = (name: string): string => {
  if (!name) return '';
  
  let decoded = name;
  try {
    // Handle multiple levels of URL encoding
    while (decoded.includes('%') && decoded !== decodeURIComponent(decoded)) {
      decoded = decodeURIComponent(decoded);
    }
  } catch (error) {
    console.warn('Failed to decode name:', error);
  }
  
  return decoded.trim();
};

// Create URL-safe category name
const createUrlSafeName = (name: string): string => {
  return encodeURIComponent(name.trim());
};

// Use your existing categories/get-items endpoint which maps to the robust getItems function
const fetchCategoryItems = async (categoryName: string) => {
  try {
    console.log('Fetching items using existing categories/get-items endpoint for:', categoryName);
    const encodedName = createUrlSafeName(categoryName);
    const res = await api.get(`/categories/get-items/${encodedName}`);
    
    console.log('Success with categories/get-items endpoint. Response structure:', {
      success: res.data.success,
      dataLength: res.data.data?.length,
      pagination: res.data.pagination
    });
    
    return { data: res.data, workingName: categoryName };
  } catch (err) {
    console.error('Failed with categories/get-items endpoint:', err?.response?.status, err?.response?.data);
    throw err;
  }
};

export default function EditItemPage() {
  const { name: rawName, itemId } = useParams();
  const normalizedName = normalizeCategoryName(rawName as string);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    itemNameAr: "",
    points: "",
    price: "",
    quantity: "",
    measurement_unit: "1",
    image: null as File | null,
    currentImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actualCategoryName, setActualCategoryName] = useState('');
  const [debugInfo, setDebugInfo] = useState({
    rawName: rawName as string,
    normalizedName,
    attempts: [] as string[]
  });
  const { tAr, isLoaded } = useLanguage();

  useEffect(() => {
    if (!isLoaded || !normalizedName || !itemId) return;

 const fetchItem = async () => {
  try {
    console.log('=== FETCH ITEM DEBUG START ===');
    console.log('Raw name from URL:', rawName);
    console.log('Normalized name:', normalizedName);
    console.log('Item ID:', itemId);
    
    // Use the new single item endpoint instead of the paginated one
    console.log('Using single item endpoint for category:', normalizedName);
    const res = await api.get(`/categories/${createUrlSafeName(normalizedName)}/item/${itemId}`);
    const itemData = res.data;
    
    console.log('Successfully fetched single item');
    console.log('Item data structure:', {
      success: itemData.success,
      hasData: !!itemData.data
    });
    
    setActualCategoryName(normalizedName);
    
    const item = itemData.data;
    
    if (item) {
      console.log('Found item:', {
        id: item._id,
        name: item.name,
        points: item.points
      });
      
      setFormData({
        name: item.name?.en || item.name || "",
        itemNameAr: item.name?.ar || "",
        points: item.points?.toString() || "",
        price: item.price?.toString() || "",
        quantity: item.quantity?.toString() || "",
        measurement_unit: item.measurement_unit?.toString() || "1",
        image: null,
        currentImage: item.image || "",
      });
    } else {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    
    console.log('=== FETCH ITEM DEBUG END ===');
  } catch (err: any) {
    console.error('=== FETCH ITEM ERROR ===');
    console.error('Error details:', {
      message: err.message,
      status: err?.response?.status,
      responseData: err?.response?.data,
      stack: err.stack
    });
    
    let errorMessage = "Failed to fetch item data";
    if (err?.response?.status === 404) {
      errorMessage = `Item not found in category "${normalizedName}". The item may have been deleted or moved.`;
    } else if (err.message?.includes('not found')) {
      errorMessage = err.message;
    }
    
    // Show more detailed error for debugging
    const detailedError = process.env.NODE_ENV === 'development' 
      ? `${errorMessage}\n\nDebug info:\nRaw name: ${rawName}\nNormalized: ${normalizedName}\nItem ID: ${itemId}`
      : errorMessage;
    
    Swal.fire({
      icon: "error",
      title: "Error Loading Item",
      text: detailedError,
      confirmButtonColor: "#10b981",
      showCancelButton: true,
      cancelButtonText: "Go Back",
      confirmButtonText: "Retry"
    }).then((result) => {
      if (result.isDismissed) {
        router.back();
      } else if (result.isConfirmed) {
        window.location.reload();
      }
    });
  } finally {
    setLoading(false);
  }
};

    fetchItem();
  }, [normalizedName, itemId, rawName, router, isLoaded]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "image" && files && files[0]) {
      const newImage = files[0];
      const previewURL = URL.createObjectURL(newImage);

      setFormData((prev) => ({
        ...prev,
        image: newImage,
        currentImage: previewURL,
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const categoryNameForUpdate = actualCategoryName || normalizedName;
      
      const data = new FormData();
      data.append("name", formData.name);
      data.append("nameAr", formData.itemNameAr);
      data.append("points", formData.points);
      data.append("price", Math.floor(+formData.points / 19).toString());
      data.append("quantity", formData.quantity);
      data.append("measurement_unit", formData.measurement_unit);
      
      if (formData.image) data.append("image", formData.image);

      console.log('Updating item with category name:', categoryNameForUpdate);

      // Use the existing update item route
      await api.put(`/categories/item/${createUrlSafeName(categoryNameForUpdate)}/${itemId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Item updated successfully!");
      
      // Navigate back with the working category name
      const redirectPath = `/admin/categories/${createUrlSafeName(categoryNameForUpdate)}/get-sub-category`;
      console.log('Redirecting to:', redirectPath);
      
      // Use replace to avoid issues with back navigation
      router.replace(redirectPath);

    } catch (err: any) {
      console.error('Update error:', err);
      
      let errorMessage = "Failed to update item";
      if (err?.response?.status === 404) {
        errorMessage = "Item or category not found. The category might have been renamed or deleted.";
      } else if (err?.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Show loading state
  if (loading || !isLoaded) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <h1 className="text-2xl font-bold">Edit Item</h1>
            <p className="mt-1 opacity-90">Loading item details...</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
   
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <h1 className="text-2xl font-bold">Edit Item</h1>
          <p className="mt-1 opacity-90">
            Update the details of your item
            {actualCategoryName && ` in ${actualCategoryName}`}
          </p>
        </div>

        {/* Rest of your form JSX remains the same... */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" style={{background: "var(--background)"}}>
          {/* Your existing form fields... */}
          {/* English Item Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Item Name (English) *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Enter item name in English"
              required
            />
          </div>

          {/* Arabic Item Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Item Name (Arabic)
            </label>
            <input
              type="text"
              name="itemNameAr"
              value={formData.itemNameAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-right"
              placeholder="أدخل اسم العنصر بالعربية"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Points *
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Enter points"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price *
              </label>
              <input
                disabled
                type="number"
                name="price"
                value={Math.floor(+formData.points / 19)}
                className="w-full px-4 py-2 border bg-gray-200 border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Enter quantity"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Measurement Unit *
            </label>
            <select
              name="measurement_unit"
              value={formData.measurement_unit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              required
            >
              <option value="1">KG</option>
              <option value="1">gm</option>
              <option value="2">Pieces</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Item Image
            </label>

            {formData.currentImage && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                <Image
                  src={formData.currentImage}
                  width={100}
                  height={100}
                  alt="Current item"
                  className="object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="image" type="file" accept="image/*" onChange={handleChange} className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const categoryNameForNav = actualCategoryName || normalizedName;
                router.push(`/admin/categories/${createUrlSafeName(categoryNameForNav)}/get-sub-category`);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Item"
              )}
            </button>
          </div>
        </form>

        {/* Debug panel in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t bg-gray-50 p-4">
            <h4 className="font-semibold text-sm mb-2">Debug Information:</h4>
            <div className="text-xs space-y-1">
              <p><strong>Raw Name:</strong> {rawName}</p>
              <p><strong>Normalized Name:</strong> {normalizedName}</p>
              <p><strong>Working Name:</strong> {actualCategoryName}</p>
              <p><strong>Item ID:</strong> {itemId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}