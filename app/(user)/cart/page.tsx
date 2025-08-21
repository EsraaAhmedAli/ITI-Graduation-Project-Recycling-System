"use client";
import { useCart } from "@/context/CartContext";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { X, Leaf, Recycle, Truck, Scale, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "flowbite-react";
import Image from "next/image";
import { useUserAuth } from "@/context/AuthFormContext";
import { CartItem } from "@/models/cart";
import { toast } from "react-hot-toast";
import { useGetItems } from "@/hooks/useGetItems"; // Import your hook
import { useLanguage } from "@/context/LanguageContext";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function CartPage() {
  const { cart, removeFromCart, clearCart, userRole, updateCartState } =
    useCart();
  const router = useRouter();
  const [totalItems, setTotalItems] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { user } = useUserAuth();
  // States for input handling
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});

  // Out of stock tracking
  const [outOfStockItems, setOutOfStockItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [hasOutOfStockItems, setHasOutOfStockItems] = useState(false);
  const [canIncrease, setCanIncrease] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Use React Query to get real-time inventory data
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useGetItems({
    currentPage: 1,
    itemsPerPage: 10000, // Get all items to ensure we have stock data for cart items
    userRole: userRole || "buyer",
  });

  // Create a stock levels map from the React Query data
  const stockLevels = useMemo(() => {
    if (!itemsData?.data || userRole !== "buyer") return {};

    const stockMap: { [key: string]: number } = {};
    cart.forEach((cartItem) => {
      const foundItem = itemsData.data.find(
        (apiItem: any) => apiItem._id === cartItem._id
      );
      stockMap[cartItem._id] = foundItem?.quantity || 0;
    });

    return stockMap;
  }, [itemsData, cart, userRole]);


   console.log("Esraa");
  // Check inventory status whenever stockLevels or cart changes
  useEffect(() => {
    if (userRole !== "buyer" || cart.length === 0) {
      const results: { [key: string]: boolean } = {};
      const outOfStock: { [key: string]: boolean } = {};
      cart.forEach((item) => {
        results[item._id] = true;
        outOfStock[item._id] = false;
      });
      setCanIncrease(results);
      setOutOfStockItems(outOfStock);
      setHasOutOfStockItems(false);
      return;
    }

    const results: { [key: string]: boolean } = {};
    const outOfStock: { [key: string]: boolean } = {};
    let hasAnyOutOfStock = false;

    cart.forEach((item) => {
      const increment = item.measurement_unit === 1 ? 0.25 : 1;
      const availableStock = stockLevels[item._id] || 0;

      // Check if item is out of stock (quantity in cart exceeds available stock)
      const isOutOfStock = availableStock < item.quantity;
      outOfStock[item._id] = isOutOfStock;

      if (isOutOfStock) {
        hasAnyOutOfStock = true;
      }

      // Check if we can increase quantity
      results[item._id] = availableStock >= item.quantity + increment;
    });

    setCanIncrease(results);
    setOutOfStockItems(outOfStock);
    setHasOutOfStockItems(hasAnyOutOfStock);
  }, [cart, userRole, stockLevels]);

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

  // Auto-remove out of stock items after a delay (optional)
  useEffect(() => {
    if (hasOutOfStockItems) {
      const timer = setTimeout(() => {
        // Show a toast notification about out of stock items
        toast.error(
          "Some items in your cart are out of stock. Please review and remove them."
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasOutOfStockItems]);

  // Validation function for quantity input
  const validateQuantity = (
    value: string,
    measurementUnit: 1 | 2,
    maxQuantity: number,
    itemId: string
  ): { isValid: boolean; errorMessage: string; validValue: number } => {
    const numValue = parseFloat(value);

    // Check if it's a valid number
    if (isNaN(numValue) || numValue <= 0) {
      return {
        isValid: false,
        errorMessage: "Please enter a valid quantity",
        validValue: measurementUnit === 1 ? 0.25 : 1,
      };
    }

    // Check maximum limit (for buyers only)
    if (userRole === "buyer" && numValue > maxQuantity) {
      return {
        isValid: false,
        errorMessage: `Maximum available quantity is ${maxQuantity}`,
        validValue: maxQuantity,
      };
    }

    // For measurement unit 2 (pieces) - only whole numbers, minimum 1
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

    // For measurement unit 1 (kg) - minimum 0.25, multiples of 0.25
    if (measurementUnit === 1) {
      const minValue = 0.25;
      if (numValue < minValue) {
        return {
          isValid: false,
          errorMessage: `Minimum quantity is ${minValue} kg`,
          validValue: minValue,
        };
      }

      // Check if it's a multiple of 0.25
      const remainder = (numValue * 100) % 25; // Convert to avoid floating point issues
      if (remainder !== 0) {
        const roundedValue = Math.round(numValue * 4) / 4; // Round to nearest 0.25
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

    if (validation.isValid) {
      setInputErrors((prev) => ({ ...prev, [itemId]: "" }));
    } else {
      setInputErrors((prev) => ({
        ...prev,
        [itemId]: validation.errorMessage,
      }));
    }
  };
  const { t, locale, convertNumber } = useLanguage();
  const coin = locale === "en" ? "EGP" : "ج.م";

  // Handle input blur (when user finishes typing)
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
      // Auto-correct to valid value
      const correctedValue = validation.validValue;
      setInputValues((prev) => ({
        ...prev,
        [itemId]: correctedValue.toString(),
      }));
      setInputErrors((prev) => ({ ...prev, [itemId]: "" }));

      // Update cart with corrected value
      const updatedCart = cart.map((ci) =>
        ci._id === itemId ? { ...ci, quantity: correctedValue } : ci
      );
      updateCartState(updatedCart);

      // Show toast with correction message
      toast.error(validation.errorMessage);
    } else {
      // Update cart with valid value
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

      // Check stock availability for buyers before allowing increase
      if (userRole === "buyer") {
        const availableStock = stockLevels[item._id] || 0;
        if (newQuantity > availableStock) {
          toast.error(
            `Sorry, only ${availableStock} units available in stock. You currently have ${item.quantity} in your cart.`
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

      // Ensure we don't go below minimum
      const finalQuantity = Math.max(newQuantity, minValue);

      const updatedCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: finalQuantity } : ci
      );

      updateCartState(updatedCart);
    },
    [cart, updateCartState]
  );

  // Function to handle removing all out of stock items
  const handleRemoveOutOfStockItems = async () => {
    const result = await Swal.fire({
      title: "Remove Out of Stock Items?",
      text: "This will remove all items that are currently out of stock from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove Them",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      const availableItems = cart.filter((item) => !outOfStockItems[item._id]);
      updateCartState(availableItems);

      Swal.fire({
        icon: "success",
        title: "Items Removed!",
        text: "Out of stock items have been removed from your cart.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Show loading state while fetching inventory data
  if (isLoadingItems && userRole === "buyer") {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Recycle className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-white-900 tracking-tight">
            Confirm items you want to recycle
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
            {t("cart.liveInventory")}
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
           className={`rounded-xl p-4 mb-6 grid grid-cols-1 ${user?.role == 'customer' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`} style={{background:"var(--color-green-50)"}}>
          
            <div className="bg-white p-4 rounded-lg shadow-sm text-center" style={{background:"var(--background)"}}>
              <div className="text-gray-500 text-sm">
                {t("cart.cartSummary.totalItems")}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {convertNumber(totalItems)}
              </div>
            </div>
            {user?.role == "customer" && (
              <div className="bg-white p-4 rounded-lg shadow-sm text-center" style={{background:"var(--background)"}}>
                <div className="text-gray-500 text-sm">
                  {t("cart.cartSummary.earnedPoints")}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {convertNumber(totalPoints)}
                </div>
              </div>
            )}
            <div className="bg-white p-4 rounded-lg shadow-sm text-center" style={{background:"var(--background)"}}>
              <div className="text-gray-500 text-sm" >
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
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                    outOfStockItems[item._id]
                      ? "border-red-200 bg-red-50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row gap-4 relative">
                    {/* Out of Stock Badge */}
                    {outOfStockItems[item._id] && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                          {t("cart.item.outOfStock")}
                        </span>
                      </div>
                    )}

                    {/* Stock Warning Badge */}
                    {userRole === "buyer" &&
                      !outOfStockItems[item._id] &&
                      stockLevels[item._id] !== undefined &&
                      stockLevels[item._id] > 0 &&
                      stockLevels[item._id] <
                        item.quantity +
                          (item.measurement_unit === 1 ? 0.25 : 1) && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                            {t("cart.item.lowStock")}
                          </span>
                        </div>
                      )}

                    <div
                      className={`bg-green-50 rounded-lg w-full sm:w-24 h-24 flex-shrink-0 flex items-center justify-center relative ${
                        outOfStockItems[item._id] ? "opacity-50" : ""
                      }`}
                    >
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
                          <h3
                            className={`text-lg font-medium ${
                              outOfStockItems[item._id]
                                ? "text-gray-500 line-through"
                                : "text-gray-800"
                            }`}
                          >
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
                              text: `Remove ${item.name} from your recycling collection?`,
                              onConfirm: () => removeFromCart(item),
                            });
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-2"
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
                          <span
                            className={`${
                              outOfStockItems[item._id]
                                ? "text-red-600 font-semibold"
                                : "text-gray-500"
                            }`}
                          >
                            {t("cart.item.stock")}:{" "}
                            {stockLevels[item._id] ?? "Loading..."} available
                          </span>
                          {outOfStockItems[item._id] && (
                            <span className="text-red-600 font-semibold">
                              • {t("cart.item.requested")}:{" "}
                              {convertNumber(item.quantity)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Out of Stock Warning Message */}
                      {outOfStockItems[item._id] && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 font-medium">
                            {t("cart.item.outOfStockWarning")}
                            {stockLevels[item._id] > 0
                              ? ` Only ${
                                  stockLevels[item._id]
                                } available, but you have ${
                                  item.quantity
                                } in cart.`
                              : " No stock available."}
                          </p>
                        </div>
                      )}

                      <div
                        className={`text-emerald-600 text-sm space-y-1 mt-2 ${
                          outOfStockItems[item._id] ? "opacity-50" : ""
                        }`}
                      >
                        <div>
                          <span className="font-semibold  text-gray-500">
                            {t("cart.item.price")}:
                          </span>{" "}
                          {convertNumber(item.price.toFixed(2))} {coin}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {convertNumber(item.quantity)} ×{" "}
                          {convertNumber(item.price.toFixed(2))} =
                          <span className="font-medium text-primary">
                            {convertNumber(
                              (item.quantity * item.price).toFixed(2)
                            )}{" "}
                            {coin}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Quantity Controls - Disabled for out of stock items */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDecrease(item);
                              }}
                              disabled={
                                outOfStockItems[item._id] ||
                                item.quantity <=
                                  (item.measurement_unit === 1 ? 0.25 : 1)
                              }
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
                                outOfStockItems[item._id] ||
                                item.quantity <=
                                  (item.measurement_unit === 1 ? 0.25 : 1)
                                  ? "text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-50 border-gray-300"
                              }`}
                            >
                              -
                            </button>

                            {/* Input Field */}
                            <div className="flex flex-col">
                              <input
                                type="text"
                                value={
                                  inputValues[item._id] !== undefined
                                    ? inputValues[item._id]
                                    : item.quantity.toString()
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    item._id,
                                    e.target.value,
                                    item
                                  )
                                }
                                onBlur={() => handleInputBlur(item._id, item)}
                                disabled={outOfStockItems[item._id]}
                                className={`w-16 px-2 py-1 text-center text-sm font-medium border rounded-md focus:outline-none focus:ring-2 ${
                                  outOfStockItems[item._id]
                                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                                    : inputErrors[item._id]
                                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                                }`}
                                placeholder={
                                  item.measurement_unit === 1 ? "0.25" : "1"
                                }
                              />
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleIncrease(item);
                              }}
                              disabled={
                                outOfStockItems[item._id] ||
                                (userRole === "buyer" && !canIncrease[item._id])
                              }
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
                                outOfStockItems[item._id] ||
                                (userRole === "buyer" && !canIncrease[item._id])
                                  ? "text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-50 border-gray-300"
                              }`}
                            >
                              +
                            </button>

                            <span className="text-xs text-gray-500">
                              {item.measurement_unit === 1 ? "kg" : "items"}
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

          <div className="mt-8 bg-white rounded-xl shadow p-6" style={{background:"var(--color-card)"}}>
            {/* Out of Stock Warning */}
            {hasOutOfStockItems && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-red-500 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      {t("cart.checkout.outOfStockTitle")}
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {t("cart.checkout.outOfStockMessage")}
                    </p>
                    <button
                      onClick={handleRemoveOutOfStockItems}
                      className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
                    >
                      {t("cart.checkout.removeOutOfStock")}
                    </button>
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
                    totalPrice < 100 || hasOutOfStockItems
                      ? "pointer-events-none"
                      : ""
                  }
                >
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!hasOutOfStockItems && totalPrice >= 100) {
                        router.push("/pickup");
                      }
                    }}
                    disabled={totalPrice < 100 || hasOutOfStockItems}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg ${
                      totalPrice < 100 || hasOutOfStockItems
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
                {hasOutOfStockItems && (
                  <p className="text-xs text-red-600 mt-1 text-right">
                    {t("cart.checkout.removeOutOfStockToContinue")}
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
