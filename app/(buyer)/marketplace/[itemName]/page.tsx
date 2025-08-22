"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import { Recycle, Leaf, Package, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { useUserAuth } from "@/context/AuthFormContext";
import { useItemSocket } from "@/hooks/useItemSocket";
// To:
import Loader from '@/components/common/Loader'
// Lazy load FloatingRecorderButton for voice processing
const FloatingRecorderButton = dynamic(
  () => import('@/components/Voice Processing/FloatingRecorderButton'),
  { ssr: false }
);

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
  categoryId: string;
  description?: string;
  quantity: number;
  displayName?: string;
  categoryDisplayName?: string;
}

export default function ItemDetailsPage() {
  const { itemName } = useParams();
  console.log(itemName);
  
 const decodedName =
  typeof itemName === "string" ? decodeURIComponent(itemName) : "";
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1"); // For the input field
  const [inputError, setInputError] = useState("");
  const {
    loadingItemId,
    cart,
    addToCart,
 
    updateCartState,
  } = useCart();
  const { t,locale,convertNumber } = useLanguage();

  useEffect(() => {
  const decodedName = decodeURIComponent(itemName.toString().toLowerCase());
  console.log(decodedName,'ddd');
  
  const existing = cart.find(
    (item) => item?.name?.en.toLowerCase() === decodedName
  );
  if (existing) {
    setSelectedQuantity(existing.quantity);
    setInputValue(existing.quantity.toString());
  }
}, [cart, itemName]);
  console.log("🔍 Item Details Page loaded:", {
    itemName,
    decodedName,
    params: useParams(),
  });

  useEffect(() => {
    console.log("🛒 Updated cart:", cart);
  }, [cart]);


const fetchItemByName = async () => {
  if (!decodedName) throw new Error("No item name provided");

  try {
    const res = await api.get(`/items/by-name/${decodedName}?role=buyer&language=${locale}`);
    
    if (!res.data.success) {
      throw new Error("Item not found");
    }
    
    return res.data.data;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error;
  }
};
const{user}=useUserAuth()
  const {
    data: item,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["item-details", decodedName],
    queryFn: fetchItemByName,
    enabled: !!decodedName,
  });
    useItemSocket({
    itemId: item?._id,
    itemName: decodedName,
    userRole: user?.role,
  });


  const queryClient = useQueryClient();
