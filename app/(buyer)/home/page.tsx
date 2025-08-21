"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PromotionSlider from "@/components/buyer/PromotionSlider";
import { ChevronRight, Frown, Leaf, Zap, Recycle, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

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

// Generate a proper blur placeholder that matches your image aspect ratio
const generateBlurDataURL = (w: number, h: number) => {
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f0f0f0" offset="20%" />
          <stop stop-color="#e0e0e0" offset="50%" />
          <stop stop-color="#f0f0f0" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f0f0f0" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`;
  
  const buffer = Buffer.from(shimmer(w, h));
  return `data:image/svg+xml;base64,${buffer.toString('base64')}`;
};

const BLUR_DATA = generateBlurDataURL(200, 200);

export default function BuyerHomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("buyer");

  const { locale, t, convertNumber } = useLanguage();

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

  // API calls
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/categories/get-items?page=1&limit=8&role=buyer`);
      const data = response.data;
      setItems(data.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    setMaterialsLoading(true);
    try {
      const response = await api.get('/top-materials-recycled');
      const data = response.data;

      const formattedMaterials = data.data.map((item: any) => ({
        name: item.name,
        image: item.image,
        totalRecycled: item.totalQuantity,
        totalPoints: item.totalPoints,
        unit: item.unit
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setMaterialsLoading(false);
    }
  }, []);

  // Memoize filtered items
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch = item.name[locale]?.toLowerCase().includes(term) || 
                           item.categoryName[locale]?.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === "all" || item.categoryName[locale] === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items: in-stock items first, then out-of-stock
    return filtered.sort((a, b) => {
      if ((a.quantity > 0 && b.quantity > 0) || (a.quantity === 0 && b.quantity === 0)) {
        return 0;
      }
      if (a.quantity > 0 && b.quantity === 0) {
        return -1;
      }
      return 1;
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

  // Data fetching with cleanup
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      fetchItems();
    }
    
    return () => {
      isMounted = false;
    };
  }, [fetchItems]);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      fetchMaterials();
    }
    
    return () => {
      isMounted = false;
    };
  }, [fetchMaterials]);

  // Item card component with optimized image handling
  const ItemCard = useCallback(({ item }: { item: Item }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const handleImageError = () => {
      setImageError(true);
    };
    
    const handleImageLoad = () => {
      setImageLoaded(true);
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        className="relative"
      >
        <Link href={`/marketplace/${encodeURIComponent(item.name.en)}`} passHref>
          <div className={`bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-sm h-full relative ${
            item.quantity === 0 ? 'opacity-75' : ''
          }`}>
            
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

            <div className="relative aspect-square w-full mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center">
              {item.image && !imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                  )}
                  <Image
                    src={item.image}
                    alt={item.name[locale] || item.name.en || 'Product image'}
                    width={200}
                    height={200}
                    className={`w-full h-full object-contain p-3 transition-opacity duration-300 ${
                      item.quantity === 0 ? 'grayscale' : ''
                    } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </>
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
      </motion.div>
    );
  }, [locale, getMeasurementText, getStockColor, formatQuantity, convertNumber, t]);

  // Material card component with optimized image handling
  const MaterialCard = useCallback(({ material, index }: { material: Material, index: number }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const handleImageError = () => {
      setImageError(true);
    };
    
    const handleImageLoad = () => {
      setImageLoaded(true);
    };
    
    return (
      <Link key={index} href={`/marketplace/${encodeURIComponent(material.name.en)}`} passHref>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-sm">
            <div className="relative aspect-square w-full mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center">
              {material.image && !imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                  )}
                  <Image
                    src={material.image}
                    alt={material.name[locale] || material.name.en || 'Recycled material'}
                    width={200}
                    height={200}
                    className={`w-full h-full object-contain p-3 transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </>
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
              <span className="text-sm text-gray-600">
                <span className="text-sm text-gray-600 font-bold">{convertNumber(material.totalRecycled)}</span>
                {material.unit == "pieces" ? t('common.piece') : t('common.kg')} {t('common.sold')}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }, [locale, convertNumber, t]);

  return (
    <div className="dark:bg-black-200 min-h-screen">
      <div className="container mx-auto px-4 py-8 dark:bg-black-200">
        {/* Items Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-44 animate-pulse"></div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 bg-white rounded-lg shadow-sm max-w-2xl mx-auto border border-gray-100"
            >
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
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {filteredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Recycling Banner */}
        <section className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl overflow-hidden mb-12">
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 12 + 4}px`,
                }}
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: Math.random() * 6 + 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Recycle />
              </motion.div>
            ))}
          </div>

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
                  <motion.div 
                    key={i}
                    whileHover={{ y: -2 }}
                    className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20"
                  >
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <h3 className="text-lg font-bold text-white text-center">{stat.value}</h3>
                    <p className="text-emerald-100 text-xs text-center">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top Materials Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{t('charts.topRecycledMaterials')}</h2>
          </div>

          {materialsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-44 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {materials.map((material, index) => (
                <MaterialCard key={`${material.name.en}-${index}`} material={material} index={index} />
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