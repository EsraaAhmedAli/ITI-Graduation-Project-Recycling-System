"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import Loader from "@/components/common/loader";
import { Recycle, Info } from "lucide-react";
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
      const res = await api.get(`/categories/get-items/${categoryName}`);
      const normalizedItems = res.data.map((item: any) => ({
        ...item,
        categoryName: item.categoryName || categoryName,
        measurement_unit: Number(item.measurement_unit) as 1 | 2
      }));
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
  if (error) return <p className="text-red-500 text-center">Failed to load items.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
   

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-green-600" />
            Recyclable {categoryName} Items
          </h2>
          <p className="text-gray-600 mb-6">
            Browse through recyclable {categoryName.toLowerCase()} items. Points are awarded based on material value and environmental benefit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data!.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
          <div className="relative w-full h-48">
  <Image
    src={item.image}
    alt={item.name}
    fill
    className="object-cover rounded" // add "rounded" if you want rounded corners like before
    sizes="100vw"
  />
</div>
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  +{item.points} pts
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.name.toUpperCase()}</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {getMeasurementText(item.measurement_unit)}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {item.price} EGP
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddToCollection(item)}
                  disabled={loadingItemId === item._id}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingItemId === item._id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Recycle className="w-4 h-4" />
                      Add to Collection
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {data!.length === 0 && (
          <div className="text-center py-12">
            <Recycle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No items available</h3>
            <p className="text-gray-400">Check back later for more recyclable {categoryName.toLowerCase()} items.</p>
          </div>
        )}
      </div>
    </div>
  );
}
