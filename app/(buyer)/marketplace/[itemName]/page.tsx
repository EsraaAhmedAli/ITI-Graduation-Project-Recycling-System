"use client";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  startTransition,
  useTransition,
} from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import { Recycle, Leaf, Package, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories } from "@/hooks/useGetCategories";
import toast from "react-hot-toast";

// Lazy load heavy components
const LazyLoader = dynamic(() => import("@/components/common/Loader"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  ),
});

interface Item {
  _id: string;
  name: { en: string; ar: string } | string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
  image: string;
  categoryName: { en: string; ar: string } | string;
  categoryId: string;
  description?: string;
  quantity: number;
}

// Memoized components for better performance
const OptimizedImage = memo(
  ({
    src,
    alt,
    priority = true,
  }: {
    src: string;
    alt: string;
    priority?: boolean;
  }) => {
    // Optimize Cloudinary images
    const optimizedSrc = useMemo(() => {
      if (src.includes("cloudinary.com")) {
        return src.replace(
          "/upload/",
          "/upload/c_fit,w_600,q_auto,f_auto,dpr_auto/"
        );
      }
      return src;
    }, [src]);

    return (
      <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden shadow-sm">
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          className="object-contain"
          priority={priority}
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

const QuantitySelector = memo(
  ({
    item,
    selectedQuantity,
    inputValue,
    inputError,
    onInputChange,
    onInputBlur,
    onOperation,
    getMeasurementText,
    t,
  }: {
    item: Item;
    selectedQuantity: number;
    inputValue: string;
    inputError: string;
    onInputChange: (value: string) => void;
    onInputBlur: () => void;
    onOperation: (op: "+" | "-") => void;
    getMeasurementText: (unit: 1 | 2) => string;
    t: (key: string, params?: any) => string;
  }) => {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t("common.quantity")}
        </label>
        <div className="flex items-center space-x-3">
          <button
            aria-label="decrease item"
            onClick={() => onOperation("-")}
            disabled={
              selectedQuantity <= (item.measurement_unit === 1 ? 0.25 : 1)
            }
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onBlur={onInputBlur}
              className={`w-20 px-3 py-2 text-center font-medium border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-150 ${
                inputError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-green-500 focus:border-green-500"
              }`}
              placeholder={item.measurement_unit === 1 ? "0.25" : "1"}
            />
          </div>

          <button
            aria-label="increase item quantity"
            onClick={() => onOperation("+")}
            disabled={selectedQuantity >= item.quantity}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">
            {getMeasurementText(item.measurement_unit)}
          </span>
        </div>

        {inputError && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md p-2">
            {inputError}
          </div>
        )}

        <p className="text-xs text-gray-500">
          {item.measurement_unit === 1
            ? t("common.kgIncrement", {
                defaultValue: "Minimum 0.25 kg, increments of 0.25 kg",
              })
            : t("common.wholeNumbers", {
                defaultValue: "Whole numbers only",
              })}
        </p>
      </div>
    );
  }
);

QuantitySelector.displayName = "QuantitySelector";

const StockIndicator = memo(
  ({
    item,
    selectedQuantity,
    isOutOfStock,
    isLowStock,
    stockPercentage,
    remainingQuantity,
    getMeasurementText,
    t,
  }: {
    item: Item;
    selectedQuantity: number;
    isOutOfStock: boolean;
    isLowStock: boolean;
    stockPercentage: number;
    remainingQuantity: number;
    getMeasurementText: (unit: 1 | 2) => string;
    t: (key: string, params?: any) => string;
  }) => {
    return (
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t("common.availableStock")}
          </span>
          <span
            className={`text-sm font-medium ${
              isOutOfStock
                ? "text-red-600"
                : isLowStock
                ? "text-amber-600"
                : "text-green-600"
            }`}
          >
            {isOutOfStock
              ? t("common.outOfStock")
              : `${item?.quantity} ${getMeasurementText(
                  item.measurement_unit
                )}`}
          </span>
        </div>

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
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {t("common.afterPurchase", {
                quantity: Math.max(0, remainingQuantity),
                unit: getMeasurementText(item.measurement_unit),
                defaultValue: `After purchase: ${Math.max(
                  0,
                  remainingQuantity
                )} ${getMeasurementText(item.measurement_unit)} remaining`,
              })}
            </span>
            <span>{stockPercentage.toFixed(0)}% remaining</span>
          </div>
        </div>

        {isLowStock && !isOutOfStock && (
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
              quantity: item.quantity,
              unit: getMeasurementText(item.measurement_unit),
              defaultValue: `Low stock - only ${
                item.quantity
              } ${getMeasurementText(item.measurement_unit)} left!`,
            })}
          </p>
        )}
      </div>
    );
  }
);

StockIndicator.displayName = "StockIndicator";

