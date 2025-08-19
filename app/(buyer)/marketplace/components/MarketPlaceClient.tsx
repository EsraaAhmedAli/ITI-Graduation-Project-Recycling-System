"use client";

import { useEffect, useState, useMemo, useCallback, memo, startTransition, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Filter, Frown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { Badge } from "flowbite-react";
import { useGetItems } from "@/hooks/useGetItems";
import { useItemSocket } from "@/hooks/useItemSocket";
import LazyPagination from "@/components/common/lazyPagination";

interface Item {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  points: number;
  price: number;
  measurement_unit: 1 | 2;
  image: string;
  categoryName: {
    en: string;
    ar: string;
  };
  quantity: number;
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



// Preload critical images using requestIdleCallback
const preloadCriticalImages = (items: Item[]) => {
  if (typeof window === 'undefined') return;
  
  const preloadImage = (src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  };

  // Use requestIdleCallback to avoid blocking main thread
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      items.slice(0, 4).forEach((item) => {
        preloadImage(getOptimizedImageUrl(item.image, 280));
      });
    }, { timeout: 1000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      items.slice(0, 4).forEach((item) => {
        preloadImage(getOptimizedImageUrl(item.image, 280));
      });
    }, 100);
  }
};

// Move outside component to prevent recreation
const getOptimizedImageUrl = (url: string, width: number = 300) => {
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", `/upload/c_fit,w_${width},q_auto,f_auto,dpr_auto/`);
  }
  return url;
};

// Simplified image component - remove unnecessary state and effects for better TBT
const OptimizedItemImage = memo(({
  item,
  priority = false,
  index = 0,
}: {
  item: Item;
  priority?: boolean;
  index?: number;
}) => {
  const optimizedSrc = useMemo(() => getOptimizedImageUrl(item.image, 280), [item.image]);

  return (
    <div className="relative aspect-square bg-gray-50 overflow-hidden">
      <Image
        src={optimizedSrc}
        alt={item.name.en}
        fill
        className="object-contain p-2"
        sizes="(max-width: 640px) 150px, (max-width: 768px) 120px, (max-width: 1024px) 180px, 200px"
        priority={priority}
        quality={priority ? 85 : 70}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
});

OptimizedItemImage.displayName = 'OptimizedItemImage';

// Simplified Item Card - reduce complexity to improve TBT
const ItemCard = memo(({ 
  item, 
  index, 
  locale, 
  convertNumber, 
  t, 
  getMeasurementText 
}: {
  item: Item;
  index: number;
  locale: string;
  convertNumber: (num: number) => string;
  t: (key: string) => string;
  getMeasurementText: (unit: 1 | 2) => string;
}) => {
  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-150 h-full flex flex-col">
      <Link
        href={`/marketplace/${encodeURIComponent(item.name.en)}`}
        className="h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
        prefetch={index < 2 ? true : false} // Only prefetch first 2 items
      >
        <OptimizedItemImage
          item={item}
          priority={index < 3}
          index={index}
        />

        <div className="p-2 flex-1 flex flex-col">
          <h3 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide leading-tight line-clamp-2">
            {item.name[locale]}
          </h3>
          
          <div className="flex justify-between items-center mt-auto">
            <span className="text-xs font-bold text-green-600">
              {convertNumber(item.price)} {t("itemsModal.currency")}
            </span>
            
            <span className="text-xs font-bold">
              {item?.quantity === 0 ? (
                <Badge color="failure" size="sm">{t('common.outOfStock')}</Badge>
              ) : (
                `${convertNumber(item.quantity)} ${t('common.inStock')}`
              )}
            </span>
          </div>
          
          <div className="text-[0.6rem] text-gray-500 mt-0.5 text-right">
            {getMeasurementText(item.measurement_unit)}
          </div>
        </div>
      </Link>
    </article>
  );
});

