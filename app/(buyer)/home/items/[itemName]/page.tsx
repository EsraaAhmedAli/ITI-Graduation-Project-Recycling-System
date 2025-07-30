"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { CartItem, useCart } from "@/context/CartContext";
import { Recycle, Leaf, Package, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";
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

export default function ItemDetailsPage() {
  const { itemName } = useParams();
  const decodedName = typeof itemName === "string" ? decodeURIComponent(itemName) : "";
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { user } = useUserAuth();

  console.log('🔍 Item Details Page loaded:', { 
    itemName, 
    decodedName,
    params: useParams()
  });

  // Fetch specific item by name using existing API (original prices only)
  const fetchItemByName = async () => {
    console.log('🔍 Fetching item by name:', decodedName);
    try {
      // Get original prices (NO userRole parameter)
      const res = await api.get('/categories/get-items?limit=10000&role=buyer');
      console.log('✅ Got all items with original prices, searching for:', decodedName);
      
      const allItems = res.data?.data || [];
      console.log('📊 Total items received:', allItems.length);
      
      // Find the item by name (case insensitive)
      const foundItem = allItems.find((item: any) => 
        item.name.toLowerCase() === decodedName.toLowerCase()
      );
      
      if (!foundItem) {
        console.log('❌ Item not found in results');
        throw new Error('Item not found');
      }
      
      console.log('✅ Item found with original price:', {
        name: foundItem.name,
        originalPrice: foundItem.price
      });
      
      return foundItem;
    } catch (error) {
      console.error('❌ Error fetching item:', error);
      throw error;
    }
  };

  const {
    data: item,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["item-details", decodedName],
    queryFn: fetchItemByName,
    enabled: !!decodedName,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('📊 Item Details Query State:', {
    item,
    isLoading,
    isError,
    error,
    decodedName
  });

  const getMeasurementText = (unit: 1 | 2): string => {
    return unit === 1 ? t('common.unitKg', { defaultValue: ' kg' }) : t('common.unitPiece', { defaultValue: ' item' });
  };

  // Show loading state
  if (isLoading) {
    return (
<Loader title="items"/>
    );
  }

  // Show error state
  if (isError || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('common.itemNotFound', { defaultValue: 'Item Not Found' })}</h1>
          <p className="text-gray-600 mb-4">
            {t('common.couldNotFindItem', { 
              name: decodedName,
              defaultValue: `We couldn't find an item with the name: ${decodedName}`
            })}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {t('common.goBack', { defaultValue: 'Go Back' })}
          </button>
        </div>
      </div>
    );
  }





  function convertToCartItem(item: Item, quantity: number): CartItem {
    return {
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      itemName: item.name,
      image: item.image,
      points: item.points,
      price: item.price,
      measurement_unit: item.measurement_unit,
      quantity,
    };
  }

  const remainingQuantity = item?.quantity - selectedQuantity;
  const isLowStock = item?.quantity <= 5;
  const isOutOfStock = item?.quantity <= 0;
  const stockPercentage = Math.min(100, (remainingQuantity / item?.quantity) * 100);

  const handleAddToCart = () => {
    if (!isOutOfStock && remainingQuantity >= 0) {
      console.log('🛒 Adding to cart:', { item: item.name, quantity: selectedQuantity });
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
                onError={() => console.error('🖼️ Image load error:', item?.image)}
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
                {t(`categories.subcategories.${decodedName.toLowerCase().replace(/\s+/g, "-")}`, { defaultValue: item?.name })}
              </h1>
              {item?.description && (
                <p className="text-gray-600 mt-2">{item?.description}</p>
              )}
            </div>

            {/* Price and Points */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {(item.price * selectedQuantity).toFixed(2)} EGP
              </span>
            </div>

            {/* Stock Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{t('common.availableStock', { defaultValue: 'Available Stock' })}</span>
                <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' :
                    isLowStock ? 'text-amber-600' : 'text-green-600'
                  }`}>
                  {isOutOfStock ? t('common.outOfStock', { defaultValue: 'Out of Stock' }) : `${item?.quantity} ${getMeasurementText(item.measurement_unit)}`}
                </span>
              </div>

              {/* Dynamic Stock Indicator */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stockPercentage < 20 ? 'bg-red-500' :
                        stockPercentage < 50 ? 'bg-amber-400' : 'bg-green-500'
                      }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {t('common.afterPurchase', {
                      quantity: Math.max(0, remainingQuantity),
                      unit: getMeasurementText(item.measurement_unit),
                      defaultValue: `After purchase: ${Math.max(0, remainingQuantity)} ${getMeasurementText(item.measurement_unit)} remaining`
                    })}
                  </span>
                  <span>{t('common.percentageRemaining', { percentage: stockPercentage.toFixed(0), defaultValue: `${stockPercentage.toFixed(0)}% remaining` })}</span>
                </div>
              </div>
              {isLowStock && !isOutOfStock && (
                <p className="text-xs text-amber-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {t('common.lowStockWarning', { 
                    quantity: item.quantity, 
                    unit: getMeasurementText(item.measurement_unit),
                    defaultValue: `Low stock - only ${item.quantity} ${getMeasurementText(item.measurement_unit)} left!`
                  })}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('common.quantity', { defaultValue: 'Quantity' })}</label>
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
                  disabled={selectedQuantity >= item.quantity}
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
              className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                }`}
            >
              <Package className="w-5 h-5" />
              <span>{isOutOfStock ? t('common.outOfStock', { defaultValue: 'Out of Stock' }) : t('common.addToRecyclingCart', { defaultValue: 'Add to Cart' })}</span>
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

        {/* Additional Product Info */}
        <div className="mt-16 space-y-8">
          {/* Recycling Process */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('recycleProcess.title')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Package className="w-6 h-6 text-green-600" />,
                  title: t('recycleProcess.collection.title'),
                  description: t('recycleProcess.collection.description')
                },
                {
                  icon: <Recycle className="w-6 h-6 text-green-600" />,
                  title: t('recycleProcess.processing.title'),
                  description: t('recycleProcess.processing.description')
                },
                {
                  icon: <Leaf className="w-6 h-6 text-green-600" />,
                  title: t('recycleProcess.newLife.title'),
                  description: t('recycleProcess.newLife.description')
                }
              ].map((step, index) => (
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
        </div>
      </div>
    </div>
  );
}