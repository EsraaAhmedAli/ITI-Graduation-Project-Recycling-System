"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  Frown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface Item {
  _id: string;
  name: string;
  points: number;
  price: number;
  measurement_unit: number;
  image: string;
  categoryName: string;
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Marketplace() {
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Fetch Function
  const fetchItems = async () => {
   const res= await api.get(
      `/categories/get-items?page=${currentPage}&limit=${itemsPerPage}`
    );

    return res?.data

  };

  // 2. useQuery Hook
  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["items", currentPage],
    queryFn: fetchItems,
    keepPreviousData: true,
  });

  const items: Item[] = data?.data || [];
  const pagination: Pagination = data?.pagination || {
    currentPage,
    itemsPerPage,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // 3. Filtering
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.categoryName.toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === "all" ||
        item.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, items]);

  const uniqueCategories = Array.from(
    new Set(items.map((item) => item.categoryName))
  ).sort();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const getMeasurementText = (unit: number) => {
    return unit === 1 ? "kg" : "pc";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          ♻️ Sustainable Marketplace
        </h1>
        <p className="text-gray-600 text-sm">
          Discover recyclable items and earn rewards
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-3 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:ring-1 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg w-full appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Count */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs text-gray-500">
          Showing {filteredItems.length} of {pagination.totalItems} items
        </span>
        <span className="text-xs text-gray-500">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
      </div>

      {/* Items Grid */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg h-40 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Frown className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No items found
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {searchTerm || selectedCategory !== "all"
              ? "Try different search terms"
              : "No items available yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <Link
                key={item._id}
                href={`/marketplace/${encodeURIComponent(item.name)}`}
                passHref
              >
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-150 h-full flex flex-col">
                  <div className="relative aspect-square">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    <div className="absolute bottom-1 left-1 bg-white/90 px-1.5 py-0.5 rounded text-xs font-medium">
                      {item.categoryName}
                    </div>
                  </div>
                  <div className="p-2 flex-1 flex flex-col">
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs font-bold text-green-600">
                        ${item.price}
                      </span>
                      <span className="flex items-center text-[0.65rem] text-amber-600 font-medium">
                        <Star className="w-3 h-3 mr-0.5 fill-amber-400" />
                        {item.points}
                      </span>
                    </div>
                    <div className="text-[0.6rem] text-gray-500 mt-0.5 text-right">
                      per {getMeasurementText(item.measurement_unit)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className={`p-1.5 rounded-md ${
                    pagination.hasPreviousPage
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                      pagination.currentPage === page
                        ? "bg-green-600 text-white"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`p-1.5 rounded-md ${
                    pagination.hasNextPage
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
