"use client";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import PromotionSlider from "@/components/buyer/PromotionSlider";
import { ChevronRight, Frown, Leaf, Zap, Recycle, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";
import { useUserAuth } from "@/context/AuthFormContext";

// Lazy load FloatingRecorderButton for voice processing
const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton'),
  { ssr: false }
);

interface Item {
  _id: string;
  name: string;
  price: number;
  measurement_unit: number;
  image: string;
  categoryName: string;
  quantity: number;
}

interface Material {
  name: string;
  image: string;
  totalRecycled: number;
  totalPoints: number;
  unit: string;
}

// Optimized blur placeholder - simpler version
const BLUR_DATA = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+";

const markThatFromMarketPlace = (userRole: string) => {
  console.log('markThatFromMarketPlace called with role:', userRole); // Debug log
  if (userRole === 'buyer') {
    // If user is buyer, remove the marketplace flag if it exists
    if (localStorage.getItem('fromMarketPlace') === 'true') {
      localStorage.removeItem('fromMarketPlace');
      console.log('Removed fromMarketPlace from localStorage'); // Debug log
    }
  } else {
    // For non-buyers, set the marketplace flag
    localStorage.setItem('fromMarketPlace', 'true');
    console.log('Set fromMarketPlace in localStorage'); // Debug log
  }
}

// Memoized ItemCard component - FIXED parameter order
const ItemCard = memo(({ item, user, locale, getMeasurementText, getStockColor, formatQuantity, convertNumber, t }: {
  item: Item;
  user: { role: string } | null;
  locale: string;
  getMeasurementText: (unit: number) => string;
  getStockColor: (quantity: number) => string;
  formatQuantity: (quantity: number, unit: number) => string;
  convertNumber: (num: number) => string;
  t: (key: string) => string;
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => setImageError(true), []);

  return (
    <div className="relative">
      <Link onClick={() => markThatFromMarketPlace(user?.role || '')} href={`/marketplace/${encodeURIComponent(item.name.en)}`} passHref>
        <div style={{ background: "var(--color-card-home)" }} className={`bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-colors duration-200 h-full relative ${item.quantity === 0 ? 'opacity-75' : ''}`}>

          {/* Stock badges */}
          {item.quantity === 0 && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                {t('common.outOfStock')}
              </div>
            </div>
          )}

          {item.quantity > 0 && item.quantity < 10 && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                {t('cart.item.lowStock')}
              </div>
            </div>
          )}

          <div style={{ backgroundColor: item.image ? 'var(--color-image)' : 'var(--color-card)' }} className="relative aspect-square w-full mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center">
            {item.image && !imageError ? (
              <Image
                src={item.image}
                alt={item.name[locale] || item.name.en || 'Product image'}
                width={200}
                height={200}
                className={`w-full h-full object-contain p-3 ${item.quantity === 0 ? 'grayscale' : ''}`}
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA}
                onError={handleImageError}
              />
            ) : (
              <div className={`text-gray-300 ${item.quantity === 0 ? 'opacity-50' : ''}`}>
                <Recycle className="h-10 w-10" />
              </div>
            )}
          </div>

          <h3 className="text-base font-medium text-gray-800 truncate mb-2">
            {item.name[locale] || item.name.en}
          </h3>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-emerald-600">
                {convertNumber(item.price)} {t('itemsModal.currency')}
              </span>
              <span className="text-xs text-emerald-600">
                /{getMeasurementText(item.measurement_unit)}
              </span>
            </div>

            <div className={`text-xs font-medium ${getStockColor(item.quantity)}`}>
              {formatQuantity(item.quantity, item.measurement_unit)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

ItemCard.displayName = 'ItemCard';

// Memoized MaterialCard component - FIXED parameter order
const MaterialCard = memo(({ material, index, locale, user, convertNumber, t }: {
  material: Material;
  index: number;
  locale: string;
  user: { role: string } | null;
  convertNumber: (num: number) => string;
  t: (key: string) => string;
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => setImageError(true), []);

  return (
    <Link onClick={() => markThatFromMarketPlace(user?.role || '')} style={{ background: "var(--color-card-home)" }} key={index} href={`/marketplace/${encodeURIComponent(material.name.en)}`} passHref>
      <div style={{ backgroundColor: 'var(--color-card)' }} className="rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-colors duration-200">
        <div style={{ backgroundColor: 'var(--color-image)' }} className="relative aspect-square w-full mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center">
          {material.image && !imageError ? (
            <Image
              src={material.image}
              alt={material.name[locale] || material.name.en || 'Recycled material'}
              width={200}
              height={200}
              className="w-full h-full object-contain p-3"
              loading="lazy"
              placeholder="blur"
              blurDataURL={BLUR_DATA}
              onError={handleImageError}
            />
          ) : (
            <div className="text-gray-300">
              <Recycle className="h-10 w-10" />
            </div>
          )}
        </div>
        <h3 className="text-base font-medium text-gray-800 truncate mb-1">
          {material.name[locale] || material.name.en}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{color:"var(--text-gray-700)"}}>
            <span className="text-sm font-bold" style={{color:"var(--text-gray-700)"}}>{convertNumber(material.totalRecycled)}</span>
            {material.unit === "pieces" ? t('common.piece') : t('common.kg')} {t('common.sold')}
          </span>
        </div>
      </div>
    </Link>
  );
});

