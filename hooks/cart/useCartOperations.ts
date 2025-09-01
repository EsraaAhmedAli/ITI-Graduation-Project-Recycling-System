import api from "@/lib/axios";
import { CartItem } from "@/models/cart";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useCartOperations = ({
  isLoggedIn,
  clearCartFromSession,
  t,
  locale,
  setIsLoading,
  setLoadingItemId,
  cart,
  userRole,
  updateCartState,
  checkInventoryEnhanced,
}) => {
  // Validation helpers
  const validateQuantity = useCallback(
    (quantity: number, measurementUnit: number): boolean => {
      if (measurementUnit === 1) {
        // For kg items: minimum 0.25, increments of 0.25
        if (quantity < 0.25) return false;
        const multiplied = Math.round(quantity * 4);
        return Math.abs(quantity * 4 - multiplied) < 0.0001;
      }
      // For piece items: whole numbers ≥ 1
      return Number.isInteger(quantity) && quantity >= 1;
    },
    []
  );

  const addToCart = useCallback(
    async (item: CartItem, replace = false) => {
      console.log(item, "itemfromAddtocar");

      setLoadingItemId(item._id);
      try {
        const validatedItem = { ...item };

        // Set minimum quantities based on measurement unit
        if (
          validatedItem.measurement_unit === 1 &&
          validatedItem.quantity < 0.25
        ) {
          validatedItem.quantity = 0.25;
        } else if (
          validatedItem.measurement_unit === 2 &&
          validatedItem.quantity < 1
        ) {
          validatedItem.quantity = 1;
        }

        if (
          !validateQuantity(
            validatedItem.quantity,
            validatedItem.measurement_unit
          )
        ) {
          console.error("Invalid quantity for item:", validatedItem);
          return;
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(
          (ci) => ci._id === validatedItem._id
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity - use replace logic
          const newQuantity = replace
            ? validatedItem.quantity // Replace with new quantity
            : cart[existingItemIndex].quantity + validatedItem.quantity; // Add to existing

          if (userRole === "buyer") {
            const isAvailable = await checkInventoryEnhanced(
              validatedItem,
              newQuantity
            );
            if (!isAvailable) {
              console.error("Requested quantity not available in stock");
              return;
            }
          }

          const updatedCart = [...cart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: newQuantity,
          };
          await updateCartState(updatedCart);
        } else {
          // Add new item
          if (userRole === "buyer") {
            const isAvailable = await checkInventoryEnhanced(
              validatedItem,
              validatedItem.quantity
            );
            if (!isAvailable) {
              console.error("Requested quantity not available in stock");
              return;
            }
          }

          const updatedCart = [...cart, validatedItem];
          await updateCartState(updatedCart);
        }

        toast.success(
          t("toast.cart.add.success", { itemName: item.name[locale] })
        );
      } catch (err) {
        console.error(
          t("toast.cart.add.fail", { itemName: item.name[locale] })
        );
      } finally {
        setLoadingItemId(null);
      }
    },
    [
      cart,
      checkInventoryEnhanced,
      userRole,
      validateQuantity,
      updateCartState,
      t,
      locale,
      setLoadingItemId,
    ]
  );

  const updateQuantity = useCallback(
    (item: CartItem) => {
      const updatedCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: item.quantity } : ci
      );
      updateCartState(updatedCart);
    },
    [cart, updateCartState]
  );

  const increaseQty = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const increment = item.measurement_unit === 1 ? 0.25 : 1;
        const newQuantity = item.quantity + increment;

        // Check inventory for buyers
        if (userRole === "buyer") {
          const isAvailable = await checkInventoryEnhanced(item, newQuantity);
          if (!isAvailable) {
            console.error("Not enough stock available");
            return;
          }
        }

        const updatedCart = cart.map((ci) =>
          ci._id === item._id ? { ...ci, quantity: newQuantity } : ci
        );

        await updateCartState(updatedCart);
      } catch (err) {
        console.error("Failed to increase quantity", err);
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, userRole, checkInventoryEnhanced, updateCartState, setLoadingItemId]
  );

  const decreaseQty = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const decrement = item.measurement_unit === 1 ? 0.25 : 1;
        const minValue = item.measurement_unit === 1 ? 0.25 : 1;

        if (item.quantity <= minValue) return;

        const newQuantity = Math.max(item.quantity - decrement, minValue);
        const updatedCart = cart.map((ci) =>
          ci._id === item._id ? { ...ci, quantity: newQuantity } : ci
        );

        await updateCartState(updatedCart);
      } catch (err) {
        console.error("Failed to decrease quantity", err);
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, updateCartState, setLoadingItemId]
  );

  const removeFromCart = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const updatedCart = cart.filter((ci) => ci._id !== item._id);
        await updateCartState(updatedCart);
        toast.success(
          t("toast.cart.remove.success", { itemName: item.name[locale] })
        );
      } catch (err) {
        toast.error(
          t("toast.cart.remove.fail", { itemName: item.name[locale] })
        );
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, updateCartState, setLoadingItemId, t, locale]
  );

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await updateCartState([]);

      // Also clear from database/session immediately
      if (isLoggedIn) {
        try {
          await api.delete("/cart", { withCredentials: true });
        } catch (error) {
          console.error("Failed to clear cart from database:", error);
        }
      } else {
        clearCartFromSession();
      }

      toast.success(t("toast.cart.clear.success"));
    } catch (err) {
      toast.error(t("toast.cart.clear.fail"));
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, updateCartState, clearCartFromSession, setIsLoading, t]);

  return {
    validateQuantity,
    addToCart,
    updateQuantity,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
  };
};
