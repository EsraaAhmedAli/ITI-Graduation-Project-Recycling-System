"use client";
import { useCart } from "@/context/CartContext";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { X, Leaf, Recycle, Truck, Scale, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "flowbite-react";
import Image from "next/image";
import { useUserAuth } from "@/context/AuthFormContext";
import { CartItem } from "@/models/cart";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    clearCart,

    userRole,
    updateCartState,
  } = useCart();
  const router = useRouter();
  const [totalItems, setTotalItems] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { user } = useUserAuth();
  const [canIncrease, setCanIncrease] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);
  const [stockLevels, setStockLevels] = useState<{ [key: string]: number }>({});

  // States for input handling
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});

  // Use ref to track if we're currently checking inventory to prevent multiple calls
  const isCheckingRef = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize input values when cart changes
  useEffect(() => {
    const newInputValues: { [key: string]: string } = {};
    cart.forEach((item) => {
      newInputValues[item._id] = item.quantity.toString();
    });
    setInputValues(newInputValues);
  }, [cart]);

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

  // Handle input blur (when user finishes typing)
  const handleInputBlur = (itemId: string, item: CartItem) => {
    const value = inputValues[itemId] || "1";
    const maxQuantity = userRole === "buyer" ? stockLevels[itemId] || 999 : 999;
    const validation = validateQuantity(
      value,
      item.measurement_unit as 1 |2,
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

  // Use the exact same API call from your CartContext's checkInventoryEnhanced
  const getStockLevels = useCallback(async () => {
    if (userRole !== "buyer") return {};

    try {
      // This is the exact API call from your checkInventoryEnhanced function
      const res = await api.get("/categories/get-items?limit=10000&role=buyer");
      const allItems = res.data?.data || [];

      const stockMap: { [key: string]: number } = {};
      cart.forEach((cartItem) => {
        const foundItem = allItems.find(
          (apiItem: any) => apiItem._id === cartItem._id
        );
        stockMap[cartItem._id] = foundItem?.quantity || 0;
      });

      return stockMap;
    } catch (error) {
      console.error("Error getting stock levels:", error);
      // Fallback to assume items are available
      const stockMap: { [key: string]: number } = {};
      cart.forEach((cartItem) => {
        stockMap[cartItem._id] = 999; // High number as fallback
      });
      return stockMap;
    }
  }, [userRole, cart]);

  // Debounced inventory check function
  const debouncedInventoryCheck = useCallback(async () => {
    if (isCheckingRef.current || userRole !== "buyer" || cart.length === 0) {
      return;
    }

    isCheckingRef.current = true;
    setIsCheckingInventory(true);

    try {
      const results: { [key: string]: boolean } = {};
      const stockMap = await getStockLevels();
      setStockLevels(stockMap);

      for (const item of cart) {
        const increment = item.measurement_unit === 1 ? 0.25 : 1;
        const availableStock = stockMap[item._id] || 0;
        results[item._id] = availableStock >= item.quantity + increment;
      }

      setCanIncrease(results);
    } catch (error) {
      console.error("Error checking inventory:", error);
    } finally {
      setIsCheckingInventory(false);
      isCheckingRef.current = false;
    }
  }, [cart, userRole, getStockLevels]);

  // Debounced effect for inventory checking
  useEffect(() => {
    if (userRole !== "buyer") {
      // For non-buyers, always allow increase
      const results: { [key: string]: boolean } = {};
      cart.forEach((item) => {
        results[item._id] = true;
      });
      setCanIncrease(results);
      return;
    }

    // Clear existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Set new timeout for debounced check
    checkTimeoutRef.current = setTimeout(() => {
      debouncedInventoryCheck();
    }, 500); // 500ms debounce

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [cart, userRole, debouncedInventoryCheck]);

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

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Recycle className="w-8 h-8 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          Confirm items you want to recycle
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 bg-gradient-to-br from-green-50 to-blue-50 p-10 rounded-2xl shadow-md transition-all duration-300">
          <Leaf className="w-16 h-16 text-green-500 mb-4 animate-bounce-slow" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your recycling bin is empty
          </h2>
          <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
            Start making a positive impact on the environment. Browse available
            recyclable items and add them to your bin!
          </p>
          <Button
            onClick={() =>
              router.push(user?.role === "buyer" ? "/marketplace" : "/category")
            }
            className="rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition">
            Browse Recyclable Items
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-green-50 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-sm">Total Items</div>
              <div className="text-2xl font-bold text-green-600">
                {totalItems}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-sm">Earned Points</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalPoints}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-sm">Earned Money</div>
              <div className="text-2xl font-bold text-emerald-600">
                {totalPrice.toFixed(2)} EGP
              </div>
            </div>
          </div>

          <div className="space-y-4 relative">
            {isCheckingInventory && (
              <div className="absolute top-0 right-0 z-10 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                  <span className="text-sm text-gray-600">
                    Checking stock...
                  </span>
                </div>
              </div>
            )}

            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="bg-green-50 rounded-lg w-full sm:w-24 h-24 flex-shrink-0 flex items-center justify-center relative">
                      {item.image ? (
                        <Image
                          width={100}
                          height={100}
                          src={item.image}
                          alt={item.name}
                          className="object-contain"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-green-300" />
                      )}
                    </div>

                    <div className="flex-1">
                     
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Category:{" "}
                          <span className="text-green-600">
                            {item.categoryName}
                          </span>
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            confirmAction({
                              title: "Remove Item?",
                              text: `Remove ${item.name} from your recycling collection?`,
                              onConfirm: () => removeFromCart(item),
                            });
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Scale className="w-4 h-4 mr-1" />
                          {item.measurement_unit === 1 ? "By Kilo" : "By Piece"}
                        </div>
                        <div className="text-green-600 font-medium">
                          {item.points} points each
                        </div>
                        <div className="text-blue-600">
                          Saves {item.co2_saved || 0} kg CO₂
                        </div>
                      </div>

                      {userRole === "buyer" && (
                        <div className="text-xs text-gray-500 mt-1">
                          Stock: {stockLevels[item._id] ?? "Loading..."}{" "}
                          available
                        </div>
                      )}

                      <div className="text-emerald-600 text-sm space-y-1 mt-2">
                        <div>
                          <span className="font-semibold">Price:</span>{" "}
                          {item.price.toFixed(2)} EGP
                        </div>
                        <div className="text-gray-600 text-sm">
                          {item.quantity} × {item.price.toFixed(2)} ={" "}
                          <span className="font-medium">
                            {(item.quantity * item.price).toFixed(2)} EGP
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
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
                                item.quantity <=
                                (item.measurement_unit === 1 ? 0.25 : 1)
                                  ? "text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-50 border-gray-300"
                              }`}
                              disabled={
                                item.quantity <=
                                (item.measurement_unit === 1 ? 0.25 : 1)
                              }>
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
                                className={`w-16 px-2 py-1 text-center text-sm font-medium border rounded-md focus:outline-none focus:ring-2 ${
                                  inputErrors[item._id]
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
                                userRole === "buyer" && !canIncrease[item._id]
                              }
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all ${
                                userRole === "buyer" && !canIncrease[item._id]
                                  ? "text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-50 border-gray-300"
                              }`}>
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
                            ? "Min: 0.25 kg, increments of 0.25 kg"
                            : "Whole numbers only"}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center gap-4">
              <Button
                color="light"
                onClick={(e) => {
                  e.preventDefault();
                  confirmAction({
                    title: "Clear All?",
                    text: "Are you sure you want to remove all items from your recycling collection?",
                    onConfirm: clearCart,
                  });
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50">
                Clear Collection
              </Button>

              <div className="flex flex-col items-end">
                <div className={totalPrice < 100 ? "pointer-events-none" : ""}>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/pickup");
                    }}
                    disabled={totalPrice < 100}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg ${
                      totalPrice < 100
                        ? "bg-gray-300 text-white cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}>
                    <Truck className="w-5 h-5" />
                    Schedule Pickup
                  </Button>
                </div>
                {totalPrice < 100 && (
                  <p className="text-xs text-red-600 mt-1 text-right">
                    You should reach at least 100 EGP
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