MaterialCard.displayName = 'MaterialCard';

// Memoized LoadingSkeleton component
const LoadingSkeleton = memo(({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="bg-gray-100 rounded-xl h-44 animate-pulse"></div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized EmptyState component
const EmptyState = memo(({ resetFilters, t }: { resetFilters: () => void; t: (key: string) => string }) => (
  <div className="text-center py-8 bg-white rounded-lg shadow-sm max-w-2xl mx-auto border border-gray-100">
    <Frown className="mx-auto h-10 w-10 text-gray-400 mb-3" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('common.noItemsFound')}</h3>
    <p className="text-gray-500 mb-4 text-sm">{t('common.tryAdjustingSearch')}</p>
    <button
      aria-label="reset filters"
      onClick={resetFilters}
      className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm transition-colors"
    >
      {t('common.resetFilters')}
    </button>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Memoized RecyclingBanner component
const RecyclingBanner = memo(({ statsData, t }: { statsData: Array<any>; t: (key: string) => string }) => (
  <section className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl overflow-hidden mb-12">
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-start lg:w-1/2">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            <span className="inline-block bg-white/20 px-2 py-1 rounded-full text-emerald-100 text-xs mb-2">
              X Change
            </span>
            <br />
            {t('recyclingBanner.title').split(t('recyclingBanner.titleHighlight')).map((part, index, array) => {
              if (index === array.length - 1) {
                return <span key={index}>{part}</span>;
              }
              return (
                <span key={index}>
                  {part}
                  <span className="text-yellow-300">{t('recyclingBanner.titleHighlight')}</span>
                </span>
              );
            })}
          </h2>
          <p className="text-sm text-emerald-100 mb-4 max-w-md mx-auto lg:mx-0">
            {t('recyclingBanner.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:w-1/2 max-w-xs">
          {statsData.map((stat, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <h3 className="text-lg font-bold text-white text-center">{stat.value}</h3>
              <p className="text-emerald-100 text-xs text-center">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
));

RecyclingBanner.displayName = 'RecyclingBanner';

export default function BuyerHomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("buyer");

  const { locale, t, convertNumber } = useLanguage();
  const { user } = useUserAuth();

  // Debug user state
  useEffect(() => {
    console.log('User from context:', user);
  }, [user]);

  // Memoize utility functions
  const getMeasurementText = useCallback((unit: number) => {
    return unit === 1 ? `${t('common.kg')}` : `${t('common.piece')}`;
  }, [t]);

  const formatQuantity = useCallback((quantity: number, unit: number) => {
    if (quantity === 0) return t('common.outOfStock');

    const unitText = getMeasurementText(unit);
    if (quantity < 10) {
      return `${t('common.only')} ${convertNumber(quantity)} ${unitText} ${t('common.left')}`;
    }
    return `${convertNumber(quantity)} ${unitText} ${t('common.inStock')}`;
  }, [getMeasurementText, convertNumber, t]);

  const getStockColor = useCallback((quantity: number) => {
    if (quantity === 0) return "text-red-600";
    if (quantity < 10) return "text-orange-600";
    return "text-emerald-600";
  }, []);

  // API calls with AbortController for cleanup
  const fetchItems = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/categories/get-items?page=1&limit=8&role=buyer`, { signal });
      const data = response.data;
      if (!signal?.aborted) {
        setItems(data.data);
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error("Error fetching items:", error);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchMaterials = useCallback(async (signal?: AbortSignal) => {
    setMaterialsLoading(true);
    try {
      const response = await api.get('/top-materials-recycled', { signal });
      const data = response.data;

      if (!signal?.aborted) {
        const formattedMaterials = data.data.map((item: any) => ({
          name: item.name,
          image: item.image,
          totalRecycled: item.totalQuantity,
          totalPoints: item.totalPoints,
          unit: item.unit
        }));

        setMaterials(formattedMaterials);
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error("Error fetching materials:", error);
      }
    } finally {
      if (!signal?.aborted) {
        setMaterialsLoading(false);
      }
    }
  }, []);

  // Memoize filtered items with better performance
  const filteredItems = useMemo(() => {
    if (!items.length) return [];
    
    const term = searchTerm.toLowerCase();
    
    return items
      .filter((item) => {
        const itemName = item.name[locale]?.toLowerCase() || item.name.en?.toLowerCase() || '';
        const categoryName = item.categoryName[locale]?.toLowerCase() || item.categoryName.en?.toLowerCase() || '';
        
        const matchesSearch = !term || itemName.includes(term) || categoryName.includes(term);
        const matchesCategory = selectedCategory === "all" || (item.categoryName[locale] || item.categoryName.en) === selectedCategory;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Sort by stock status first (in-stock items first)
        if (a.quantity > 0 && b.quantity === 0) return -1;
        if (a.quantity === 0 && b.quantity > 0) return 1;
        return 0;
      });
  }, [searchTerm, selectedCategory, items, locale]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
  }, []);

  const statsData = useMemo(() => [
    {
      icon: <Zap className="w-5 h-5 text-yellow-300" />,
      value: "1,250+",
      label: t('recyclingBanner.stats.dailyRecyclers')
    },
    {
      icon: <Recycle className="w-5 h-5 text-emerald-300" />,
      value: "5.2K",
      label: t('recyclingBanner.stats.itemsRecycled')
    },
    {
      icon: <Leaf className="w-5 h-5 text-green-300" />,
      value: "28K+",
      label: t('recyclingBanner.stats.co2Reduced')
    },
    {
      icon: <span className="text-base">♻️</span>,
      value: "100%",
      label: t('recyclingBanner.stats.ecoFriendly')
    }
  ], [t]);

  // User role effect
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem("checkoutData");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const role = parsed?.user?.role;
        setUserRole(role || "buyer");
      } else {
        setUserRole("buyer");
      }
    } catch (error) {
      console.error("Failed to parse session data:", error);
      setUserRole("buyer");
    }
  }, []);

  // Data fetching effects with cleanup
  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);
    
    return () => controller.abort();
  }, [fetchItems]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMaterials(controller.signal);
    
    return () => controller.abort();
  }, [fetchMaterials]);

  return (
    <div className="dark:bg-black-200 min-h-screen ">
      <PromotionSlider t={t}  locale={locale}/>
      <div className="container mx-auto px-4 py-8 dark:bg-black-200">
        <br/>
        
        {/* Items Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-gray-800)" }}>
              {selectedCategory === "all" ? `${t('common.FeaturedItems')}` : selectedCategory}
            </h2>
            <Link href="/marketplace" passHref>
              <button aria-label="view all items" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center text-sm transition-colors">
                {t('common.viewAll')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>

          {isLoading ? (
            <LoadingSkeleton count={8} />
          ) : filteredItems.length === 0 ? (
            <EmptyState resetFilters={resetFilters} t={t} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {filteredItems.map((item) => (
                <ItemCard 
                  key={item._id} 
                  item={item}
                  user={user}
                  locale={locale}
                  getMeasurementText={getMeasurementText}
                  getStockColor={getStockColor}
                  formatQuantity={formatQuantity}
                  convertNumber={convertNumber}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recycling Banner */}
        <RecyclingBanner statsData={statsData} t={t} />

        {/* Top Materials Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800" style={{color:"var(--text-gray-800)"}}>{t('charts.topRecycledMaterials')}</h2>
          </div>

          {materialsLoading ? (
            <LoadingSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5" style={{color:"var(--text-gray-700)"}}>
              {materials.map((material, index) => (
                <MaterialCard 
                  key={`${material.name.en}-${index}`} 
                  material={material} 
                  index={index} 
                  locale={locale}
                  user={user}
                  convertNumber={convertNumber}
                  t={t}
                />
              ))} 
            </div>
          )}
        </section>
        
        {/* Voice Processing Component */}
        <FloatingRecorderButton />
      </div>
    </div>
  );
}