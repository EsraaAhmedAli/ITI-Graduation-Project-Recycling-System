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
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";

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
  const{t}=useLanguage()
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const {user} = useUserAuth()

  // 1. Fetch Function for Items
  const fetchItems = async () => {
    const res = await api.get(`/categories/get-items?page=${currentPage}&limit=${itemsPerPage}&role=${user?.role}`);
    
    return res?.data;
  };

  // 2. Fetch Function for All Categories (fetch all items without pagination to get all categories)
  const fetchAllCategories = async () => {
    try {
      // Fetch items with a high limit to get all items and extract categories
      const res = await api.get(`/categories/get-items?page=1&limit=50&role=${user?.role}`);
          console.log(res.data.data);

      return res?.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [] };
    }
  };

  // 3. useQuery Hook for Items
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

  // 4. useQuery Hook for Categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since categories don't change often
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

  // Extract unique categories from all items
  const allItems: Item[] = categoriesData || [];
  console.log(allItems);
  
  const uniqueCategories = Array.from(
    new Set(allItems.map((item) => item.categoryName))
  ).sort();
  // console.log(uniqueCategories);
  

  // 5. Filtering
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

const getMeasurementText = (unit: 1 | 2): string => {
  return unit === 1 ? t('itemsModal.perKg', { defaultValue: 'per kg' }) : t('itemsModal.perItem', { defaultValue: 'per item' });
};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          ♻️ {t('marketPlace.sustainableMarketplace')}
        </h1>
        <p className="text-gray-600 text-sm">
{
  t('marketPlace.marketPlaceDesc')
}        </p>
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
              placeholder={t('navbar.searchplaceholder')}
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
              disabled={categoriesLoading}
            >
              <option value="all">{t('common.allCategories')}</option>
              {Array.isArray(uniqueCategories) && uniqueCategories.map((category: any) => {
                // Handle if category is an object with name property or just a string
                const categoryName = typeof category === 'string' ? category : category?.name || category?.categoryName;
                return (
                  <option key={categoryName} value={categoryName}>
                    {t(`categories.${categoryName?.toLowerCase().replace(/\s+/g, "-")}`, { defaultValue: categoryName })}
                  </option>
                );
              })}
            </select>
            {categoriesLoading && (
              <div className="text-xs text-gray-500 mt-1">
                Loading categories...
              </div>
            )}
            {categoriesError && (
              <div className="text-xs text-red-500 mt-1">
                Error loading categories
              </div>
            )}
            {/* Debug info - remove this after fixing */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-blue-500 mt-1">
                Categories count: {Array.isArray(uniqueCategories) ? uniqueCategories.length : 'Not an array'}
              </div>
            )}
            {categoriesError && (
              <div className="text-xs text-red-500 mt-1">
                Error loading categories
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Count */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs text-gray-500">
          {t('common.showing')} {filteredItems.length} {t('common.of')} {pagination.totalItems} {t('common.items')}
        </span>
        <span className="text-xs text-gray-500">
          {t('common.page')} {pagination.currentPage} {t('common.of')} {pagination.totalPages}
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
        
                  </div>
                  <div className="p-2 flex-1 flex flex-col">
                          <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide leading-tight">
  {t(`categories.subcategories.${item.name.toLowerCase().replace(/\s+/g, "-")}`, { defaultValue: item.name })}
</h3>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs font-bold text-green-600">
                        {item.price}
                          <span className="text-sm mx-2  ml-1">{t('itemsModal.currency')}</span>

                      </span>
                      
                    
                    </div>
                    <div className="text-[0.6rem] text-gray-500 mt-0.5 text-right">
                    {getMeasurementText(item.measurement_unit)}
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