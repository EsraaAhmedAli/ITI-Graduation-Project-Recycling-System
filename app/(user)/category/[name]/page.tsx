"use client";

import { useParams } from "next/navigation";
import {  useMemo } from "react";
import { CartItem, useCart } from "@/context/CartContext";
import Loader from "@/components/common/Loader";
import { Recycle, Plus, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Image from "next/image";
import { useCategories } from "@/hooks/useGetCategories";
import { useLanguage } from "@/context/LanguageContext";

interface LocalizedItem {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  displayName: string; // Localized name from backend
  image: string;
  points: number;
  price: number;
  categoryName: {
    en: string;
    ar: string;
  };
  categoryDisplayName: string; // Localized category name from backend
  measurement_unit: 1 | 2;
  quantity: number;
  categoryId: string;
}
{console.log('esraaaaa')
}
export default function UserCategoryPage() {
const {locale,t,convertNumber} = useLanguage()
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const { addToCart, loadingItemId } = useCart();
  const { getCategoryIdByItemName } = useCategories();

  const { data, isLoading, error } = useQuery<LocalizedItem[]>({
    queryKey: ["subcategory", categoryName, locale], // Include locale for proper caching
    queryFn: async () => {
      const res = await api.get(
        `/categories/get-items/${encodeURIComponent(categoryName)}?language=${locale}`
      );
      
      // Backend should return localized items with displayName and categoryDisplayName
      return res.data.data;
    },
    staleTime: 60 * 1000,
    refetchOnMount: true,
  });

  const getPointsRange = (points: number[]) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    return min === max ? `${min} pts` : `${min}-${max} pts`;
  };

  const categoryStats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const points = data.map((item) => item.points);
    const categoryDisplayName = data[0]?.categoryDisplayName || categoryName;
    
    return {
      totalItems: data.length,
      categoryDisplayName,
      pointsRange: getPointsRange(points),
    };
  }, [data, categoryName]);


 const handleAddToCollection = async (item: LocalizedItem) => {
  try {
    // Get both English and Arabic names
    const englishItemName = typeof item.name === 'string' ? item.name : item.name?.en || '';
    const arabicItemName = typeof item.name === 'string' ? '' : item.name?.ar || '';
    
    // Get category ID using English name (as you prefer)
    const categoryId = getCategoryIdByItemName(englishItemName);

    // Get category names (handle both string and object cases)
    const categoryNameEn = typeof item.categoryName === 'string' 
      ? item.categoryName 
      : item.categoryName?.en || '';
    const categoryNameAr = typeof item.categoryName === 'string' 
      ? '' 
      : item.categoryName?.ar || '';

    const cartItem: CartItem = {
      _id: item._id,
      categoryId: categoryId,
      categoryName: {
        en: categoryNameEn,
        ar: categoryNameAr
      },
      name: {
        en: englishItemName,
        ar: arabicItemName
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
    // Optional: Add user feedback here (toast, alert, etc.)
  }
};
  const getMeasurementText = (unit: number) => {
    return unit === 1 ? t("itemsModal.perKg") : t("itemsModal.perItem");
  };

  if (isLoading) return <Loader />;
  if (error) {
    console.error("❌ Query Error:", error);
    return <p className="text-red-500 text-center">Failed to load items.</p>;
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-100 via-black-100 to-black-100 ">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 ">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Recycle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white-900 tracking-tight">
                {/* Use backend's localized category name instead of translation files */}
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

          {categoryStats && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-700 text-sm">
                  {t("environmentalImpact.environmentalImpact")}
                </span>
              </div>
              <p className="text-slate-600 mb-3 text-sm">
                {t("categoryStats.estimatedImpact")}: {/* You can add impact data to backend too */}
                {t(`environmentalImpact.${categoryName}`)}
              </p>

              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    {t("categoryStats.totalItems")}:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {convertNumber(categoryStats.totalItems)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data!.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
              {/* Image Container */}
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-50">
                <div className="relative w-full h-40">
                  <Image
                    src={item.image}
                    alt={item.name.en}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                {/* Points Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  +{item.points}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide leading-tight">
                  {/* Use backend's localized displayName instead of translation files */}
                  {item.name[locale]}
                </h3>

                {/* Price and Unit Info */}
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

                {/* Add to Collection Button */}
                <button
                  onClick={() => handleAddToCollection(item)}
                  disabled={loadingItemId === item._id}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md group/button">
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

        {/* Empty State */}
        {data!.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              {t("common.noItemsAvailable") || "No items available"}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {t("common.workingOnAddingItems") || `We're working on adding more recyclable ${categoryStats?.categoryDisplayName || categoryName} items. Check back soon for new additions!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}