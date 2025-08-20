"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import Image from "next/image";
import Button from "@/components/common/Button";
import { useLocalization } from "@/utils/localiztionUtil";

export default function AddCategoryPage() {
  const router = useRouter();
  const { t } = useLocalization();
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFormValid =
    name.trim() !== "" &&
    nameAr.trim() !== "" &&
    description.trim() !== "" &&
    descriptionAr.trim() !== "" &&
    imageFile !== null;

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error(t("addCategory.selectImageError") || "Please select an image for the category!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("nameAr", nameAr);
      formData.append("description", description);
      formData.append("descriptionAr", descriptionAr);
      formData.append("image", imageFile);

      const response = await api.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success(t("addCategory.categoryCreatedSuccess") || "Category created successfully");
        
        // Try multiple navigation methods with fallbacks
        try {
          // Method 1: Try router first
          router.push('/admin/categories');
          
          // Method 2: Force refresh after a short delay
          setTimeout(() => {
            router.refresh();
          }, 50);
          
          // Method 3: Fallback to hard redirect if router doesn't work
          setTimeout(() => {
            if (window.location.pathname !== '/admin/categories') {
              window.location.href = '/admin/categories';
            }
          }, 200);
          
        } catch (navError) {
          console.error('Navigation error:', navError);
          window.location.href = '/admin/categories';
        }
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (err: any) {
      console.error('Submission error:', err);
      const errorMessage = 
        err?.response?.data?.message ||
        err.message ||
        t("common.somethingWentWrong") ||
        "Something went wrong!";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="max-w-2xl mx-auto p-6 "
        style={{ background: "var(--color-base-100)" }}
      >
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <h1 className="text-2xl font-bold">{t("addCategory.title") || "Add New Category"}</h1>
            <p className="mt-1 opacity-90">
              {t("addCategory.subtitle") || "Fill in the details below to create a new category"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("addCategory.categoryNameEnglish") || "Category Name (English)"} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder={t("addCategory.categoryNameEnglishPlaceholder") || "Enter category name in English"}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("addCategory.categoryNameArabic") || "Category Name (Arabic)"} *
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-right"
                  placeholder={t("addCategory.categoryNameArabicPlaceholder") || "أدخل اسم الفئة بالعربية"}
                  dir="rtl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("addCategory.descriptionEnglish") || "Description (English)"} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  rows={3}
                  placeholder={t("addCategory.descriptionEnglishPlaceholder") || "Enter category description in English"}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("addCategory.descriptionArabic") || "Description (Arabic)"} *
                </label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-right"
                  rows={3}
                  placeholder={t("addCategory.descriptionArabicPlaceholder") || "أدخل وصف الفئة بالعربية"}
                  dir="rtl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("addCategory.categoryImage") || "Category Image"} *
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
                      <span>{t("addCategory.uploadFile") || "Upload a file"}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
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
                    <p className="pl-1">{t("addCategory.orDragAndDrop") || "or drag and drop"}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("addCategory.fileTypes") || "PNG, JPG, GIF up to 5MB"}
                  </p>
                </div>
              </div>

              {imageFile && (
                <div className="mt-2 flex items-center space-x-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">{t("addCategory.selected") || "Selected"}:</span>{" "}
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
                    {t("common.remove") || "Remove"}
                  </button>
                </div>
              )}

              {previewUrl && (
                <div className="mt-4">
                  <Image
                    width={64}
                    height={64}
                    src={previewUrl}
                    alt={t("addCategory.preview") || "Preview"}
                    className="object-cover rounded-lg border border-gray-300 shadow"
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
                {t("common.cancel") || "Cancel"}
              </button>
              <Button
                type="submit"
                disabled={loading || !isFormValid}
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
                    {t("common.processing") || "Processing"}...
                  </span>
                ) : (
                  t("addCategory.addCategory") || "Add Category"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}