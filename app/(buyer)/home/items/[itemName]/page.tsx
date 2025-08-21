"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { CartItem, useCart } from "@/context/CartContext";
import { Recycle, Leaf, Package, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { useCategories } from "@/hooks/useGetCategories";
import Loader from "@/components/common/loader";

interface Item {
  _id: string;
  name: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
  image: string;
  categoryName: string;
  categoryId: string;
  description?: string;
  quantity: number;
}

// Memoized components for better performance
const StockIndicator = ({ stockPercentage, remainingQuantity, measurementText, isLowStock, isOutOfStock, item, t }) => (
  <div className="pt-4 border-t border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">
        {t("common.availableStock", { defaultValue: "Available Stock" })}
      </span>
      <span className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-green-600"}`}>
        {isOutOfStock ? t("common.outOfStock", { defaultValue: "Out of Stock" }) : `${item?.quantity} ${measurementText}`}
      </span>
    </div>
    <div className="mb-2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${stockPercentage < 20 ? "bg-red-500" : stockPercentage < 50 ? "bg-amber-400" : "bg-green-500"}`}
          style={{ width: `${stockPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>
          {t("common.afterPurchase", {
            quantity: Math.max(0, remainingQuantity),
            unit: measurementText,
            defaultValue: `After purchase: ${Math.max(0, remainingQuantity)} ${measurementText} remaining`,
          })}
        </span>
        <span>
          {t("common.percentageRemaining", {
            percentage: stockPercentage.toFixed(0),
            defaultValue: `${stockPercentage.toFixed(0)}% remaining`,
          })}
        </span>
      </div>
    </div>
    {isLowStock && !isOutOfStock && (
      <p className="text-xs text-amber-600 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {t("common.lowStockWarning", {
          quantity: item.quantity,
          unit: measurementText,
          defaultValue: `Low stock - only ${item.quantity} ${measurementText} left!`,
        })}
      </p>
    )}
  </div>
);

const EnvironmentalBenefits = ({ selectedQuantity, t }) => (
  <div className="bg-gray-50 rounded-xl p-5 space-y-3">
    <h3 className="font-semibold text-gray-800 flex items-center">
      <Leaf className="w-5 h-5 mr-2 text-green-600" />
      {t("environmentalBenefit.environmentalBenefits")}
    </h3>
    <ul className="space-y-2 text-sm text-gray-600">
      <li className="flex items-start">
        <span className="text-green-600 mr-2">•</span>
        {t("environmentalBenefit.reducesCO2Emissions", {
          amount: (selectedQuantity * 2.5).toFixed(1),
        })}
      </li>
      <li className="flex items-start">
        <span className="text-green-600 mr-2">•</span>
        {t("environmentalBenefit.savesWater", {
          amount: selectedQuantity * 15,
        })}
      </li>
      <li className="flex items-start">
        <span className="text-green-600 mr-2">•</span>
        {t("environmentalBenefit.conservesNaturalResources")}
      </li>
    </ul>
  </div>
);

const RecyclingProcess = ({ t }) => {
  const steps = useMemo(() => [
    {
      icon: <Package className="w-6 h-6 text-green-600" />,
      title: t("recycleProcess.collection.title"),
      description: t("recycleProcess.collection.description"),
    },
    {
      icon: <Recycle className="w-6 h-6 text-green-600" />,
      title: t("recycleProcess.processing.title"),
      description: t("recycleProcess.processing.description"),
    },
    {
      icon: <Leaf className="w-6 h-6 text-green-600" />,
      title: t("recycleProcess.newLife.title"),
      description: t("recycleProcess.newLife.description"),
    },
  ], [t]);

  return (
    <div className="bg-gray-50 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t("recycleProcess.title")}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
              {step.icon}
            </div>
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ItemDetailsPage() {
  const { itemName } = useParams();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart, loadingItemId } = useCart();
  const { t } = useLanguage();
  const { user } = useUserAuth();
  const { getCategoryIdByItemName } = useCategories();

  // Memoize decoded name to prevent unnecessary recalculations
  const decodedName = useMemo(() => 
    typeof itemName === "string" ? decodeURIComponent(itemName) : "", 
    [itemName]
  );

  // Optimized fetch function with better error handling
  const fetchItemByName = useCallback(async () => {
    if (!decodedName) throw new Error("No item name provided");
    
    try {
      const res = await api.get("/categories/get-items", {
        params: { limit: 10000, role: "buyer" }
      });
      
      const allItems = res.data?.data || [];
      const foundItem = allItems.find(
        (item: any) => item.name.en.toLowerCase() === decodedName.toLowerCase()
      );

      if (!foundItem) {
        throw new Error("Item not found");
      }

      return foundItem;
    } catch (error) {
      console.error("Error fetching item:", error);
      throw error;
    }
  }, [decodedName]);

  const {
    data: item,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["item-details", decodedName],
    queryFn: fetchItemByName,
    enabled: !!decodedName,
    retry: 2, // Reduced from 3
    staleTime: 10 * 60 * 1000, // Increased to 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes cache
  });

  // Memoize expensive calculations
  const { 
    measurementText, 
    remainingQuantity, 
    isLowStock, 
    isOutOfStock, 
    stockPercentage,
    totalPrice,
    translatedItemName,
    categoryDisplayName
  } = useMemo(() => {
    if (!item) return {};
    
    const measurementText = item.measurement_unit === 1
      ? t("common.unitKg", { defaultValue: " kg" })
      : t("common.unitPiece", { defaultValue: " item" });
    
    const remainingQuantity = item.quantity - selectedQuantity;
    const isLowStock = item.quantity <= 5;
    const isOutOfStock = item.quantity <= 0;
    const stockPercentage = Math.min(100, (remainingQuantity / item.quantity) * 100);
    const totalPrice = (item.price * selectedQuantity).toFixed(2);
    
    const translatedItemName = t(
      `categories.subcategories.${decodedName.toLowerCase().replace(/\s+/g, "-")}`,
      { defaultValue: item.name }
    );
    
    const categoryDisplayName = t(`categories.${item.categoryName}`, {
      defaultValue: item.categoryName,
    });
    
    return {
      measurementText,
      remainingQuantity,
      isLowStock,
      isOutOfStock,
      stockPercentage,
      totalPrice,
      translatedItemName,
      categoryDisplayName
    };
  }, [item, selectedQuantity, t, decodedName]);

  // Memoize cart item conversion
  const convertToCartItem = useCallback((item: Item, quantity: number): CartItem => ({
    _id: item._id,
    categoryId: getCategoryIdByItemName(item.name),
    categoryName: item.categoryName,
    name: item.name,
    image: item.image,
    points: item.points,
    price: item.price,
    measurement_unit: item.measurement_unit,
    quantity,
  }), [getCategoryIdByItemName]);

  // Memoize event handlers
  const handleQuantityDecrease = useCallback(() => {
    setSelectedQuantity(prev => Math.max(1, prev - 1));
  }, []);

  const handleQuantityIncrease = useCallback(() => {
    setSelectedQuantity(prev => prev + 1);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (item) {
      addToCart(convertToCartItem(item, selectedQuantity));
    }
  }, [item, selectedQuantity, addToCart, convertToCartItem]);

  const handleGoBack = useCallback(() => {
    window.history.back();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("common.itemNotFound", { defaultValue: "Item Not Found" })}
          </h1>
          <p className="text-gray-600 mb-4">
            {t("common.couldNotFindItem", {
              name: decodedName,
              defaultValue: `We couldn't find an item with the name: ${decodedName}`,
            })}
          </p>
          <button
          aria-label="go back"
            onClick={handleGoBack}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            {t("common.goBack", { defaultValue: "Go Back" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden shadow-sm">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category and Title */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-3">
                {categoryDisplayName}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">
                {translatedItemName}
              </h1>
              {item.description && (
                <p className="text-gray-600 mt-2">{item.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {totalPrice} EGP
              </span>
            </div>

            {/* Stock Status */}
            <StockIndicator 
              stockPercentage={stockPercentage}
              remainingQuantity={remainingQuantity}
              measurementText={measurementText}
              isLowStock={isLowStock}
              isOutOfStock={isOutOfStock}
              item={item}
              t={t}
            />

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("common.quantity", { defaultValue: "Quantity" })}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  aria-label="Decrease quantity"
                  onClick={handleQuantityDecrease}
                  disabled={selectedQuantity <= 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">
                  {selectedQuantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={handleQuantityIncrease}
                  disabled={selectedQuantity >= item.quantity}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">
                  {measurementText}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              aria-label="add to cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock || loadingItemId === item._id}
              className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                isOutOfStock || loadingItemId === item._id
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
              }`}>
              {loadingItemId === item._id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Package className="w-5 h-5" />
              )}
              <span>
                {isOutOfStock
                  ? t("common.outOfStock", { defaultValue: "Out of Stock" })
                  : loadingItemId === item._id
                  ? "جاري الإضافة..."
                  : t("common.addToRecyclingCart", { defaultValue: "Add to Cart" })}
              </span>
            </button>

            {/* Environmental Benefits */}
            <EnvironmentalBenefits selectedQuantity={selectedQuantity} t={t} />
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-16 space-y-8">
          <RecyclingProcess t={t} />
        </div>
      </div>
    </div>
  );
}