"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function EditItemPage() {
  const { name: rawName, itemId } = useParams();
  const name = decodeURIComponent(rawName || "").toLowerCase();

  const router = useRouter();

const [formData, setFormData] = useState({
  name: "",
  nameAr: "",      // <-- add this
  points: "",
  price: "",
  quantity: "",
  measurement_unit: "1",
  image: null as File | null,
  currentImage: "",
});

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const {locale}=useLanguage()

useEffect(() => {
  const fetchItem = async () => {
    try {
      console.log('=== FETCHING ITEM FOR EDIT ===');
      console.log('Category:', name, 'ItemId:', itemId, 'Locale:', locale);
      
      // Get the item data in the current locale
      const res = await api.get(
        `categories/get-items/${name}?lang=${locale}`
      );

      const data = res.data.data || res.data;
      const item = data.find((i: any) => i._id === itemId);

      if (item) {
        console.log('Found item:', item.name);
        
        // IMPROVED: Fetch item data in BOTH languages to populate both fields
        const [enResponse, arResponse] = await Promise.all([
          api.get(`categories/get-items/${name}?lang=en`),
          api.get(`categories/get-items/${name}?lang=ar`)
        ]);
        
        const enData = enResponse.data.data || enResponse.data;
        const arData = arResponse.data.data || arResponse.data;
        
        const enItem = enData.find((i: any) => i._id === itemId);
        const arItem = arData.find((i: any) => i._id === itemId);
        
        console.log('EN version:', enItem?.name);
        console.log('AR version:', arItem?.name);
        
        setFormData({
          name: enItem?.name || item.name || "",           // Always get English name
          nameAr: arItem?.name || item.name || "",         // Always get Arabic name
          points: item.points,
          price: item.price,
          quantity: item.quantity,
          measurement_unit: item.measurement_unit.toString(),
          image: null,
          currentImage: item.image || "",
        });
        
        console.log('Form data set with EN:', enItem?.name, 'AR:', arItem?.name);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Fallback: Try to get the item by ID directly
      try {
        console.log('Trying fallback: get item by ID');
        const fallbackRes = await api.get(`categories/item-by-id/${name}/${itemId}?lang=en`);
        const item = fallbackRes.data;
        
        if (item) {
          // If we only get one version, try to determine which language it is
          const isArabic = item.name && item.name.match(/[\u0600-\u06FF]/);
          
          setFormData({
            name: isArabic ? "" : item.name,           // If Arabic, leave English empty
            nameAr: isArabic ? item.name : "",         // If Arabic, put in Arabic field
            points: item.points,
            price: item.price,
            quantity: item.quantity,
            measurement_unit: item.measurement_unit.toString(),
            image: null,
            currentImage: item.image || "",
          });
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch item data",
          confirmButtonColor: "#10b981",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (name && itemId) fetchItem();
}, [name, itemId, locale]);
// Test the API endpoints directly
fetch('/api/categories/get-items/plastic?lang=en')
  .then(r => r.json())
  .then(data => {
    console.log('EN data:', data);
    const acrylic = data.data.find(item => 
      item.name.includes('acrylic') || item.name.includes('اكريلك')
    );
    console.log('Acrylic in EN:', acrylic);
  });

fetch('/api/categories/get-items/plastic?lang=ar')
  .then(r => r.json())
  .then(data => {
    console.log('AR data:', data);
    const acrylic = data.data.find(item => 
      item.name.includes('acrylic') || item.name.includes('اكريلك')
    );
    console.log('Acrylic in AR:', acrylic);
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "image" && files && files[0]) {
      const newImage = files[0];
      const previewURL = URL.createObjectURL(newImage); // Create preview URL

      setFormData((prev) => ({
        ...prev,
        image: newImage,
        currentImage: previewURL, // Set preview as currentImage
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
          data.append("nameAr", formData.nameAr);  // Add this line

      data.append("points", formData.points);
      data.append("price",Math.floor( formData.points/19));
      data.append("quantity", formData.quantity);

      data.append("measurement_unit", formData.measurement_unit);
      if (formData.image) data.append("image", formData.image);

    const res = await api.put(`/categories/item/${name}/${itemId}`, data, {
  headers: {
    "Content-Type": "multipart/form-data",
  },

      });

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Item updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });

      router.push(`/admin/categories/${name}/get-sub-category`);
    } catch (err) {
      console.error(err.response.data.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response.data.message,
        confirmButtonColor: "#10b981",
      });
    } finally {
      setUploading(false);
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
            <h1 className="text-2xl font-bold">Edit Item</h1>
            <p className="mt-1 opacity-90">Update the details of your item</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
    <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    {locale === 'en' ? 'English Name *' : 'Arabic Name *'}
  </label>
  <input
    type="text"
    name={locale === 'en' ? 'name' : 'nameAr'}
    value={locale === 'en' ? formData.name : formData.nameAr}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
    placeholder={locale === 'en' ? "Enter English name" : "Enter Arabic name"}
    required
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
                  value={Math.floor(formData.points/19)}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border bg-gray-200 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="Enter price"
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
                  placeholder="Enter price"
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
                    className=" object-cover rounded-lg border border-gray-200"
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
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              {formData.image && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Selected:</span>{" "}
                  {formData.image.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/categories/${name}/get-sub-category`)
                }
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
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Item"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
