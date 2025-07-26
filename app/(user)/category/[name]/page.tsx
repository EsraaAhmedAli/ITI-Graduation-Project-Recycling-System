"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import Loader from "@/components/common/loader";
import { Recycle, Info, Plus, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Image from "next/image";

interface Item {
  _id: string;
  name: string;
  image: string;
  points: number;
  price: number;
  categoryName: string;
  measurement_unit: 1 | 2;
}

interface CategoryStats {
  totalItems: number;
  estimatedImpact: string;
  pointsRange: string;
}

export default function UserCategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.name as string);
  const { addToCart, loadingItemId } = useCart();

  const { data, isLoading, error } = useQuery<Item[]>({
    queryKey: ["subcategory", categoryName],
    queryFn: async () => {
      const res = await api.get(`/categories/get-items/${encodeURIComponent(categoryName)}`);
      const normalizedItems = res.data.data.map((item: any) => ({
        ...item,
        categoryName: item.categoryName || categoryName,
        measurement_unit: Number(item.measurement_unit) as 1 | 2
      }));
      console.log(res)
      
      return normalizedItems;
    },
    staleTime: 60 * 1000,
    refetchOnMount: false
  });
  
  const getEnvironmentalImpact = (category: string): string => {
    const impacts: Record<string, string> = {
      plastic: "Reduces ocean pollution and saves marine life",
      paper: "Saves trees and reduces deforestation",
      metal: "Conserves natural resources and reduces mining",
      glass: "Infinitely recyclable with 100% material recovery",
      electronics: "Prevents toxic waste and recovers precious metals",
      organic: "Creates compost and reduces methane emissions"
    };
    return impacts[category.toLowerCase()] || "Contributes to a cleaner environment";
  };

  const getPointsRange = (points: number[]) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    return min === max ? `${min} pts` : `${min}-${max} pts`;
  };

  const categoryStats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const points = data.map((item) => item.points);
    return {
      totalItems: data.length,
      estimatedImpact: getEnvironmentalImpact(categoryName),
      pointsRange: getPointsRange(points)
    };
  }, [data, categoryName]);

  const handleAddToCollection = async (item: Item) => {
    try {
      const cartItem = {
        categoryId: item._id,
        categoryName: item.categoryName,
        itemName: item.name,
        image: item.image,
        points: item.points,
        price: item.price,
        measurement_unit: item.measurement_unit,
        quantity: item.measurement_unit === 1 ? 0.25 : 1
      };
      await addToCart(cartItem);
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const getMeasurementText = (unit: 1 | 2): string => {
    return unit === 1 ? "per kg" : "per item";
  };

  if (isLoading) return <Loader title="recyclable items" />;
  if (error) {
    console.error("❌ Query Error:", error);
    return <p className="text-red-500 text-center">Failed to load items.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Recycle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {categoryName} Collection
              </h1>
              <p className="text-slate-600 mt-1">
                Discover recyclable items with environmental impact
              </p>
            </div>
          </div>
          
          {categoryStats && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-slate-700">Environmental Impact</span>
              </div>
              <p className="text-slate-600 mb-4">{categoryStats.estimatedImpact}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Total Items:</span>
                  <span className="font-semibold text-slate-700">{categoryStats.totalItems}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Points Range:</span>
                  <span className="font-semibold text-emerald-600">{categoryStats.pointsRange}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data!.map((item) => (
            <div key={item._id} className="group bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
              
              {/* Image Container - Reduced Size */}
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-50">
               <div className="relative w-full h-48">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                {/* Points Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  +{item.points}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wide leading-tight">
                  {item.name}
                </h3>
                
                {/* Price and Unit Info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-lg">
                    {getMeasurementText(item.measurement_unit)}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900">
                      {item.price}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">EGP</span>
                  </div>
                </div>
                
                {/* Add to Collection Button */}
                <button
                  onClick={() => handleAddToCollection(item)}
                  disabled={loadingItemId === item._id}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md group/button"
                >
                  {loadingItemId === item._id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 group-hover/button:rotate-90 transition-transform duration-200" />
                      <span className="text-sm">Add to Collection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {data!.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No items available</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We're working on adding more recyclable {categoryName.toLowerCase()} items. 
              Check back soon for new additions!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}