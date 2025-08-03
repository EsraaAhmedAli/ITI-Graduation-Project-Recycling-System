"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import { Recycle, Leaf, Package, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Loader from "@/components/common/loader";
import { useCategories } from "@/hooks/useGetCategories";
import { TextInput } from "flowbite-react";
import toast from "react-hot-toast";
import Button from "@/components/common/Button";

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
  const decodedName =
    typeof itemName === "string" ? decodeURIComponent(itemName) : "";
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [exceedsQuantity, setExceedsQuantity] = useState(false);
 
  const {
    addToCart,
    loadingItemId,
    cart,

  } = useCart();
  const { t } = useLanguage();
  const { getCategoryIdByItemName } = useCategories();

  console.log("🔍 Item Details Page loaded:", {
    itemName,
    decodedName,
    params: useParams(),
  });

  const fetchItemByName = async () => {
    try {
      const res = await api.get("/categories/get-items?limit=10000&role=buyer");
      const allItems = res.data?.data || [];

      const foundItem = allItems.find(
        (item: any) => item.name.toLowerCase() === decodedName.toLowerCase()
      );

      if (!foundItem) {
        throw new Error("Item not found");
      }

      return foundItem;
    } catch (error) {
      console.error("Error fetching item:", error);
      throw error;
    }
  };

  const {
    data: item,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["item-details", decodedName],
    queryFn: fetchItemByName,
    enabled: !!decodedName,
  });

  const getMeasurementText = (unit: 1 | 2): string => {
    return unit === 1
      ? t("common.unitKg")
      : t("common.unitPiece");
  };
 const currentCartItem = cart.find((cartItem) => cartItem._id === item?._id);
 const quantityInCart = currentCartItem ? currentCartItem.quantity : 0;


  // Calculate minimum quantity and validation
  const minQuantity = item?.measurement_unit === 1 ? 0.25 : 1;
  const isValidQuantity = selectedQuantity !== '' && selectedQuantity >= minQuantity && !exceedsQuantity;
const actualRemainingStock = item?.quantity - quantityInCart;
const stockPercentage = Math.max(
  0,
  Math.min(100, (actualRemainingStock / item?.quantity) * 100)
)
  // Initialize selectedQuantity when item is loaded and handle cart updates
  useEffect(() => {
    if (item) {
      // Check if item is already in cart
      const existing = cart.find(
        (cartItem) => cartItem.name.toLowerCase() === itemName?.toString().toLowerCase()
      );
      
      if (existing) {
        setSelectedQuantity(existing.quantity);
      } else {
        // Set minimum quantity based on measurement unit
        const initialQuantity = item.measurement_unit === 1 ? 0.25 : 1;
        setSelectedQuantity(initialQuantity);
      }
    }
  }, [item, itemName]); // Removed 'cart' from dependencies to prevent interference

  const handleChangeNumberInput = (e) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      setSelectedQuantity('');
      setExceedsQuantity(false);
      return;
    }
    
    const value = parseFloat(inputValue);
    
    if (isNaN(value)) {
      return; 
    }
    
    setSelectedQuantity(value);
    
    // Calculate minQuantity here to ensure item is available
    const minQuantity = item?.measurement_unit === 1 ? 0.25 : 1;
    
    if (value < minQuantity) {
      setExceedsQuantity(true);
    } else if (value > item.quantity) {
      toast.error('You exceed the stock');
      setExceedsQuantity(true);
    } else {
      setExceedsQuantity(false);
    }
  };

  if (isLoading) {
    return <Loader title="items" />;
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("common.itemNotFound")}
          </h1>
          <p className="text-gray-600 mb-4">
            {t("common.couldNotFindItem", {
              name: decodedName,
              defaultValue: `We couldn't find an item with the name: ${decodedName}`,
            })}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {t("common.goBack")}
          </button>
        </div>
      </div>
    );
  }

  function convertToCartItem(item: Item, quantity?: number): CartItem {
    return {
      _id: item._id,
      categoryId: getCategoryIdByItemName(item.name),
      categoryName: item.categoryName,
      name: item.name,
      image: item.image,
      points: item.points,
      price: item.price,
      measurement_unit: item.measurement_unit,
      quantity: quantity ?? selectedQuantity,
    };
  }

  const defaultQuantity = selectedQuantity === '' ? (item.measurement_unit === 1 ? 0.25 : 1) : selectedQuantity;
  const remainingAfterPurchase = actualRemainingStock - defaultQuantity;

  const isLowStock = item?.quantity <= 5;
  const isOutOfStock = item?.quantity <= 0;
  const isInCart = cart.some((cartItem) => cartItem._id === item._id);


  const handleAddToCart = () => {
    const qty = defaultQuantity;
    if (!isOutOfStock && !exceedsQuantity && qty >= minQuantity) {
      console.log("🛒 Adding to cart:", {
        item: item.name,
        quantity: qty,
      });
      addToCart(convertToCartItem(item, qty));
    }
  };

  const handleOperation = (op: "+" | "-") => {
    const step = item.measurement_unit === 1 ? 0.25 : 1;
    const minQuantity = item.measurement_unit === 1 ? 0.25 : 1;
    
    // Handle empty string case
    const currentQty = selectedQuantity === '' ? minQuantity : selectedQuantity;
    
    const newQuantity = op === "+" 
      ? currentQty + step 
      : Math.max(minQuantity, currentQty - step);
    
    // Check if new quantity exceeds stock
    if (newQuantity > item.quantity) {
      toast.error('You exceed the stock');
      setExceedsQuantity(true);
      return;
    }
    
    setExceedsQuantity(false);
    setSelectedQuantity(newQuantity);
    
    // Don't automatically update cart - let user manually add/remove
    // This prevents the interference with manual quantity selection
  };

