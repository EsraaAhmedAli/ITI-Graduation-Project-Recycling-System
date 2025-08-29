"use client";

import { useEffect, useState, useMemo, useCallback, memo, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, Frown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { Badge } from "flowbite-react";
import { useGetItems } from "@/hooks/useGetItems";
import { useItemSocket } from "@/hooks/useItemSocket";
import LazyPagination from "@/components/common/lazyPagination";
import dynamic from "next/dynamic";

// Lazy load non-critical components
const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton'),
  { 
    ssr: false,
    loading: () => null
  }
);

const preconnectOrigins = () => {
  if (typeof document === 'undefined') return;
  
  const origins = [
    'https://res.cloudinary.com',
  ];
  
  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

const normalizeArabicText = (text: string): string => {
  if (!text) return text;
  
  return text
    .replace(/[آأإا]/g, 'ا')
    .replace(/[ؤئء]/g, 'ء')
    .replace(/[يى]/g, 'ي')
    .replace(/[هة]/g, 'ه')
    .replace(/[ًٌٍَُِّْٰ]/g, '')
    .replace(/ة/g, 'ه');
};

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

// Fixed grid configuration for consistent layouts
const GRID_CONFIG = {
  itemHeight: 280, // Increased and fixed height
  gap: 12, // Fixed gap
  containerPadding: 16,
  overscan: 2, // Reduced overscan to prevent excessive DOM nodes
};

const getColumnsForViewport = (width: number): number => {
  if (width >= 1280) return 6; // xl
  if (width >= 1024) return 5;  // lg
  if (width >= 768) return 4;   // md
  if (width >= 640) return 3;   // sm
  return 2; // mobile
};

const preloadCriticalImages = (items: Item[]) => {
  if (typeof window === 'undefined') return;
  
  const preloadImage = (src: string) => {
    if (document.querySelector(`link[href="${src}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      items.slice(0, 4).forEach((item) => {
        preloadImage(getOptimizedImageUrl(item.image, 280));
      });
    }, { timeout: 500 });
  } else {
    setTimeout(() => {
      items.slice(0, 4).forEach((item) => {
        preloadImage(getOptimizedImageUrl(item.image, 280));
      });
    }, 100);
  }
};

const markThatFromMarketPlace = (userRole: string) => {
  if (userRole === 'buyer') {
    // If user is buyer, remove the marketplace flag if it exists
    if (localStorage.getItem('fromMarketPlace') === 'true') {
      localStorage.removeItem('fromMarketPlace');
    }
  } else {
    // For non-buyers, set the marketplace flag
    localStorage.setItem('fromMarketPlace', 'true');
  }
}

const createEnhancedSearch = (searchTerm: string, text: { en: string; ar: string }): boolean => {
  if (!searchTerm || !searchTerm.trim()) return true;
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  const normalizedArabicSearchTerm = normalizeArabicText(normalizedSearchTerm);
  
  const englishMatch = text.en.toLowerCase().includes(normalizedSearchTerm);
  const arabicMatch = text.ar.toLowerCase().includes(normalizedSearchTerm);
  const normalizedArabicMatch = normalizeArabicText(text.ar.toLowerCase()).includes(normalizedArabicSearchTerm);
  
  const englishInArabic = !/[\u0600-\u06FF]/.test(searchTerm) ? 
    normalizeArabicText(text.ar.toLowerCase()).includes(normalizedSearchTerm) : false;
  
  const arabicInEnglish = /[\u0600-\u06FF]/.test(searchTerm) ?
    text.en.toLowerCase().includes(normalizedSearchTerm) : false;
  
  return englishMatch || arabicMatch || normalizedArabicMatch || englishInArabic || arabicInEnglish;
};

const getOptimizedImageUrl = (url: string, width: number = 300) => {
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", `/upload/c_fit,w_${width},q_auto,f_auto,dpr_auto/`);
  }
  return url;
};

const generateBlurDataURL = (width: number = 280, height: number = 280) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Improved image component with better loading states
const OptimizedItemImage = memo(({
  item,
  priority = false,
}: {
  item: Item;
  priority?: boolean;
  index?: number;
}) => {
  const optimizedSrc = useMemo(() => getOptimizedImageUrl(item.image, 280), [item.image]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px', // Reduced from 100px to prevent excessive preloading
        threshold: 0.1 
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={imgRef} className="relative aspect-square bg-slate-50 overflow-hidden rounded-t-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />
      
      {isInView && (
        <Image
          src={optimizedSrc}
          alt={item.name.en}
          fill
          className={`object-contain p-2 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 640px) 150px, (max-width: 768px) 120px, (max-width: 1024px) 180px, 200px"
          priority={priority}
          quality={priority ? 85 : 70}
          placeholder="blur"
          blurDataURL={generateBlurDataURL()}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setImageLoaded(true)}
          style={{ backgroundColor: '#f8fafc' }}
        />
      )}
      
      {!imageLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

OptimizedItemImage.displayName = 'OptimizedItemImage';

// Fixed height item card to prevent layout shifts
const ItemCard = memo(({ 
  item, 
  index, 
  locale, 
  convertNumber, 
  t, 
  getMeasurementText ,
    isFetching = false, // Add this parameter
      user // Add this parameter
}: {
  item: Item;
  index: number;
  locale: string;
  convertNumber: (num: number) => string;
  t: (key: string) => string;
  getMeasurementText: (unit: 1 | 2) => string;
    isFetching?: boolean; // Add this type
      user?: any; // Add this type
}) => {
  return (
    <article 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-150 flex flex-col"
      style={{ height: `${GRID_CONFIG.itemHeight}px` }} // Fixed height
    >
      <Link
onClick={() => markThatFromMarketPlace(user?.role || '')}       href={`/marketplace/${encodeURIComponent(item.name.en)}`}
        className="h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
        prefetch={index < 2}
      >
        <div className="flex-1">
          <OptimizedItemImage
            item={item}
            priority={index < 4}
            index={index}
          />
        </div>

        <div className="p-3 flex flex-col gap-2 h-24"> {/* Fixed height for content */}
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide leading-tight line-clamp-2 min-h-[2.5rem]">
            {item.name[locale]}
          </h3>
          
        <div className="flex justify-between items-center">
  {isFetching ? (
    <div className="flex items-center space-x-1">
      <div className="animate-spin rounded-full h-3 w-3 border border-green-600 border-t-transparent"></div>
      <span className="text-xs text-gray-400">...</span>
    </div>
  ) : (
    <span className="text-xs font-bold text-green-600">
      {convertNumber(item.price)} {t("itemsModal.currency")}
    </span>
  )}
  
  <span className="text-xs font-bold">
    {item?.quantity === 0 ? (
      <Badge color="failure" size="sm">{t('common.outOfStock')}</Badge>
    ) : (
      `${convertNumber(item.quantity)} ${t('common.inStock')}`
    )}
  </span>
</div>
          
          <div className="text-[0.6rem] text-gray-500 text-right">
            {getMeasurementText(item.measurement_unit)}
          </div>
        </div>
      </Link>
    </article>
  );
});

ItemCard.displayName = 'ItemCard';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Simplified grid without complex virtualization
const SimpleGrid = memo(({ 
  items, 
  renderItem 
}: { 
  items: Item[];
  renderItem: (item: Item, index: number) => React.ReactNode;
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map((item, index) => (
        <div key={item._id}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
});

SimpleGrid.displayName = 'SimpleGrid';

export default function MarketplaceClient({ initialData }: MarketplaceClientProps) {
  const { t, locale, convertNumber } = useLanguage();
  const { user } = useUserAuth();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [priceLoading, setPriceLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState(initialData.items);
  const [pagination, setPagination] = useState(initialData.pagination);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const getMeasurementText = useCallback(
    (unit: 1 | 2): string => {
      return unit === 1 ? t("itemsModal.perKg") : t("itemsModal.perItem");
    },
    [t]
  );

  useEffect(() => {
    preconnectOrigins();
    
    startTransition(() => {
      setIsClient(true);
    });
    
    setTimeout(() => {
      preloadCriticalImages(initialData.items);
    }, 0);
    
    queryClient.setQueryData(["items", 1, null], {
      data: initialData.items,
      pagination: initialData.pagination,
    });
  }, [initialData, queryClient]);

  const { data, isLoading,isFetching } = useGetItems({
    currentPage,
    itemsPerPage: 18, // Increased items per page for better performance
    userRole: 'buyer',
    category: selectedCategory,
    search: debouncedSearchTerm,
  });

  useItemSocket({
    currentPage,
    itemsPerPage: 20,
    userRole: user?.role,
    selectedCategory,
    searchTerm: debouncedSearchTerm,
    enabled: isClient,
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

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", user?.role],
    queryFn: async () => {
      if (!isClient) return initialData.categories;
      const res = await api.get(`/categories/get-items?page=1&limit=50&role=${user?.role || ""}`);
      const allItems = res?.data.data || [];
      return [...new Set(allItems.map((item: Item) => item.categoryName.en))].sort();
    },
    initialData: initialData.categories,
    staleTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: isClient,
  });

  const uniqueCategories = categoriesData || initialData.categories;

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm && selectedCategory === "all") {
      return items;
    }

    return items.filter((item) => {
      if (debouncedSearchTerm) {
        const matchesItemName = createEnhancedSearch(debouncedSearchTerm, item.name);
        const matchesCategoryName = createEnhancedSearch(debouncedSearchTerm, item.categoryName);
        
        if (!matchesItemName && !matchesCategoryName) {
          return false;
        }
      }
      
      if (selectedCategory !== "all") {
        const matchesCategory = item.categoryName.en === selectedCategory;
        if (!matchesCategory) return false;
      }
      
      return true;
    });
  }, [debouncedSearchTerm, selectedCategory, items]);

  const sortedFilteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return filteredItems;
    
    const searchTerm = debouncedSearchTerm.toLowerCase().trim();
    const normalizedSearchTerm = normalizeArabicText(searchTerm);
    
    return [...filteredItems].sort((a, b) => {
      const getSearchScore = (item: Item): number => {
        let score = 0;
        
        if (item.name.en.toLowerCase() === searchTerm || item.name.ar.toLowerCase() === searchTerm) {
          score += 100;
        }
        
        if (normalizeArabicText(item.name.ar.toLowerCase()) === normalizedSearchTerm) {
          score += 90;
        }
        
        if (item.name.en.toLowerCase().startsWith(searchTerm) || 
            item.name.ar.toLowerCase().startsWith(searchTerm) ||
            normalizeArabicText(item.name.ar.toLowerCase()).startsWith(normalizedSearchTerm)) {
          score += 50;
        }
        
        if (createEnhancedSearch(debouncedSearchTerm, item.categoryName)) {
          score += 25;
        }
        
        if (score === 0) score = 10;
        
        return score;
      };
      
      const scoreA = getSearchScore(a);
      const scoreB = getSearchScore(b);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      return a.name[locale].localeCompare(b.name[locale]);
    });
  }, [filteredItems, debouncedSearchTerm, locale]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        startTransition(() => {
          setCurrentPage(page);
       
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [pagination.totalPages]
  );

  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    startTransition(() => {
      setSelectedCategory(value);
    });
  }, []);

  const renderItem = useCallback((item: Item, index: number) => (
    <ItemCard
      item={item}
      index={index}
      locale={locale}
      convertNumber={convertNumber}
      t={t}
      getMeasurementText={getMeasurementText}
          isFetching={isFetching} // Add this line
              user={user} // Add this line
    />
  ), [locale, convertNumber, t, getMeasurementText,isFetching]);

  const LoadingSkeleton = memo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="bg-slate-50 rounded-lg animate-pulse border border-gray-200"
          style={{ height: `${GRID_CONFIG.itemHeight}px` }}
        />
      ))}
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header to prevent layout shifts */}
      <section className="mb-4 rounded-lg shadow-sm p-3 sticky top-0 z-10 bg-white border-b">
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
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg w-full appearance-none bg-white focus:ring-1 focus:ring-green-500 focus:outline-none"
              onChange={(e) => handleCategoryChange(e.target.value)}
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
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-xs text-gray-500">
          {t("common.showing")} {convertNumber(sortedFilteredItems.length)} {t("common.of")} {convertNumber(pagination.totalItems)} {t("common.items")}
        </span>
        <span className="text-xs text-gray-500">
          {t("common.page")} {convertNumber(pagination.currentPage)} {t("common.of")} {convertNumber(pagination.totalPages)}
        </span>
      </div>

      {/* Main Content */}
      <main className="pb-20"> {/* Added bottom padding for floating button */}
        {isLoading && !items.length ? (
          <LoadingSkeleton />
        ) : sortedFilteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Frown className="mx-auto h-10 w-10 text-gray-400"/>
            <h2 className="mt-2 text-sm font-medium text-gray-900">
              {t("common.noItemsFound") || "No items found"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {debouncedSearchTerm || selectedCategory !== "all"
                ? t("common.tryDifferentSearch") || "Try different search terms or check spelling"
                : t("common.noItemsAvailable") || "No items available yet"}
            </p>
            {debouncedSearchTerm && (
              <p className="mt-1 text-xs text-gray-400">
                {t("common.crossLanguageHint") || "Search works across Arabic and English languages"}
              </p>
            )}
          </div>
        ) : (
          <>
            <SimpleGrid 
              items={sortedFilteredItems}
              renderItem={renderItem}
            />

            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <LazyPagination 
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </main>
      
      <FloatingRecorderButton />
    </div>
  );
}