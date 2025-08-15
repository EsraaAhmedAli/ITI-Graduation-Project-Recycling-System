"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";

import Image from "next/image";
import toast from "react-hot-toast";
const unitMap: Record<string, 1 | 2> = {
  kg: 1,
  g: 1,
  piece: 2,
  pieces: 2,
};

export default function AddSubCategoryPage() {
  const router = useRouter();
  const { name } = useParams(); // category name from dynamic route
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    itemName: "",
    points: "",
    price: "",
    quantity: "",
    measurement_unit: "",
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.length) {
      const file = files[0];
      setImageFile(file);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("itemName", formData.itemName);
      form.append("points", formData.points);
      form.append("price", Math.floor(formData.points/19));
      form.append("quantity", formData.quantity);

      // convert measurement_unit string to number enum here:
      const unitString = formData.measurement_unit.toLowerCase().trim();
      const measurement_unit = unitMap[unitString];
      if (!measurement_unit) {
        throw new Error("Invalid measurement unit");
      }
      form.append("measurement_unit", measurement_unit.toString());

      if (imageFile) {
        form.append("image", imageFile);
      }

      await axios.post(`/categories/add-item/${name}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // success toast...
      router.push("/admin/categories");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message)

      // error toast...
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="max-w-2xl mx-auto p-6" style={{ background: "var(--background)" }}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <h1 className="text-2xl font-bold">Add Sub-Category to "{name}"</h1>
            <p className="mt-1 opacity-90">
              Fill in the details below to add a new sub-category
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6" style={{background:"var(--background)"}}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sub-Category Name *
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Enter sub-category name"
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
                  // onChange={handleChange}
                  className="w-full px-4 py-2 border bg-gray-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
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
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="">Select unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="piece">Piece</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sub-Category Image *
              </label>
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
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImageFile(file);
                          if (file) {
                            setPreviewUrl(URL.createObjectURL(file));
                          } else {
                            setPreviewUrl(null);
                          }
                        }}
                        className="sr-only"
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              {imageFile && (
                <div className="mt-2 flex items-center space-x-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Selected:</span>{" "}
                    {imageFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                      // Also clear the file input value to allow re-upload of same file if needed
                      const input = document.getElementById(
                        "file-upload"
                      ) as HTMLInputElement;
                      if (input) input.value = "";
                    }}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800 rounded-md border border-red-600 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                </div>
              )}

              {previewUrl && (
                <div className="mt-4">
                  <Image
                    width={64}
                    height={64}
                    src={previewUrl}
                    alt="Preview"
                    className=" object-cover rounded-lg border border-gray-300 shadow"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/admin/categories")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
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
                    Processing...
                  </span>
                ) : (
                  "Add Sub-Category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
