"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { CartItem } from "@/models/cart";
import { useUserAuth } from "@/context/AuthFormContext";

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  increaseQty: (item: CartItem) => Promise<void>;
  decreaseQty: (item: CartItem) => Promise<void>;
  removeFromCart: (item: CartItem) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  loadingItemId: string | null;

  checkInventory: (itemId: string, quantity: number) => Promise<boolean>;
  checkInventoryEnhanced: (
    item: CartItem,
    quantity: number
  ) => Promise<boolean>;
  isItemInStock: (item: CartItem) => boolean;
  userRole: "customer" | "buyer";
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { user } = useUserAuth();
  const userRole = user?.role === "buyer" ? "buyer" : "customer";

  const loadCart = useCallback(async () => {
    try {
      const res = await api.get("/cart", { withCredentials: true });
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Failed to load cart", err);
      toast.error("Failed to load cart items");
    }
  }, []);

  const checkInventoryEnhanced = useCallback(
    async (item: CartItem, quantity: number): Promise<boolean> => {
      try {
        const res = await api.get(
          "/categories/get-items?limit=10000&role=buyer"
        );
        const allItems = res.data?.data || [];

        const foundItem = allItems.find(
          (apiItem: any) =>
            apiItem._id === item._id ||
            apiItem.name?.toLowerCase() === item.name?.toLowerCase()
        );

        if (!foundItem) {
          console.warn("Item not found in inventory:", item);
          return false;
        }

        const availableQuantity = foundItem.quantity;
        
        // Check if the item is already in cart and calculate total quantity needed
        const existingCartItem = cart.find(cartItem => cartItem._id === item._id);
        const totalQuantityNeeded = existingCartItem ? 
          existingCartItem.quantity + quantity : quantity;
        
        console.log(`🔍 Inventory check for ${item.name}:`, {
          requestedQuantity: quantity,
          existingInCart: existingCartItem?.quantity || 0,
          totalNeeded: totalQuantityNeeded,
          availableStock: availableQuantity,
          hasEnoughStock: availableQuantity >= totalQuantityNeeded
        });

        return availableQuantity >= totalQuantityNeeded;
      } catch (err) {
        console.error("Failed to check inventory:", err);
        return false;
      }
    },
    [cart]
  );

  const validateQuantity = useCallback(
    (quantity: number, measurementUnit: number): boolean => {
      if (measurementUnit === 1) {
        // For KG items: minimum 0.25, must be in 0.25 increments
        if (quantity < 0.25) return false;
        const multiplied = Math.round(quantity * 4);
        return Math.abs(quantity * 4 - multiplied) < 0.0001;
      }
      // For piece items: must be whole numbers >= 1
      return Number.isInteger(quantity) && quantity >= 1;
    },
    []
  );

  const addToCart = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const validatedItem = { ...item };

        if (
          !validateQuantity(
            validatedItem.quantity,
            validatedItem.measurement_unit
          )
        ) {
          const message =
            validatedItem.measurement_unit === 1
              ? "For KG items, minimum quantity is 0.25 KG and must be in 0.25 increments"
              : "For Piece items, quantity must be whole numbers ≥ 1";
          toast.error(message);
          return;
        }

        if (userRole === "buyer") {
          const isAvailable = await checkInventoryEnhanced(
            validatedItem,
            validatedItem.quantity
          );
          if (!isAvailable) {
            toast.error(
              "Sorry, the requested quantity is not available in stock."
            );
            return;
          }
        }

        await api.post("/cart", validatedItem, { withCredentials: true });
        await loadCart();
        toast.success(`${validatedItem.name} added to cart successfully!`);
      } catch (err) {
        console.error("Failed to add to cart", err);
        toast.error("Failed to add item to cart");
      } finally {
        setLoadingItemId(null);
      }
    },
    [checkInventoryEnhanced, loadCart, userRole, validateQuantity]
  );

  const increaseQty = async (item: CartItem) => {
    try {
      const increment = item.measurement_unit === 1 ? 0.25 : 1;
      const newQuantity = item.quantity + increment;

      // Check inventory before increasing
      if (userRole === "buyer") {
        const res = await api.get("/categories/get-items?limit=10000&role=buyer");
        const allItems = res.data?.data || [];
        const foundItem = allItems.find((apiItem: any) => apiItem._id === item._id);
        
        if (!foundItem || newQuantity > foundItem.quantity) {
          toast.error("Not enough stock available");
          return;
        }
      }

      await api.put(
        "/cart",
        { _id: item._id, quantity: newQuantity },
        { withCredentials: true }
      );
      await loadCart();
    } catch (err) {
      console.error("Failed to increase quantity", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response: { data: { message: string } } };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        }
      }
    }
  };

  const decreaseQty = useCallback(
    async (item: CartItem) => {
      const decrement = item.measurement_unit === 1 ? 0.25 : 1;
      const minValue = item.measurement_unit === 1 ? 0.25 : 1; // Fixed: KG minimum should be 0.25

      if (item.quantity <= minValue) return;

      try {
        const newQuantity = item.quantity - decrement;
        await api.put(
          "/cart",
          { _id: item._id, quantity: newQuantity },
          { withCredentials: true }
        );
        await loadCart();
      } catch (err) {
        console.error("Failed to decrease quantity", err);
        toast.error("Failed to decrease item quantity");
      }
    },
    [loadCart]
  );

  const removeFromCart = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        await api.delete(`/cart/${item._id}`, { withCredentials: true });
        toast.success("Item removed from cart");
        await loadCart();
      } catch (err) {
        console.error("Failed to remove from cart", err);
        toast.error("Failed to remove item from cart");
      } finally {
        setLoadingItemId(null);
      }
    },
    [loadCart]
  );

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart", { withCredentials: true });
      setCart([]);
      toast.success("Cart cleared successfully");
    } catch (err) {
      console.error("Failed to clear cart", err);
      toast.error("Failed to clear cart");
    }
  }, []);

  const contextValue = {
    cart,
    loadingItemId,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    loadCart,
    checkInventory: checkInventoryEnhanced,
    checkInventoryEnhanced,
    isItemInStock: (item: CartItem) => (item.quantity ?? 0) > 0,
    userRole,
  };

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}