const EnvironmentalBenefits = memo(
  ({
    selectedQuantity,
    t,
  }: {
    selectedQuantity: number;
    t: (key: string, params?: any) => string;
  }) => {
    const benefits = useMemo(
      () => [
        {
          text: t("environmentalBenefit.reducesCO2Emissions", {
            amount: (selectedQuantity * 2.5).toFixed(1),
          }),
        },
        {
          text: t("environmentalBenefit.savesWater", {
            amount: selectedQuantity * 15,
          }),
        },
        {
          text: t("environmentalBenefit.conservesNaturalResources"),
        },
      ],
      [selectedQuantity, t]
    );

    return (
      <div className="bg-gray-50 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Leaf className="w-5 h-5 mr-2 text-green-600" />
          {t("environmentalBenefit.environmentalBenefits")}
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              {benefit.text}
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

EnvironmentalBenefits.displayName = "EnvironmentalBenefits";

const RecyclingProcess = memo(({ t }: { t: (key: string) => string }) => {
  const steps = useMemo(
    () => [
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
    ],
    [t]
  );

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
            <h3 className="font-semibold text-lg text-gray-600">
              {step.title}
            </h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

RecyclingProcess.displayName = "RecyclingProcess";

// Custom hook for validation logic
const useQuantityValidation = (item?: Item, t?: any) => {
  return useCallback(
    (
      value: string,
      measurementUnit: 1 | 2,
      maxQuantity: number
    ): { isValid: boolean; errorMessage: string; validValue: number } => {
      const numValue = parseFloat(value);

      if (isNaN(numValue) || numValue <= 0) {
        return {
          isValid: false,
          errorMessage: t("common.invalidQuantity"),
          validValue: 1,
        };
      }

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

      if (measurementUnit === 2) {
        if (!Number.isInteger(numValue)) {
          return {
            isValid: false,
            errorMessage: t("common.wholeNumbersOnly"),
            validValue: Math.floor(numValue) || 1,
          };
        }
      }

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

        const remainder = (numValue * 100) % 25;
        if (remainder !== 0) {
          const roundedValue = Math.round(numValue * 4) / 4;
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
    },
    [t]
  );
};

export default function ItemDetailsPage() {
  const { itemName } = useParams();
  const { locale, t } = useLanguage();
  const { getCategoryIdByItemName } = useCategories();
  const [isPending, startTransition] = useTransition();

  // Memoize decoded name to prevent unnecessary recalculations
  const decodedName = useMemo(
    () => (typeof itemName === "string" ? decodeURIComponent(itemName) : ""),
    [itemName]
  );

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [inputError, setInputError] = useState("");

  const { loadingItemId, cart, addToCart, updateCartState } = useCart();

  // Optimized API fetch with better caching
  const fetchItemByName = useCallback(async () => {
    if (!decodedName) throw new Error("No item name provided");

    try {
      const res = await api.get(
        "/categories/get-items?limit=10000&role=buyer",
        {
          timeout: 8000,
          headers: {
            "Cache-Control": "public, max-age=300", // 5 minute cache
          },
        }
      );

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
  } = useQuery({
    queryKey: ["item-details", decodedName],
    queryFn: fetchItemByName,
    enabled: !!decodedName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Custom hook for validation
  const validateQuantity = useQuantityValidation(item, t);

  // Memoize expensive calculations
  const computedValues = useMemo(() => {
    if (!item) return null;

    const remainingQuantity = item.quantity - selectedQuantity;
    const isLowStock = item.quantity <= 5;
    const isOutOfStock = item.quantity <= 0;
    const isInCart = cart.some((cartItem) => cartItem._id === item._id);
    const stockPercentage = Math.max(
      0,
      Math.min(100, (remainingQuantity / item.quantity) * 100)
    );

    return {
      remainingQuantity,
      isLowStock,
      isOutOfStock,
      isInCart,
      stockPercentage,
    };
  }, [item, selectedQuantity, cart]);

  const getMeasurementText = useCallback(
    (unit: 1 | 2): string => {
      return unit === 1 ? t("common.unitKg") : t("common.unitPiece");
    },
    [t]
  );

  // Initialize quantity from cart
  useEffect(() => {
    if (!item) return;

    const existing = cart.find((cartItem) => cartItem._id === item._id);

    if (existing) {
      startTransition(() => {
        setSelectedQuantity(existing.quantity);
        setInputValue(existing.quantity.toString());
      });
    }
  }, [cart, item]);

  // Optimized cart sync
  const syncCartWithChanges = useCallback(
    (quantity: number) => {
      if (!item) return;

      const cartItem = cart.find((ci) => ci._id === item._id);
      if (cartItem) {
        startTransition(() => {
          updateCartState(
            cart.map((ci) =>
              ci._id === item._id ? { ...cartItem, quantity } : ci
            )
          );
        });
      }
    },
    [cart, item, updateCartState]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);

      if (!item) return;

      const validation = validateQuantity(
        value,
        item.measurement_unit,
        item.quantity
      );

      if (validation.isValid) {
        startTransition(() => {
          setSelectedQuantity(validation.validValue);
          setInputError("");
        });
      } else {
        setInputError(validation.errorMessage);
      }
    },
    [item, validateQuantity]
  );

  const handleInputBlur = useCallback(() => {
    if (!item) return;

    const validation = validateQuantity(
      inputValue,
      item.measurement_unit,
      item.quantity
    );

    if (!validation.isValid) {
      startTransition(() => {
        setSelectedQuantity(validation.validValue);
        setInputValue(validation.validValue.toString());
        setInputError("");
      });
      toast.error(validation.errorMessage);
    } else {
      syncCartWithChanges(parseFloat(inputValue));
    }
  }, [item, inputValue, validateQuantity, syncCartWithChanges]);

  const handleOperation = useCallback(
    (op: "+" | "-") => {
      if (!item) return;

      const step = item.measurement_unit === 1 ? 0.25 : 1;
      const appliedStep = op === "+" ? step : -step;
      const newQuantity = selectedQuantity + appliedStep;

      const validation = validateQuantity(
        newQuantity.toString(),
        item.measurement_unit,
        item.quantity
      );

      if (validation.isValid) {
        startTransition(() => {
          setSelectedQuantity(validation.validValue);
          setInputValue(validation.validValue.toString());
          setInputError("");
        });
        syncCartWithChanges(newQuantity);
      }
    },
    [item, selectedQuantity, validateQuantity, syncCartWithChanges]
  );

  // Convert to cart item function
  const convertToCartItem = useCallback(
    (item: Item, quantity?: number): CartItem => {
      const englishItemName =
        typeof item.name === "string" ? item.name : item.name?.en || "";
      const arabicItemName =
        typeof item.name === "string" ? "" : item.name?.ar || "";
      const categoryId = getCategoryIdByItemName(englishItemName);
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
    [getCategoryIdByItemName]
  );

  const handleToggleCart = useCallback(() => {
    if (!item || !computedValues) return;

    if (computedValues.isInCart) {
      const toRemove = convertToCartItem(item);
      startTransition(() => {
        updateCartState(cart.filter((ci) => ci._id !== toRemove._id));
        setSelectedQuantity(1);
        setInputValue("1");
      });
    } else if (!computedValues.isOutOfStock) {
      addToCart({ ...item, quantity: selectedQuantity });
    }
  }, [
    item,
    computedValues,
    cart,
    convertToCartItem,
    updateCartState,
    addToCart,
    selectedQuantity,
  ]);

  // Loading state
  if (isLoading) {
    return <LazyLoader title="items" />;
  }

  // Error state
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
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-150"
          >
            {t("common.goBack")}
          </button>
        </div>
      </div>
    );
  }

  if (!computedValues) return null;

  const itemName_display =
    typeof item.name === "string" ? item.name : item.name[locale];
  const categoryName_display =
    typeof item.categoryName === "string"
      ? item.categoryName
      : item.categoryName[locale];

  return (
    <div className="min-h-screen dark:bg-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <OptimizedImage
              src={item.image}
              alt={itemName_display}
              priority={true}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category and Title */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900 mb-3">
                {categoryName_display}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">
                {itemName_display}
              </h1>
              {item?.description && (
                <p className="text-gray-600 mt-2">{item?.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {(item.price * selectedQuantity).toFixed(2)}{" "}
                {t("itemsModal.currency")}
              </span>
            </div>

            {/* Stock Status */}
            <StockIndicator
              item={item}
              selectedQuantity={selectedQuantity}
              isOutOfStock={computedValues.isOutOfStock}
              isLowStock={computedValues.isLowStock}
              stockPercentage={computedValues.stockPercentage}
              remainingQuantity={computedValues.remainingQuantity}
              getMeasurementText={getMeasurementText}
              t={t}
            />

            {/* Quantity Selector */}
            {item.quantity !== 0 && (
              <>
                <QuantitySelector
                  item={item}
                  selectedQuantity={selectedQuantity}
                  inputValue={inputValue}
                  inputError={inputError}
                  onInputChange={handleInputChange}
                  onInputBlur={handleInputBlur}
                  onOperation={handleOperation}
                  getMeasurementText={getMeasurementText}
                  t={t}
                />

                {/* Add to Cart Button */}
                <button
                  aria-label="add or delete"
                  onClick={handleToggleCart}
                  disabled={
                    computedValues.isOutOfStock ||
                    loadingItemId === item._id ||
                    !!inputError ||
                    isPending
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors duration-150 ${
                    computedValues.isOutOfStock ||
                    loadingItemId === item._id ||
                    !!inputError ||
                    isPending
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : computedValues.isInCart
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {loadingItemId === item._id || isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Package className="w-5 h-5" />
                  )}
                  <span>
                    {computedValues.isOutOfStock && !computedValues.isInCart
                      ? t("common.outOfStock")
                      : loadingItemId === item._id || isPending
                      ? t("common.processing")
                      : computedValues.isInCart
                      ? t("common.removeFromRecyclingCart")
                      : t("common.addToRecyclingCart")}
                  </span>
                </button>
              </>
            )}

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
                  <h3 className="font-semibold text-lg text-gray-600">
                    {step.title}
                  </h3>
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