const cachedItem = queryClient.getQueryData(["item-details", decodedName]) as Item;
const currentStock = cachedItem?.quantity ?? item?.quantity ?? 0;

  const syncCartWithChanges = (quantity: number) => {
    if (cart.find((ci) => ci._id === item._id)) {
      updateCartState(
        cart.map((ci) => (ci._id === item._id ? { ...item, quantity } : ci))
      );
    }
  };
    const convertToCartItem = useCallback(
    (item: Item, quantity?: number): CartItem => {
      const englishItemName =
        typeof item.name === "string" ? item.name : item.name?.en || "";
      const arabicItemName =
        typeof item.name === "string" ? "" : item.name?.ar || "";
      const categoryId = item._id;
      const categoryNameEn =
        typeof item.categoryName === "string"
          ? item.categoryName
          : item.categoryName?.en || "";
      const categoryNameAr =
        typeof item.categoryName === "string"
          ? ""
          : item.categoryName?.ar || "";

      return {
        _id: item._id,
        categoryId,
        categoryName: {
          en: categoryNameEn,
          ar: categoryNameAr,
        },
        name: {
          en: englishItemName,
          ar: arabicItemName,
        },
        image: item.image,
        points: item.points,
        price: item.price,
        measurement_unit: item.measurement_unit,
        quantity: quantity ?? item.quantity,
      };
    },
    []
  );

  // const categoryName_display =
  //  item.categoryName[locale];

  const getMeasurementText = (unit: 1 | 2): string => {
    return unit === 1 ? t("common.unitKg") : t("common.unitPiece");
  };

  // Validation function for quantity input
  const validateQuantity = (
    value: string,
    measurementUnit: 1 | 2,
    maxQuantity: number
  ): { isValid: boolean; errorMessage: string; validValue: number } => {
    const numValue = parseFloat(value);

    // Check if it's a valid number
    if (isNaN(numValue) || numValue <= 0) {
      return {
        isValid: false,
        errorMessage: t("common.invalidQuantity"),
        validValue: 1,
      };
    }

    // Check maximum limit
    if (numValue > maxQuantity) {
      return {
        isValid: false,
        errorMessage: t("common.exceedsMaxQuantity", {
          max: maxQuantity,
          defaultValue: `Maximum available quantity is ${maxQuantity}`,
        }),
        validValue: maxQuantity,
      };
    }

    // For measurement unit 2 (pieces) - only whole numbers
    if (measurementUnit === 2) {
      if (!Number.isInteger(numValue)) {
        return {
          isValid: false,
          errorMessage: t("common.wholeNumbersOnly"),
          validValue: Math.floor(numValue) || 1,
        };
      }
    }

    // For measurement unit 1 (kg) - minimum 0.25, multiples of 0.25
    if (measurementUnit === 1) {
      const minValue = 0.25;
      if (numValue < minValue) {
        return {
          isValid: false,
          errorMessage: t("common.minimumQuantity", {
            min: minValue,
            defaultValue: `Minimum quantity is ${minValue} kg`,
          }),
          validValue: minValue,
        };
      }

      // Check if it's a multiple of 0.25
      const remainder = (numValue * 100) % 25; // Convert to avoid floating point issues
      if (remainder !== 0) {
        const roundedValue = Math.round(numValue * 4) / 4; // Round to nearest 0.25
        return {
          isValid: false,
          errorMessage: t("common.invalidIncrement", {
            increment: "0.25",
            defaultValue: "Quantity must be in increments of 0.25 kg",
          }),
          validValue: roundedValue,
        };
      }
    }

    return {
      isValid: true,
      errorMessage: "",
      validValue: numValue,
    };
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (!item) return;
const validation = validateQuantity(value, item.measurement_unit, currentStock);


    if (validation.isValid) {
      setSelectedQuantity(validation.validValue);
      setInputError("");
    } else {
      setInputError(validation.errorMessage);
    }
  };

  // Handle input blur (when user finishes typing)
  const handleInputBlur = () => {
    if (!item) return;

    const validation = validateQuantity(
      inputValue,
      item.measurement_unit,
      item.quantity
    );

    if (!validation.isValid) {
      // Auto-correct to valid value
      setSelectedQuantity(validation.validValue);
      setInputValue(validation.validValue.toString());
      setInputError("");

      // Show toast with correction message
      toast.error(validation.errorMessage);
    } else {
      syncCartWithChanges(parseFloat(inputValue));
    }
  };

  if (isLoading) {
    return <Loader  />;
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
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            {t("common.goBack")}
          </button>
        </div>
      </div>
    );
  }


const remainingQuantity = currentStock - selectedQuantity;
const isLowStock = currentStock <= 5;
const isOutOfStock = currentStock <= 0;
  const isInCart = cart.some((cartItem) => cartItem._id === item._id);
