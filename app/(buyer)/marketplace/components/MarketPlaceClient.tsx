"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Filter, Frown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { Badge } from "flowbite-react";
import { useGetItems } from "@/hooks/useGetItems";

interface Item {
  _id: string;
  name: string;
  points: number;
  price: number;
  measurement_unit: 1|2;
  image: string;
  categoryName: string;
  quantity:number
}

interface ServerData {
  items: Item[];
  categories: string[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface MarketplaceClientProps {
  initialData: ServerData;
}

// Optimized Image Component for LCP
const OptimizedItemImage = ({
  item,
  priority = false,
}: {
  item: Item;
  priority?: boolean;
  index?: number;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate optimized Cloudinary URL - REMOVED fixed height for less cropping
  const getOptimizedImageUrl = (url: string, width: number = 300) => {
    if (url.includes("cloudinary.com")) {
      // Changed from c_fill to c_fit to prevent cropping
      // Removed h_${width} to allow natural aspect ratio
      return url.replace("/upload/", `/upload/c_fit,w_${width},q_auto,f_auto/`);
    }
    return url;
  };

  return (
    // OPTION 1: Keep square but ensure no cropping
    <div className="relative aspect-square bg-gray-50 p-2">
      {/* Placeholder/Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 opacity-50">📦</div>
            <span className="text-xs">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Actual image with padding to prevent cropping */}
      <Image
        src={getOptimizedImageUrl(item.image, 280)} // Slightly smaller to account for padding
        alt={`${item.name} - ${item.categoryName} product image`}
        fill
        className={`object-contain p-1 transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        sizes="(max-width: 640px) 150px, (max-width: 768px) 120px, (max-width: 1024px) 180px, 200px"
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
     
      />
    </div>
  );
};

export default function MarketplaceClient({
  initialData,
}: MarketplaceClientProps) {
  const { t } = useLanguage();
  const { user } = useUserAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState(initialData.items);
const [pagination, setPagination] = useState(initialData.pagination);
  const itemsPerPage = 10;

  useEffect(() => {
    setIsClient(true);

    // Preload critical images for LCP optimization
    if (initialData.items.length > 0) {
      const firstFourImages = initialData.items.slice(0, 4);
      firstFourImages.forEach((item) => {
        const img = new window.Image();
        img.src = item.image.includes("cloudinary.com")
          ? item.image.replace(
              "/upload/",
              "/upload/c_fill,w_300,h_300,q_auto,f_auto/"
            )
          : item.image;
      });
    }

    // Pre-populate React Query cache with server data
    queryClient.setQueryData(["items", 1, null], {
      data: initialData.items,
      pagination: initialData.pagination,
    });
    queryClient.setQueryData(["categories", null], initialData.categories);
  }, [initialData, queryClient]);

  // Client-side fetch functions
// const fetchItems = useCallback(async () => {
//   setLoading(true);
//   try {
//     const res = await api.get(
//       `/categories/get-items?page=${currentPage}&limit=${itemsPerPage}&role=${user?.role || ""}`
//     );
//     setItems(res?.data.data || []);
//     setPagination(res?.data.pagination || initialData.pagination);
//   } catch (error) {
//     console.error('Error fetching items:', error);
//   } finally {
//     setLoading(false);
//   }
// }, [currentPage, itemsPerPage, user?.role]);


const { data, isLoading } = useGetItems({
  currentPage,
  itemsPerPage,
  userRole: user?.role,
});
useEffect(() => {
  if (data) {
    setItems(data?.data);
    setPagination(data?.pagination);
  }
}, [data]);
  const fetchAllCategories = useCallback(async () => {
    if (!isClient) return initialData.categories;

    try {
      const res = await api.get(
        `/categories/get-items?page=1&limit=50&role=${user?.role || ""}`
      );
      const allItems = res?.data.data || [];
      return Array.from(
        new Set(allItems.map((item: Item) => item.categoryName))
      ).sort();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return initialData.categories;
    }
  }, [user?.role, isClient, initialData.categories]);


  // React Query for categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["categories", user?.role],
    queryFn: fetchAllCategories,
    initialData: initialData.categories,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: isClient,
  });


  const uniqueCategories = categoriesData || initialData.categories;

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    if (!searchTerm && selectedCategory === "all") {
      return items;
    }

    const term = searchTerm.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(term) ||
        item.categoryName.toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === "all" || item.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, items]);

  const getMeasurementText = useCallback(
    (unit: 1 | 2): string => {
      return unit === 1 ? t("itemsModal.perKg") : t("itemsModal.perItem");
    },
    [t]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setCurrentPage(page);
        setSearchTerm("");
        setSelectedCategory("all");
      }
    },
    [pagination.totalPages]
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Search is handled by useMemo above
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
//   useEffect(() => {
//   if (isClient) {
//     fetchItems();
//   }
// }, [fetchItems, isClient]);

  return (
    <>
      {/* Search and Filter Controls */}
      <section
        className="mb-4 bg-white rounded-lg shadow-sm p-3 sticky top-0 z-10"
        aria-label="Search and filter controls">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <label htmlFor="search-input" className="sr-only">
              {t("navbar.searchplaceholder")}
            </label>
            <div className="absolute top-3 left-0 pl-3 flex justify-center flex-col">
              <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search-input"
              type="text"
              placeholder={t("navbar.searchplaceholder")}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:ring-1 focus:ring-green-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Search by item name or category
            </div>
          </div>

          <div className="relative w-full sm:w-40">
            <label htmlFor="category-select" className="sr-only">
              Filter by category
            </label>
            <div className="absolute top-2 left-0 pl-3 flex items-center">
              <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg w-full appearance-none bg-white focus:ring-1 focus:ring-green-500 focus:outline-none"
              disabled={categoriesLoading}
              aria-describedby="category-help">
              <option value="all">{t("common.allCategories")}</option>
              {uniqueCategories.map((category: string) => (
                <option key={category} value={category}>
                  {t(
                    `categories.${category?.toLowerCase().replace(/\s+/g, "-")}`
                  )}
                </option>
              ))}
            </select>
            <div id="category-help" className="sr-only">
              Filter items by category
            </div>
          </div>
        </div>
      </section>

      {/* Results Info */}
      <div
        className="flex justify-between items-center mb-3 px-1"
        role="status"
        aria-live="polite">
        <span className="text-xs text-gray-500">
          {t("common.showing")} {filteredItems.length} {t("common.of")}{" "}
          {pagination.totalItems} {t("common.items")}
        </span>
        <span className="text-xs text-gray-500">
          {t("common.page")} {pagination.currentPage} {t("common.of")}{" "}
          {pagination.totalPages}
        </span>
      </div>

      {/* Main Content */}
      <main>
        {(isLoading && !items.length) ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            role="status"
            aria-label="Loading items">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg h-40 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12" role="status">
            <Frown
              className="mx-auto h-10 w-10 text-gray-400"
              aria-hidden="true"
            />
            <h2 className="mt-2 text-sm font-medium text-gray-900">
              No items found
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {searchTerm || selectedCategory !== "all"
                ? "Try different search terms"
                : "No items available yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Section heading for proper hierarchy */}
            <h2 className="sr-only">Available Products</h2>

            {/* Items Grid - Optimized for LCP */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              role="grid"
              aria-label="Available items">
              {filteredItems.map((item, index) => (
                <article
                  key={item._id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-150 h-full flex flex-col"
                  role="gridcell">
                  <Link
                    href={`/marketplace/${encodeURIComponent(item.name)}`}
                    className="h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
                    aria-label={`View details for ${item.name}, priced at ${
                      item.price
                    } ${t("itemsModal.currency")}`}>
                    {/* Optimized Image Component */}
                    <OptimizedItemImage
                      item={item}
                      priority={index < 4} // First 4 images get priority
                      index={index}
                    />

                    <div className="p-2 flex-1 flex flex-col">
                      <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide leading-tight">
                        {t(
                          `categories.subcategories.${item.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`
                        )}
                      </h3>
                      <div className="flex justify-between items-center mt-auto">
                      
                        <span className="text-xs font-bold text-green-600">
                          {item.price}

                          <span className="text-sm mx-2 ml-1">
                            {t("itemsModal.currency")}
                          </span>
                      
                        </span>
                            <span className="text-xs font-bold">
                                {item?.quantity == 0 ?   <Badge color="failure">Out of stock</Badge> : item.quantity+ ' in stock'}
                          </span>
                      </div>
                      <div className="text-[0.6rem] text-gray-500 mt-0.5 text-right">
                        {getMeasurementText(item.measurement_unit)}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav
                className="flex justify-center mt-6"
                role="navigation"
                aria-label="Pagination">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className={`p-1.5 rounded-md ${
                      pagination.hasPreviousPage
                        ? "text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    aria-label="Go to previous page">
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        pagination.currentPage === page
                          ? "bg-green-600 text-white"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={
                        pagination.currentPage === page ? "page" : undefined
                      }>
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`p-1.5 rounded-md ${
                      pagination.hasNextPage
                        ? "text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    aria-label="Go to next page">
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  );
}