ItemCard.displayName = 'ItemCard';

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Virtualized grid component for better performance with many items
const VirtualizedGrid = memo(({ 
  items, 
  renderItem 
}: { 
  items: Item[];
  renderItem: (item: Item, index: number) => React.ReactNode;
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const itemHeight = 250; // Approximate item height
      const containerHeight = window.innerHeight;
      const itemsPerRow = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2;
      
      const start = Math.floor(scrollTop / itemHeight) * itemsPerRow;
      const end = Math.min(start + (Math.ceil(containerHeight / itemHeight) + 2) * itemsPerRow, items.length);
      
      setVisibleRange({ start: Math.max(0, start - itemsPerRow), end });
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* Render spacer for items before visible range */}
      {visibleRange.start > 0 && (
        <div 
          className="col-span-full" 
          style={{ height: Math.floor(visibleRange.start / 5) * 250 }}
        />
      )}
      
      {visibleItems.map((item, index) => (
        <div key={item._id}>
          {renderItem(item, visibleRange.start + index)}
        </div>
      ))}
      
      {/* Render spacer for items after visible range */}
      {visibleRange.end < items.length && (
        <div 
          className="col-span-full" 
          style={{ height: Math.floor((items.length - visibleRange.end) / 5) * 250 }}
        />
      )}
    </div>
  );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';

export default function MarketplaceClient({ initialData }: MarketplaceClientProps) {
  const { t, locale, convertNumber } = useLanguage();
  const { user } = useUserAuth();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState(initialData.items);
  const [pagination, setPagination] = useState(initialData.pagination);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 400); // Increased debounce
  const itemsPerPage = 10;

  // Memoize measurement text function
  const getMeasurementText = useCallback(
    (unit: 1 | 2): string => {
      return unit === 1 ? t("itemsModal.perKg") : t("itemsModal.perItem");
    },
    [t]
  );

  useEffect(() => {
    // Use startTransition to prevent blocking
    startTransition(() => {
      setIsClient(true);
    });
    
    // Delay preloading to after initial render
    preloadCriticalImages(initialData.items);
    
    // Pre-populate React Query cache
    queryClient.setQueryData(["items", 1, null], {
      data: initialData.items,
      pagination: initialData.pagination,
    });
  }, [initialData, queryClient]);

  const { data, isLoading } = useGetItems({
    currentPage,
    itemsPerPage,
    userRole: user?.role,
    category: selectedCategory,
    search: debouncedSearchTerm,
  });

  // Conditionally load socket hook only when needed
  useItemSocket({
    currentPage,
    itemsPerPage,
    userRole: user?.role,
    selectedCategory,
    searchTerm: debouncedSearchTerm,
    enabled: isClient, // Only enable after client-side hydration
  });

  useEffect(() => {
    if (data) {
      startTransition(() => {
        setItems(data?.data);
        setPagination(data?.pagination);
      });
    }
  }, [data]);

  useEffect(() => {
    startTransition(() => {
      setCurrentPage(1);
    });
  }, [selectedCategory, debouncedSearchTerm]);

  // Simplified categories fetch
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", user?.role],
    queryFn: async () => {
      if (!isClient) return initialData.categories;
      const res = await api.get(`/categories/get-items?page=1&limit=50&role=${user?.role || ""}`);
      const allItems = res?.data.data || [];
      return [...new Set(allItems.map((item: Item) => item.categoryName.en))].sort();
    },
    initialData: initialData.categories,
    staleTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    enabled: isClient,
  });

  const uniqueCategories = categoriesData || initialData.categories;

  // Optimized filtering with early returns
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm && selectedCategory === "all") {
      return items;
    }

    return items.filter((item) => {
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        const matchesSearch = 
          item.name[locale].toLowerCase().includes(term) ||
          item.categoryName[locale].toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      
      if (selectedCategory !== "all") {
        const matchesCategory = item.categoryName.en === selectedCategory;
        if (!matchesCategory) return false;
      }
      
      return true;
    });
  }, [debouncedSearchTerm, selectedCategory, items, locale]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        startTransition(() => {
          setCurrentPage(page);
          setSearchTerm("");
          setSelectedCategory("all");
        });
      }
    },
    [pagination.totalPages]
  );

  // Handle search with transition
  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  }, []);

  // Handle category change with transition
  const handleCategoryChange = useCallback((value: string) => {
    startTransition(() => {
      setSelectedCategory(value);
    });
  }, []);

  // Render item function for virtualized grid
  const renderItem = useCallback((item: Item, index: number) => (
    <ItemCard
      item={item}
      index={index}
      locale={locale}
      convertNumber={convertNumber}
      t={t}
      getMeasurementText={getMeasurementText}
    />
  ), [locale, convertNumber, t, getMeasurementText]);

  // Loading skeleton
  const LoadingSkeleton = memo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg h-40 animate-pulse" />
      ))}
    </div>
  ));

  return (
    <>
      {/* Simplified Search Controls */}
      <section className="mb-4 bg-white rounded-lg shadow-sm p-3 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("navbar.searchplaceholder")}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:ring-1 focus:ring-green-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-40">
            <Filter className="absolute top-2 left-3 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg w-full appearance-none bg-white focus:ring-1 focus:ring-green-500 focus:outline-none"
            >
              <option value="all">{t("common.allCategories")}</option>
              {uniqueCategories.map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs text-gray-500">
          {t("common.showing")} {convertNumber(filteredItems.length)} {t("common.of")} {convertNumber(pagination.totalItems)} {t("common.items")}
        </span>
        <span className="text-xs text-gray-500">
          {t("common.page")} {convertNumber(pagination.currentPage)} {t("common.of")} {convertNumber(pagination.totalPages)}
        </span>
      </div>

      {/* Main Content */}
      <main>
        {isLoading && !items.length ? (
          <LoadingSkeleton />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Frown className="mx-auto h-10 w-10 text-gray-400" />
            <h2 className="mt-2 text-sm font-medium text-gray-900">No items found</h2>
            <p className="mt-1 text-xs text-gray-500">
              {debouncedSearchTerm || selectedCategory !== "all"
                ? "Try different search terms"
                : "No items available yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Use Virtual Grid for better performance */}
            <VirtualizedGrid 
              items={filteredItems}
              renderItem={renderItem}
            />

            {/* Lazy-loaded Pagination */}
            {pagination.totalPages > 1 && (
              <LazyPagination 
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}