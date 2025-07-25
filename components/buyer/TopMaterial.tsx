

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "flowbite-react";
import { Recycle, Leaf, Award, BarChart2 } from "lucide-react";

interface TopMaterial {
  name: string;
  totalRecycled: number;
  totalPoints: number;
  image?: string;
  categoryName?: string;
  unit?: string;
}

export default function TopMaterial() {
  const [materials, setMaterials] = useState<TopMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalRecycled: 0,
    totalPoints: 0,
    topCategory: ""
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTopMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(
          `http://localhost:5000/api/top-materials-recycled?page=${page}&limit=8`
        );

        if (res.data.success) {
          const transformed = res.data.data.map((item: any) => ({
            name: item._id?.itemName || "Unknown",
            totalRecycled: item.totalQuantity,
            totalPoints: item.totalPoints,
            image: item.image,
            categoryName: item.categoryName,
            unit: "kg",
          }));
          
          setMaterials(transformed);
          setTotalPages(Math.ceil(res.data.total / 8));
          
          // Calculate statistics
          const totalRecycled = transformed.reduce(
            (sum: number, item: TopMaterial) => sum + item.totalRecycled, 0
          );
          const totalPoints = transformed.reduce(
            (sum: number, item: TopMaterial) => sum + item.totalPoints, 0
          );
          
          // Find top category
          const categoryCounts = transformed.reduce(
            (acc: any, item: TopMaterial) => {
              if (item.categoryName) {
                acc[item.categoryName] = (acc[item.categoryName] || 0) + item.totalRecycled;
              }
              return acc;
            }, {}
          );
          
          const topCategory = Object.entries(categoryCounts)
            .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "";
          
          setStats({
            totalRecycled,
            totalPoints,
            topCategory
          });
        } else {
          throw new Error("Failed to load data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Server connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchTopMaterials();
  }, [page]);

  const MaterialCardSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8  padding-bottom-0">
      {/* Header Section */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-emerald-100 p-3 rounded-full mb-4">
          <Recycle className="h-8 w-8 text-emerald-700" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-3">
          Top Recycled Materials
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the most recycled materials and contribute to a sustainable future
        </p>
      </header>

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: BarChart2,
            bg: "bg-blue-100",
            iconColor: "text-blue-600",
            label: "Total Recycled Quantity",
            value: `${stats.totalRecycled.toLocaleString()} kg`
          },
          {
            icon: Award,
            bg: "bg-amber-100",
            iconColor: "text-amber-600",
            label: "Total Points Earned",
            value: `${stats.totalPoints.toLocaleString()} pts`
          },
          {
            icon: Leaf,
            bg: "bg-green-100",
            iconColor: "text-green-600",
            label: "Top Recycling Category",
            value: stats.topCategory || "N/A"
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} p-3 rounded-full`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Materials Grid */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Recycle className="h-5 w-5 text-emerald-600" />
          Materials List
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <MaterialCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No recycled materials found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {materials.map((material, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {material.image ? (
                    <img
                      src={material.image}
                      alt={material.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Recycle className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {material.name}
                      </h3>
                      {material.categoryName && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                          {material.categoryName}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2">
                        <Recycle className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          Recycled: <span className="font-medium">{material.totalRecycled} kg</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          Points: <span className="font-medium">{material.totalPoints}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 mx-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 mx-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Eco Impact Banner */}
  
    </div>
  );
}