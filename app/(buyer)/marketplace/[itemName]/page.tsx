"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CartItem, useCart } from "@/context/CartContext";
import { Recycle, Leaf, Package, Minus, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";

interface Item {
  _id: string;
  name: string;
  points: number;
  price: number;
  measurement_unit: number;
  image: string;
  categoryName: string;
  quantity: number;
  description?: string;
  categoryId?: string;
}

export default function ItemDetailsPage() {
  const { itemName } = useParams();
  const decodedName = typeof itemName === "string" ? decodeURIComponent(itemName) : "";
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart } = useCart();
  const { t } = useLanguage();

  // Use the same data fetching approach as marketplace
  const fetchAllItems = async () => {
    // Fetch multiple pages to get all items
    const allItems: Item[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await api.get(`/categories/get-items?page=${currentPage}&limit=50`);
      const items = res?.data?.data || [];
      allItems.push(...items);
      
      // Check if there are more pages
      hasMore = res?.data?.pagination?.hasNextPage || false;
      currentPage++;
    }

    return allItems;
  };

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["all-items"],
    queryFn: fetchAllItems,
  });

  // Debug logging
  console.log("Decoded name:", decodedName);
  console.log("Available items:", items.map(i => `"${i.name}"`));
  
  // Find the item with multiple matching strategies
  const item = items.find((i: Item) => {
    // Exact match (case-insensitive)
    if (i.name.toLowerCase() === decodedName.toLowerCase()) return true;
    
    // Try matching with trimmed spaces
    if (i.name.toLowerCase().trim() === decodedName.toLowerCase().trim()) return true;
    
    // Try matching without spaces
    if (i.name.toLowerCase().replace(/\s+/g, '') === decodedName.toLowerCase().replace(/\s+/g, '')) return true;
    
    return false;
  }) ?? null;

  const getMeasurementText = (unit: 1 | 2): string => {
    return unit === 1 ? t('common.unitKg', { defaultValue: ' kg' }) : t('common.unitPiece', { defaultValue: ' item' });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Error loading item</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  // Show not found state with debugging info
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-800">Item not found</h2>
          <p className="text-gray-600 mb-4">The item "{decodedName}" could not be found.</p>
          
          {/* Debug info */}
          <details className="text-left text-sm text-gray-500 bg-gray-50 p-4 rounded mb-4">
            <summary className="cursor-pointer font-medium">Debug Info (Click to expand)</summary>
            <div className="mt-2">
              <p><strong>Looking for:</strong> "{decodedName}"</p>
              <p><strong>Total items found:</strong> {items.length}</p>
              <p><strong>Available items:</strong></p>
              <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                {items.map((i, idx) => (
                  <li key={idx}>
                    "{i.name}" (Category: {i.categoryName})
                  </li>
                ))}
              </ul>
              
              {/* Search for items containing "tea" or "pot" */}
              <div className="mt-4">
                <p><strong>Items containing "tea" or "pot":</strong></p>
                <ul className="list-disc list-inside">
                  {items
                    .filter(i => 
                      i.name.toLowerCase().includes('tea') || 
                      i.name.toLowerCase().includes('pot')
                    )
                    .map((i, idx) => (
                      <li key={idx}>"{i.name}" (Category: {i.categoryName})</li>
                    ))
                  }
                </ul>
                {items.filter(i => 
                  i.name.toLowerCase().includes('tea') || 
                  i.name.toLowerCase().includes('pot')
                ).length === 0 && (
                  <p className="text-red-600">No items found containing "tea" or "pot"</p>
                )}
              </div>
            </div>
          </details>
          
          <div className="space-x-4">
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  function convertToCartItem(item: Item, quantity: number): CartItem {
    return {
      categoryId: item.categoryId || '',
      categoryName: item.categoryName,
      itemName: item.name,
      image: item.image,
      points: item.points,
      price: item.price,
      measurement_unit: item.measurement_unit,
      quantity,
    };
  }

  const remainingQuantity = (item?.quantity || 0) - selectedQuantity;
  const isLowStock = (item?.quantity || 0) <= 5;
  const isOutOfStock = (item?.quantity || 0) <= 0;
  const stockPercentage = Math.min(100, (remainingQuantity / (item?.quantity || 1)) * 100);

  const handleAddToCart = () => {
    if (!isOutOfStock && remainingQuantity >= 0) {
      addToCart(convertToCartItem(item, selectedQuantity));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden shadow-sm">
              <Image
                src={item?.image}
                alt={item?.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category and Title */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-3">
                {t(`categories.${item?.categoryName}`, { defaultValue: item?.categoryName })}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">
                {t(`categories.subcategories.${decodedName.toLowerCase().replace(/\s+/g, "-")}`, { defaultValue: item.name })}
              </h1>
              {item?.description && (
                <p className="text-gray-600 mt-2">{item?.description}</p>
              )}
            </div>

            {/* Price and Points */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900">${(item?.price * selectedQuantity).toFixed(2)}</span>
            </div>

            {/* Stock Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{t('common.availableStock', { defaultValue: 'Available Stock' })}</span>
                <span className={`text-sm font-medium ${
                  isOutOfStock ? 'text-red-600' : 
                  isLowStock ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : `${item?.quantity || 0} ${getMeasurementText(item.measurement_unit)}`}
                </span>
              </div>
              
              {/* Dynamic Stock Indicator */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stockPercentage < 20 ? 'bg-red-500' : 
                      stockPercentage < 50 ? 'bg-amber-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {t('common.afterPurchase', { 
                      quantity: Math.max(0, remainingQuantity), 
                      unit: getMeasurementText(item.measurement_unit) 
                    })}
                  </span>
                  <span>{t('common.percentageRemaining', { percentage: stockPercentage.toFixed(0) })}</span>
                </div>
              </div>
              {isLowStock && !isOutOfStock && (
                <p className="text-xs text-amber-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Low stock - only {item.quantity} {getMeasurementText(item.measurement_unit)} left!
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('common.quantity')}</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                  disabled={selectedQuantity <= 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity(prev => prev + 1)}
                  disabled={selectedQuantity >= (item.quantity || 0)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">{getMeasurementText(item.measurement_unit)}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>{isOutOfStock ? t('common.outOfStock') : t('common.addToRecyclingCart')}</span>
            </button>

            {/* Environmental Benefits */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Leaf className="w-5 h-5 mr-2 text-green-600" />
                {t('environmentalBenefit.environmentalBenefits')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t('environmentalBenefit.reducesCO2Emissions', { amount: (selectedQuantity * 2.5).toFixed(1) })}
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t('environmentalBenefit.savesWater', { amount: selectedQuantity * 15 })}
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t('environmentalBenefit.conservesNaturalResources')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}