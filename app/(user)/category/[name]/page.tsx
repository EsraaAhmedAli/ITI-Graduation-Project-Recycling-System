"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import { Loader } from '@/components/common'
import {
  Recycle,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  useGetItemsPaginated,
  LocalizedItem,
} from "@/hooks/useGetItemsPaginated";
import dynamic from "next/dynamic";

// Lazy load FloatingRecorderButton for voice processing
const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton'),
  { ssr: false }
);

export default function UserCategoryPage() {
  const { locale, t, convertNumber } = useLanguage();
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const { addToCart, loadingItemId } = useCart();

  const {
    data,
    pagination,
    isLoading,
    isFetching,
    error,
    currentPage,
    handlePageChange,
    generatePageNumbers,
    categoryStats,
  } = useGetItemsPaginated({
    categoryName,
    itemsPerPage: 12,
    keepPreviousData: true,
  });
console.log(data,'dddd');
// const catId= data.map((cat=>cat.categoryId))
// const test = getCategoryIdByItemName(item?.name.en)
// console.log(test,'test');



  const handleAddToCollection = async (item: LocalizedItem,catId) => {
    try {
      const englishItemName =
        typeof item.name === "string" ? item.name : item.name?.en || "";
      const arabicItemName =
        typeof item.name === "string" ? "" : item.name?.ar || "";

      const categoryId = catId;

      const categoryNameEn =
        typeof item.categoryName === "string"
          ? item.categoryName
          : item.categoryName?.en || "";
      const categoryNameAr =
        typeof item.categoryName === "string"
          ? ""
          : item.categoryName?.ar || "";

      const cartItem: CartItem = {
        _id: item._id,
        categoryId: categoryId,
        categoryName: {
          en: categoryNameEn,
          ar: categoryNameAr,
        },
        name: {
          en: englishItemName,
          ar: arabicItemName,
        },
        image: item.image,
        points: item.points,
        price: item.price,
        measurement_unit: item.measurement_unit,
        quantity: item.measurement_unit === 1 ? 0.25 : 1,
      };

      await addToCart(cartItem);
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const getMeasurementText = (unit: number) => {
    return unit === 1 ? t("itemsModal.perKg") : t("itemsModal.perItem");
  };

  if (isLoading) return <Loader />;

  if (error) {
    console.error("Query Error:", error);
    return <p className="text-red-500 text-center">Failed to load items.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-100 via-black-100 to-black-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Recycle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white-900 tracking-tight">
                {t("collectionsOfCategory", {
                  collections: t("common.collectionsPlural"),
                  category: categoryStats?.categoryDisplayName || categoryName,
                })}
              </h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base">
                {t("staticCategories.discoverMoreSub")}
              </p>
            </div>
          </div>

        
        </div>

        {/* Loading overlay for pagination */}
        {isFetching && (
          <div className="relative">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {data.map((item) => (
            <div
              key={item._id}
              className="group rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
              style={{ background: "var(--color-card)" }}
            >
              {/* Image Container */}
              <div
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom right, var(--card-gradient-start), var(--card-gradient-end))",
                }}
                className="relative "
              >
                <div className="relative w-full h-40">
                  <Image
                    src={item.image}
                    alt={item.name.en}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  +{item.points}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide leading-tight">
                  {item.name[locale]}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-lg">
                    {getMeasurementText(item.measurement_unit)}
                  </span>
                  <div className="text-end">
                    <span className="text-base font-bold text-slate-900">
                      {convertNumber(item.price)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      {t("itemsModal.currency")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCollection(item,item.categoryId)}
                  disabled={loadingItemId === item._id}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md group/button"
                >
                  {loadingItemId === item._id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 group-hover/button:rotate-90 transition-transform duration-200" />
                      <span className="text-sm">
                        {t("itemsModal.addToCollection")}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            {/* Pagination Info */}
            <div className="text-sm text-slate-600 text-center">
              {t("common.showing", {
                start:
                  (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                end: Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                ),
                total: pagination.totalItems,
              }) ||
                `Showing ${
                  (pagination.currentPage - 1) * pagination.itemsPerPage + 1
                }-${Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )} of ${pagination.totalItems} items`}
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("common.previous") || "Previous"}
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {generatePageNumbers().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof pageNum === "number"
                        ? handlePageChange(pageNum)
                        : undefined
                    }
                    disabled={pageNum === "..."}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? "bg-emerald-500 text-white"
                        : pageNum === "..."
                        ? "text-slate-400 cursor-default"
                        : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination?.hasNextPage}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("common.next") || "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              {t("common.noItemsAvailable") || "No items available"}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {t("common.workingOnAddingItems") ||
                `We're working on adding more recyclable ${
                  categoryStats?.categoryDisplayName || categoryName
                } items. Check back soon for new additions!`}
            </p>
          </div>
        )}
      </div>
      
      {/* Voice Processing Component */}
      <FloatingRecorderButton />
    </div>
  );
}