const handleToggleCart = () => {
  const qtyToAdd = defaultQuantity;

  // Always add to cart (whether item is already in cart or not)
  if (!isOutOfStock && !exceedsQuantity && qtyToAdd >= minQuantity) {
    console.log("🛒 Adding to cart:", {
      item: item.name,
      quantity: qtyToAdd,
    });
    addToCart(convertToCartItem(item, qtyToAdd));
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
                {t(`categories.${item?.categoryName}`)}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">
                {t(
                  `categories.subcategories.${decodedName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`
                )}
              </h1>
              {item?.description && (
                <p className="text-gray-600 mt-2">{item?.description}</p>
              )}
            </div>

            {/* Price and Points */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {(item.price * defaultQuantity).toFixed(2)}{" "}
                {t("itemsModal.currency")}
              </span>
            </div>

            {/* Stock Status */}
<div className="pt-4 border-t border-gray-200">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">
      {t("common.availableStock")}
    </span>
    <span
      className={`text-sm font-medium ${
        isOutOfStock
          ? "text-red-600"
          : actualRemainingStock <= 5
          ? "text-amber-600"
          : "text-green-600"
      }`}
    >
      {isOutOfStock
        ? t("common.outOfStock")
        : `${actualRemainingStock} ${getMeasurementText(
            item.measurement_unit
          )} available`}
    </span>
  </div>

  {/* Dynamic Stock Indicator */}
  <div className="mb-2">
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          stockPercentage < 20
            ? "bg-red-500"
            : stockPercentage < 50
            ? "bg-amber-400"
            : "bg-green-500"
        }`}
        style={{ width: `${stockPercentage}%` }}
      ></div>
    </div>
    <div className="flex justify-between text-xs text-gray-500 mt-1">
      <span>
        {quantityInCart > 0 && (
          <span className="text-blue-600 mr-2">
            {quantityInCart} {getMeasurementText(item.measurement_unit)} in cart
          </span>
        )}
        {t("common.afterPurchase", {
          quantity: Math.max(0, actualRemainingStock),
          unit: getMeasurementText(item.measurement_unit),
          defaultValue: `After purchase: ${Math.max(
            0,
            remainingAfterPurchase
          )} ${getMeasurementText(
            item.measurement_unit
          )} remaining`,
        })}
      </span>
      <span>
        {t("common.percentageRemaining", {
          percentage: stockPercentage.toFixed(0),
          defaultValue: `${stockPercentage.toFixed(0)}% available`,
        })}
      </span>
    </div>
  </div>
  {actualRemainingStock <= 5 && actualRemainingStock > 0 && (
    <p className="text-xs text-amber-600 flex items-center">
      <svg
        className="w-3 h-3 mr-1"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {t("common.lowStockWarning", {
        quantity: actualRemainingStock,
        unit: getMeasurementText(item.measurement_unit),
        defaultValue: `Low stock - only ${actualRemainingStock} ${getMeasurementText(item.measurement_unit)} available!`,
      })}
    </p>
  )}
</div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("common.quantity")}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOperation("-")}
                  disabled={selectedQuantity <= minQuantity || selectedQuantity === '' || loadingItemId === item._id}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <TextInput 
                  type="number" 
                  value={selectedQuantity} 
                  min={item.measurement_unit === 1 ? "0.25" : "1"}
                  max={item.quantity}
                  step={item.measurement_unit === 1 ? "0.25" : "1"}
                  className="w-[80px] text-center" 
                  onChange={handleChangeNumberInput}
                />
                <button
                  onClick={() => handleOperation("+")}
                  disabled={selectedQuantity >= item.quantity || selectedQuantity === '' || loadingItemId === item._id}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">
                  {getMeasurementText(item.measurement_unit)}
                </span>
              </div>
              {exceedsQuantity && (
                <p className="text-xs text-red-600">
                  {selectedQuantity === '' || selectedQuantity < minQuantity
                    ? `Quantity must be at least ${minQuantity} ${getMeasurementText(item.measurement_unit)}`
                    : `Maximum available quantity is ${item.quantity} ${getMeasurementText(item.measurement_unit)}`
                  }
                </p>
              )}
            </div>

        <Button
  onClick={handleToggleCart}
  disabled={isOutOfStock || loadingItemId === item._id || !isValidQuantity}
  className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
    isOutOfStock || loadingItemId === item._id || !isValidQuantity
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
  }`}
>
  {loadingItemId === item._id ? (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
  ) : (
    <Package className="w-5 h-5" />
  )}
  <span>
    {isOutOfStock
      ? t("common.outOfStock")
      : loadingItemId === item._id
      ? t("common.adding")
      : isInCart 
      ? `Add ${defaultQuantity} more ${getMeasurementText(item.measurement_unit)}`
      : t("common.addToRecyclingCart")}
  </span>
</Button>

            {/* Environmental Benefits */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Leaf className="w-5 h-5 mr-2 text-green-600" />
                {t("environmentalBenefit.environmentalBenefits")}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t("environmentalBenefit.reducesCO2Emissions", {
                    amount: (defaultQuantity * 2.5).toFixed(1),
                  })}
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t("environmentalBenefit.savesWater", {
                    amount: defaultQuantity * 15,
                  })}
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t("environmentalBenefit.conservesNaturalResources")}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-16 space-y-8">
          {/* Recycling Process */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("recycleProcess.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
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