const stockPercentage = Math.max(0, Math.min(100, (remainingQuantity / currentStock) * 100));

  const handleAddToCart = () => {
    if (!isOutOfStock && remainingQuantity >= 0) {
      console.log("🛒 Adding to cart:", {
        item: item.name,
        quantity: selectedQuantity,
      });
      addToCart({ ...item, quantity: selectedQuantity });
    }
  };

  const handleOperation = (op: "+" | "-") => {
    console.log(`HANDLEEEEEEEEEEEEEEEEEEEEE OPERATION ${op}`);
    console.log(item);
    const step = item.measurement_unit === 1 ? 0.25 : 1;
    const appliedStep = op === "+" ? step : -step;
    const newQuantity = selectedQuantity + appliedStep;

    // Validate the new quantity
    const validation = validateQuantity(
      newQuantity.toString(),
      item.measurement_unit,
      item.quantity
    );

    if (validation.isValid) {
      setSelectedQuantity(validation.validValue);
      setInputValue(validation.validValue.toString());
      setInputError("");
      syncCartWithChanges(newQuantity);
    }
  };

  const handleToggleCart = () => {
    if (isInCart) {
      const toRemove = convertToCartItem(item);
      updateCartState(cart.filter((ci) => ci._id !== toRemove._id));
      setSelectedQuantity(1);
      setInputValue("1");
    } else if (!isOutOfStock) {
      handleAddToCart();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
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
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mediummb-3" style={{color:"var(--color-base-800)", background:"var(--text-gray-100)"}}>
                {item?.categoryName[locale]}
              </span>
              <h1 className="text-3xl font-bold text-gray-900"style={{color:"var(--color-base-800)"}} >
                {item.name[locale]}
              </h1>
              {item?.description && (
                <p className="text-gray-600 mt-2" style={{color:"var(--color-base-800)"}}>{item?.description}</p>
              )}
            </div>

            {/* Price and Points */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900" style={{color:"var(--color-base-800)"}}>
                {convertNumber((item.price * selectedQuantity).toFixed(2))}{" "}
                {t("itemsModal.currency")}
              </span>
            </div>

            {/* Stock Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{color:"var(--text-gray-700)"}}>
                  {t("common.availableStock")}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isOutOfStock
                      ? "text-red-600"
                      : isLowStock
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}>
                  {isOutOfStock
                    ? t("common.outOfStock")
                    : `${item?.quantity} ${getMeasurementText(
                        item.measurement_unit
                      )}`}
                </span>
              </div>

              {/* Dynamic Stock Indicator */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stockPercentage < 20
                        ? "bg-red-500"
                        : stockPercentage < 50
                        ? "bg-amber-400"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${stockPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {t("common.afterPurchase", {
                      quantity: Math.max(0, remainingQuantity),
                      unit: getMeasurementText(item.measurement_unit),
                      defaultValue: `After purchase: ${Math.max(
                        0,
                        remainingQuantity
                      )} ${getMeasurementText(
                        item.measurement_unit
                      )} remaining`,
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
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("common.lowStockWarning", {
                    quantity: item.quantity,
                    unit: getMeasurementText(item.measurement_unit),
                    defaultValue: `Low stock - only ${
                      item.quantity
                    } ${getMeasurementText(item.measurement_unit)} left!`,
                  })}
                </p>
              )}
            </div>

            {/* Enhanced Quantity Selector */}
            {item.quantity !== 0 && (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-medium" style={{color:"var(--text-gray-700)"}}>
                    {t("common.quantity")}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleOperation("-")}
                      disabled={
                        selectedQuantity <=
                        (item.measurement_unit === 1 ? 0.25 : 1)
                      }
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Minus className="w-4 h-4" />
                    </button>

                    {/* Input Field */}
                    <div className="flex flex-col min-w-0">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        className={`w-20 px-3 py-2 text-center font-medium border rounded-lg focus:outline-none focus:ring-2 ${
                          inputError
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                        }`}
                        placeholder={item.measurement_unit === 1 ? "0.25" : "1"}
                      />
                    </div>

                    <button
                      onClick={() => handleOperation("+")}
                      disabled={selectedQuantity >= item.quantity}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">
                      {getMeasurementText(item.measurement_unit)}
                    </span>
                  </div>

                  {/* Error message with proper spacing */}
                  {inputError && (
                    <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md p-2">
                      {inputError}
                    </div>
                  )}

                  {/* Helper text */}
                  <p className="text-xs text-gray-500">
                    {item.measurement_unit === 1
                      ? t("common.kgIncrement", {
                          defaultValue:
                            "Minimum 0.25 kg, increments of 0.25 kg",
                        })
                      : t("common.wholeNumbers", {
                          defaultValue: "Whole numbers only",
                        })}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleToggleCart}
                  disabled={
                    isOutOfStock || loadingItemId === item._id || !!inputError
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    isOutOfStock || loadingItemId === item._id || !!inputError
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isInCart
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                  }`}>
                  {loadingItemId === item._id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Package className="w-5 h-5" />
                  )}
                  <span>
                    {isOutOfStock && !isInCart
                      ? t("common.outOfStock")
                      : loadingItemId === item._id
                      ? t("common.processing")
                      : isInCart
                      ? t("common.removeFromRecyclingCart")
                      : t("common.addToRecyclingCart")}
                  </span>
                </button>
              </>
            )}

     
          </div>
        </div>

        {/* Additional Product Info */}
        <div className="mt-16 space-y-8">
          {/* Recycling Process */}
          <div className="rounded-xl p-8" style={{background:"var(--text-gray-100)"}}>
            <h2 className="text-2xl font-bold mb-6" style={{color:"var(--text-gray-900)"}}>
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
                  <div className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center" style={{background:"var(--background)"}} >
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p  style={{color:"var(--text-gray-700)"}}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Voice Processing Component */}
      <FloatingRecorderButton />
    </div>
  );
}