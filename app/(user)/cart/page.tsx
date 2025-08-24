"use client";
import { useCart } from "@/context/CartContext";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { X, Leaf, Recycle, Truck, Scale, Package, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "flowbite-react";
import Image from "next/image";
import { useUserAuth } from "@/context/AuthFormContext";
import { CartItem } from "@/models/cart";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useQueryClient } from '@tanstack/react-query';
import { useItemSocket } from "@/hooks/useItemSocket";
import { useGetCartItems } from "@/hooks/cart/useGetCartItems";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function CartPage() {
  const { cart, removeFromCart, clearCart, userRole, updateCartState } = useCart();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [totalItems, setTotalItems] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { user } = useUserAuth();
  const { t, locale, convertNumber } = useLanguage();

  // States for input handling
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});

  // Enhanced stock tracking
  const [exceedsStockItems, setExceedsStockItems] = useState<{ [key: string]: boolean }>({});
  const [hasExceedsStockItems, setHasExceedsStockItems] = useState(false);
  const [canIncrease, setCanIncrease] = useState<{ [key: string]: boolean }>({});
  const [stockWarnings, setStockWarnings] = useState<{ [key: string]: string }>({});

  // Get unique item IDs from cart to fetch only needed items
  const cartItemIds = useMemo(() => cart.map(item => item._id), [cart]);

  // Use the new hook to fetch only cart items
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems,
  } = useGetCartItems(cartItemIds, userRole, locale);

  // Initialize socket connection for real-time updates on cart items only
  useItemSocket({
    itemIds: cartItemIds,
    userRole: userRole || "buyer",
  });

  // Create a stock levels map from the React Query data
  const stockLevels = useMemo(() => {
    // Don't calculate stock levels until we have data
    if (!itemsData?.data || userRole !== "buyer" || isLoadingItems) return {};

    const stockMap: { [key: string]: number } = {};
    cart.forEach((cartItem) => {
      const foundItem = itemsData.data.find(
        (apiItem: any) => apiItem._id === cartItem._id
      );
      // Only set stock level if we found the item in the API response
      if (foundItem && typeof foundItem.quantity === 'number') {
        stockMap[cartItem._id] = foundItem.quantity;
      }
    });

    console.log('Stock levels calculated:', stockMap);
    return stockMap;
  }, [itemsData, cart, userRole, isLoadingItems]);

  // Real-time stock change detection and notification
  const [previousStockLevels, setPreviousStockLevels] = useState<{ [key: string]: number }>({});

  // Initialize previous stock levels on first load
  useEffect(() => {
    if (userRole === "buyer" &&
      Object.keys(stockLevels).length > 0 &&
      !isLoadingItems &&
      Object.keys(previousStockLevels).length === 0) {
      console.log('Initializing previous stock levels:', stockLevels);
      setPreviousStockLevels({ ...stockLevels });
    }
  }, [stockLevels, userRole, previousStockLevels, isLoadingItems]);
  // Socket-based stock change notifications
  // Fix the stock change detection useEffect
  useEffect(() => {
    if (userRole === "buyer" && Object.keys(stockLevels).length > 0) {
      // Skip initial setup - only compare when we have previous data
      const hasPreviousData = Object.keys(previousStockLevels).length > 0;

      if (!hasPreviousData) {
        // Initial setup - just store the current stock levels
        setPreviousStockLevels({ ...stockLevels });
        return;
      }

      // Check for actual stock changes
      let hasChanges = false;
      const newPreviousLevels = { ...previousStockLevels };

      Object.keys(stockLevels).forEach(itemId => {
        const currentStock = stockLevels[itemId];
        const previousStock = previousStockLevels[itemId];

        // Only show notifications for actual changes
        if (previousStock !== undefined && currentStock !== previousStock) {
          hasChanges = true;
          const cartItem = cart.find(item => item._id === itemId);
          if (cartItem) {
            const stockChange = currentStock - previousStock;
            const itemName = typeof cartItem.name === 'string'
              ? cartItem.name
              : cartItem.name[locale] || cartItem.name.en;

            if (stockChange < 0) {
              toast.error(
                `Stock Alert: ${itemName} - ${Math.abs(stockChange)} units removed from inventory (Now: ${currentStock})`,
                { duration: 5000 }
              );
            } else if (stockChange > 0) {
              toast.success(
                `Stock Alert: ${itemName} - ${stockChange} units added to inventory (Now: ${currentStock})`,
                { duration: 4000 }
              );
            }
          }
        }

        // Update the previous stock level for this item
        newPreviousLevels[itemId] = currentStock;
      });

      // Only update previous stock levels if there were actual changes
      if (hasChanges) {
        setPreviousStockLevels(newPreviousLevels);
      }
    }
  }, [stockLevels, cart, userRole, locale, previousStockLevels]);
  // Remove the aggressive refresh mechanisms and keep only essential ones
  useEffect(() => {
    const handleFocus = () => {
      if (userRole === "buyer") {
        refetchItems();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userRole, refetchItems]);

  useEffect(() => {
    // Don't run stock checking if we're still loading or don't have stock data
    if (userRole === "buyer" && (isLoadingItems || Object.keys(stockLevels).length === 0)) {
      return;
    }

    if (userRole !== "buyer" || cart.length === 0) {
      const results: { [key: string]: boolean } = {};
      const exceedsStock: { [key: string]: boolean } = {};
      const warnings: { [key: string]: string } = {};

      cart.forEach((item) => {
        results[item._id] = true;
        exceedsStock[item._id] = false;
        warnings[item._id] = "";
      });

      setCanIncrease(results);
      setExceedsStockItems(exceedsStock);
      setStockWarnings(warnings);
      setHasExceedsStockItems(false);
      return;
    }

    const results: { [key: string]: boolean } = {};
    const exceedsStock: { [key: string]: boolean } = {};
    const warnings: { [key: string]: string } = {};
    let hasAnyExceedsStock = false;

    cart.forEach((item) => {
      const increment = item.measurement_unit === 1 ? 0.25 : 1;
      const availableStock = stockLevels[item._id];
      const itemName = typeof item.name === 'string'
        ? item.name
        : item.name[locale] || item.name.en;

      // Only check stock if we have stock data for this item
      if (availableStock === undefined) {
        // If we don't have stock data yet, assume it's fine
        results[item._id] = true;
        exceedsStock[item._id] = false;
        warnings[item._id] = "";
        return;
      }

      // Check if cart quantity exceeds available stock
      const exceedsAvailableStock = item.quantity > availableStock;
      exceedsStock[item._id] = exceedsAvailableStock;

      if (exceedsAvailableStock) {
        hasAnyExceedsStock = true;
        if (availableStock === 0) {
          warnings[item._id] = `${itemName} is currently out of stock`;
        } else {
          warnings[item._id] = `Only ${availableStock} available, you have ${item.quantity} in cart`;
        }
      } else {
        warnings[item._id] = "";
      }

      // Check if we can increase quantity
      results[item._id] = availableStock >= item.quantity + increment;
    });

    setCanIncrease(results);
    setExceedsStockItems(exceedsStock);
    setStockWarnings(warnings);
    setHasExceedsStockItems(hasAnyExceedsStock);
  }, [cart, userRole, stockLevels, locale, isLoadingItems]);

  // Initialize input values when cart changes
  useEffect(() => {
    const newInputValues: { [key: string]: string } = {};
    cart.forEach((item) => {
      newInputValues[item._id] = item.quantity.toString();
    });
    setInputValues(newInputValues);
  }, [cart]);

  // Calculate totals
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const points = cart.reduce(
      (sum, item) => sum + (item.points || 0) * item.quantity,
      0
    );
    const price = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setTotalItems(total);
    setTotalPoints(points);
    setTotalPrice(price);
  }, [cart]);

  // Show notification for stock issues
  useEffect(() => {
    if (hasExceedsStockItems) {
      const timer = setTimeout(() => {
        toast.error(
          "Some items exceed available stock. Please adjust quantities to continue.",
          { duration: 4000 }
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasExceedsStockItems]);

  const coin = locale === "en" ? "EGP" : "ج.م";

  // Enhanced validation function
  const validateQuantity = (
    value: string,
    measurementUnit: 1 | 2,
    maxQuantity: number,
    itemId: string
  ): { isValid: boolean; errorMessage: string; validValue: number } => {
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue <= 0) {
      return {
        isValid: false,
        errorMessage: "Please enter a valid quantity",
        validValue: measurementUnit === 1 ? 0.25 : 1,
      };
    }

    // For buyers, allow quantities up to available stock (not strict blocking)
    if (userRole === "buyer" && numValue > maxQuantity) {
      return {
        isValid: true, // Allow but will be marked as exceeds stock
        errorMessage: `Requested quantity exceeds available stock (${maxQuantity} available)`,
        validValue: numValue,
      };
    }

    if (measurementUnit === 2) {
      if (!Number.isInteger(numValue)) {
        return {
          isValid: false,
          errorMessage: "Only whole numbers are allowed for this item",
          validValue: Math.max(1, Math.floor(numValue)),
        };
      }
      if (numValue < 1) {
        return {
          isValid: false,
          errorMessage: "Minimum quantity is 1 piece",
          validValue: 1,
        };
      }
    }

    if (measurementUnit === 1) {
      const minValue = 0.25;
      if (numValue < minValue) {
        return {
          isValid: false,
          errorMessage: `Minimum quantity is ${minValue} kg`,
          validValue: minValue,
        };
      }

      const remainder = (numValue * 100) % 25;
      if (remainder !== 0) {
        const roundedValue = Math.round(numValue * 4) / 4;
        return {
          isValid: false,
          errorMessage: "Quantity must be in increments of 0.25 kg",
          validValue: Math.max(minValue, roundedValue),
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
  const handleInputChange = (itemId: string, value: string, item: CartItem) => {
    setInputValues((prev) => ({ ...prev, [itemId]: value }));

    const maxQuantity = userRole === "buyer" ? stockLevels[itemId] || 999 : 999;
    const validation = validateQuantity(
      value,
      item.measurement_unit as 1 | 2,
      maxQuantity,
      itemId
    );

    if (validation.isValid && parseFloat(value) <= maxQuantity) {
      setInputErrors((prev) => ({ ...prev, [itemId]: "" }));
    } else {
      setInputErrors((prev) => ({
        ...prev,
        [itemId]: validation.errorMessage,
      }));
    }
  };

  // Handle input blur
  const handleInputBlur = (itemId: string, item: CartItem) => {
    const value = inputValues[itemId] || "1";
    const maxQuantity = userRole === "buyer" ? stockLevels[itemId] || 999 : 999;
    const validation = validateQuantity(
      value,
      item.measurement_unit as 1 | 2,
      maxQuantity,
      itemId
    );

    if (!validation.isValid) {
      const correctedValue = validation.validValue;
      setInputValues((prev) => ({
        ...prev,
        [itemId]: correctedValue.toString(),
      }));
      setInputErrors((prev) => ({ ...prev, [itemId]: "" }));

      const updatedCart = cart.map((ci) =>
        ci._id === itemId ? { ...ci, quantity: correctedValue } : ci
      );
      updateCartState(updatedCart);

      if (validation.errorMessage !== `Requested quantity exceeds available stock (${maxQuantity} available)`) {
        toast.error(validation.errorMessage);
      }
    } else {
      const updatedCart = cart.map((ci) =>
        ci._id === itemId ? { ...ci, quantity: validation.validValue } : ci
      );
      updateCartState(updatedCart);
    }
  };

  const confirmAction = async ({
    title,
    text,
    onConfirm,
  }: {
    title: string;
    text: string;
    onConfirm: () => void;
  }) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      onConfirm();
      Swal.fire({
        icon: "success",
        title: "Done!",
        text: "Action completed.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleIncrease = useCallback(
    async (item: CartItem) => {
      const increment = item.measurement_unit === 1 ? 0.25 : 1;
      const newQuantity = item.quantity + increment;

      if (userRole === "buyer") {
        const availableStock = stockLevels[item._id] || 0;
        if (newQuantity > availableStock) {
          toast.error(
            `Cannot increase: Only ${availableStock} units available. Current cart: ${item.quantity}`
          );
          return;
        }
      }

      const updatedCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: newQuantity } : ci
      );

      updateCartState(updatedCart);
    },
    [cart, updateCartState, userRole, stockLevels]
  );

  const handleDecrease = useCallback(
    (item: CartItem) => {
      const decrement = item.measurement_unit === 1 ? 0.25 : 1;
      const minValue = item.measurement_unit === 1 ? 0.25 : 1;

      if (item.quantity <= minValue) return;

      const newQuantity = item.quantity - decrement;
      const finalQuantity = Math.max(newQuantity, minValue);

      const updatedCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: finalQuantity } : ci
      );

      updateCartState(updatedCart);
    },
    [cart, updateCartState]
  );

  // Manual refresh function for the button
  const handleManualRefresh = () => {
    refetchItems();
    toast.success('Stock data refreshed!', { duration: 2000 });
  };

  // Show loading state while fetching inventory data
  if (isLoadingItems && userRole === "buyer") {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Recycle className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-white-900 tracking-tight">
            {t("cart.confirmItems")}
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">{t("cart.check")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Recycle className="w-8 h-8 text-green-600" />
        <h1 className="text-2xl font-bold text-white-800 tracking-tight">
          {t("cart.confirmItems")}
        </h1>
        {userRole === "buyer" && (
          <div className="ml-auto flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Real-time inventory
            <button
              onClick={handleManualRefresh}
              className="ml-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-md transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 bg-gradient-to-br from-green-50 to-blue-50 p-10 rounded-2xl shadow-md transition-all duration-300">
          <Leaf className="w-16 h-16 text-green-500 mb-4 animate-bounce-slow" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {t("cart.emptyCart.title")}
          </h2>
          <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
            {t("cart.emptyCart.description")}
          </p>
          <Button
            onClick={() =>
              router.push(user?.role === "buyer" ? "/marketplace" : "/category")
            }
            className="rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition"
          >
            {t("cart.emptyCart.button")}
          </Button>
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl p-4 mb-6 grid grid-cols-1 ${user?.role == 'customer' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`} style={{ background: "var(--color-green-50)" }}>

            <div className="bg-white p-4 rounded-lg shadow-sm text-center" style={{ background: "var(--background)" }}>
              <div className="text-gray-500 text-sm">
                {t("cart.cartSummary.totalItems")}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {convertNumber(totalItems)}
              </div>
            </div>
            {user?.role == "customer" && (
              <div className="bg-white p-4 rounded-lg shadow-sm text-center" style={{ background: "var(--background)" }}>
                <div className="text-gray-500 text-sm">
                  {t("cart.cartSummary.earnedPoints")}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {convertNumber(totalPoints)}
                </div>
              </div>
            )}
            <div className="bg-white p-4 rounded-lg shadow-sm text-center" style={{ background: "var(--background)" }}>
              <div className="text-gray-500 text-sm">
                {user?.role == "customer"
                  ? t("cart.cartSummary.earnedMoney")
                  : t("cart.cartSummary.payedMoney")}
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {convertNumber(totalPrice.toFixed(2))} {coin}
              </div>
            </div>
          </div>

          <div className="space-y-4 relative">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  style={{ background: "var(--color-card)" }}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${exceedsStockItems[item._id]
                    ? "border-orange-200 bg-orange-50"
                    : "border-gray-100"
                    }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row gap-4 relative">
                    {/* Stock Warning Badge */}
                    {exceedsStockItems[item._id] && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Exceeds Stock
                        </span>
                      </div>
                    )}

                    {/* Low Stock Badge */}
                    {userRole === "buyer" &&
                      !exceedsStockItems[item._id] &&
                      stockLevels[item._id] !== undefined &&
                      stockLevels[item._id] > 0 &&
                      stockLevels[item._id] <
                      item.quantity + (item.measurement_unit === 1 ? 0.25 : 1) && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                            Low Stock
                          </span>
                        </div>
                      )}

                    <div className="bg-green-50 rounded-lg w-full sm:w-24 h-24 flex-shrink-0 flex items-center justify-center relative">
                      {item.image ? (
                        <Image
                          width={100}
                          height={100}
                          src={item.image}
                          alt={item.name[locale]}
                          className="object-contain"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-green-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-800">
                            {item.name[locale]}
                          </h3>
                          <p className="text-sm flex gap-2 text-gray-500 mt-1">
                            {t("cart.item.category")}
                            <span className="text-green-600">
                              {typeof item.categoryName === "string"
                                ? item.categoryName
                                : item.categoryName[locale] ||
                                item.categoryName.en ||
                                ""}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            confirmAction({
                              title: "Remove Item?",
                              text: `Remove ${item.name[locale]} from your recycling collection?`,
                              onConfirm: () => removeFromCart(item),
                            });
                          }}
                          style={{ color: "var(--foreground)"}}
                          className="text-gray-400 hover:text-red-500 transition-colors mt-4 p-2 rounded-md"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-primary">
                          <Scale className="w-4 h-4 mr-1 text-gray-500" />
                          {item.measurement_unit === 1
                            ? t("cart.item.byKilo")
                            : t("cart.item.byPiece")}
                        </div>
                      </div>

                      {userRole === "buyer" && (
                        <div className="text-xs mt-1 flex items-center gap-2">
                          <span className="text-gray-500">
                            Stock: {stockLevels[item._id] ?? "Loading..."} available
                          </span>
                          <button
                            onClick={handleManualRefresh}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            refresh
                          </button>
                          {exceedsStockItems[item._id] && (
                            <span className="text-orange-600 font-semibold">
                              • Cart: {convertNumber(item.quantity)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stock Warning Message */}
                      {stockWarnings[item._id] && (
                        <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded-md">
                          <p className="text-sm text-orange-700 font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {stockWarnings[item._id]}
                          </p>

                        </div>
                      )}

                      <div className="text-emerald-600 text-sm space-y-1 mt-2">
                        <div>
                          <span className="font-semibold text-gray-500">
                            {t("cart.item.price")}:
                          </span>{" "}
                          {convertNumber(item.price.toFixed(2))} {coin}
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200" >
                          {convertNumber(item.quantity)} ×{" "}
                          {convertNumber(item.price.toFixed(2))} =
                          <span className="font-medium text-primary">
                            {convertNumber((item.quantity * item.price).toFixed(2))} {coin}
                          </span>
                        </div>

                      </div>

                      {/* Enhanced Quantity Controls */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDecrease(item);
                              }}
                              disabled={item.quantity <= (item.measurement_unit === 1 ? 0.25 : 1)}
                              style={{ color: "var(--foreground)", background: "var(--color-base-200)" }}
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${item.quantity <= (item.measurement_unit === 1 ? 0.25 : 1)
                                ? "text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-50 border-gray-300"
                                }`}
                            >
                              -
                            </button>

                            <div className="flex flex-col">
                              <input
                                type="text"
                                value={
                                  inputValues[item._id] !== undefined
                                    ? inputValues[item._id]
                                    : convertNumber(item.quantity.toString())
                                }
                                onChange={(e) => handleInputChange(item._id, e.target.value, item)}
                                onBlur={() => handleInputBlur(item._id, item)}
                                className={`w-16 px-2 py-1 text-center text-sm font-medium border rounded-md focus:outline-none focus:ring-2 ${inputErrors[item._id]
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : exceedsStockItems[item._id]
                                    ? "border-orange-300 focus:ring-orange-500 focus:border-orange-500"
                                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                                  }`}
                                placeholder={
                                  item.measurement_unit === 1
                                    ? convertNumber("0.25")
                                    : convertNumber("1")
                                }
                              />
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleIncrease(item);
                              }}
                              disabled={userRole === "buyer" && !canIncrease[item._id]}
                              style={{ color: "var(--foreground)", background: "var(--color-base-200)" }}
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${userRole === "buyer" && !canIncrease[item._id]
                                ? "text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-50 border-gray-300"
                                }`}
                            >
                              +
                            </button>

                            <span className="text-xs text-gray-500">
                              {item.measurement_unit === 1
                                ? t("cart.item.kg")
                                : t("cart.item.items")}
                            </span>
                          </div>
                        </div>

                        {/* Error message */}
                        {inputErrors[item._id] && (
                          <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md p-2">
                            {inputErrors[item._id]}
                          </div>
                        )}

                        {/* Helper text */}
                        <div className="text-xs text-gray-400">
                          {item.measurement_unit === 1
                            ? t("cart.item.minIncrement")
                            : t("cart.item.wholeNumbers")}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow p-6" style={{ background: "var(--color-card)" }}>
            {/* Stock Exceeds Warning */}
            {hasExceedsStockItems && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-orange-800">
                      Some Items Exceed Available Stock
                    </h3>
                    <p className="text-sm text-orange-700 mt-1">
                      You can continue shopping, but please adjust quantities to available stock levels before checkout.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleManualRefresh}
                        className="text-sm bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        🔄 Refresh Stock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center gap-4">
              <Button
                color="light"
                onClick={(e) => {
                  e.preventDefault();
                  confirmAction({
                    title: t("cart.checkout.clearAll"),
                    text: t("cart.checkout.clearConfirm"),
                    onConfirm: clearCart,
                  });
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t("cart.checkout.clearCollection")}
              </Button>

              <div className="flex flex-col items-end">
                <div
                  className={
                    totalPrice < 100 || hasExceedsStockItems
                      ? "pointer-events-none"
                      : ""
                  }
                >
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!hasExceedsStockItems && totalPrice >= 100) {
                        router.push("/pickup");
                      }
                    }}
                    disabled={totalPrice < 100 || hasExceedsStockItems}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg ${totalPrice < 100 || hasExceedsStockItems
                      ? "bg-gray-300 text-white cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                  >
                    <Truck className="w-5 h-5" />
                    {t("cart.checkout.schedulePickup")}
                  </Button>
                </div>
                {totalPrice < 100 && (
                  <p className="text-xs text-red-600 mt-1 text-right">
                    {t("cart.checkout.minAmount")}
                  </p>
                )}
                {hasExceedsStockItems && (
                  <p className="text-xs text-orange-600 mt-1 text-right">
                    Please adjust quantities to available stock levels to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}