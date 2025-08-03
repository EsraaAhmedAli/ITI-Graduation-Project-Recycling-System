"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
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
  updateQuantity: (item: CartItem) => void;
  checkInventory: (itemId: string, quantity: number) => Promise<boolean>;
  checkInventoryEnhanced: (
    item: CartItem,
    quantity: number
  ) => Promise<boolean>;
  isItemInStock: (item: CartItem) => boolean;
  updateCartState: (newCart: CartItem[]) => Promise<void>; // Made async
  userRole: "customer" | "buyer";
  isSaving: boolean; // Added saving state
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
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUserAuth();
  const [cartChanged, setCartChanged] = useState(false);
  const userRole = user?.role === "buyer" ? "buyer" : "customer";
  
  // Ref for debouncing save operations
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced updateCartState that actually persists to backend
  const updateCartState = useCallback(async (newCart: CartItem[]) => {
    setCart(newCart);
    setCartChanged(true);
    setIsSaving(true);
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save operation (saves after 800ms of inactivity)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(
          "/cart/save",
          { items: newCart },
          { withCredentials: true }
        );
        console.log("Cart saved to backend successfully");
        setCartChanged(false); // Reset the changed flag after successful save
      } catch (error) {
        console.error("Failed to save cart to backend:", error);
        // Fallback: save to localStorage for later sync
        localStorage.setItem("unsynced_cart", JSON.stringify(newCart));
        toast.error("Changes saved locally. Will sync when connection is restored.");
      } finally {
        setIsSaving(false);
      }
    }, 800);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Beacon API for saving on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!cartChanged) return;

      const payload = JSON.stringify({ items: cart });
      const blob = new Blob([payload], { type: "application/json" });

      const success = navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cart/save`,
        blob
      );

      console.log("Beacon sent on unload:", success);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cart, cartChanged]);

  const loadCart = useCallback(async () => {
    try {
      const res = await api.get("/cart", { withCredentials: true });
      const serverCart = res.data.items || [];

      // Check for unsynced local changes
      const unsynced = localStorage.getItem("unsynced_cart");

      if (unsynced) {
        const localCart: CartItem[] = JSON.parse(unsynced);
        localStorage.removeItem("unsynced_cart");

        // Merge or replace with local cart
        await api.post(
          "/cart/save",
          { items: localCart },
          { withCredentials: true }
        );
        setCart(localCart); // Use local cart since it has newer changes
        toast.success("Local changes synced successfully");
      } else {
        setCart(serverCart); // Use server cart
      }

      setCartChanged(false); // Reset changed flag
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
          (apiItem: any) => apiItem._id === item._id
        );

        if (!foundItem || typeof foundItem.quantity !== "number") {
          console.warn("Item not found or has invalid quantity:", item);
          return false;
        }

        const availableQuantity = foundItem.quantity;
        console.log(
          `Available: ${availableQuantity} vs Requested: ${quantity}`
        );
        return availableQuantity >= quantity;
      } catch (err) {
        console.error("Failed to check inventory:", err);
        return false;
      }
    },
    []
  );

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
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const validatedItem = { ...item };
        
        // Set minimum quantities based on measurement unit
        if (validatedItem.measurement_unit === 1 && validatedItem.quantity < 0.25) {
          validatedItem.quantity = 0.25;
        } else if (validatedItem.measurement_unit === 2 && validatedItem.quantity < 1) {
          validatedItem.quantity = 1;
        }

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

  const updateQuantity = useCallback((item: CartItem) => {
    const updatedCart = cart.map((ci) =>
      ci._id === item._id ? { ...ci, quantity: item.quantity } : ci
    );
    updateCartState(updatedCart);
  }, [cart, updateCartState]);

  const increaseQty = useCallback(async (item: CartItem) => {
    try {
      const increment = item.measurement_unit === 1 ? 0.25 : 1;
      const newQuantity = item.quantity + increment;
      
      // Check inventory for buyers
      if (userRole === "buyer") {
        const isAvailable = await checkInventoryEnhanced(item, newQuantity);
        if (!isAvailable) {
          toast.error("Sorry, not enough stock available.");
          return;
        }
      }
      
      const updatedCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: newQuantity } : ci
      );
      
      await updateCartState(updatedCart);
      
    } catch (err) {
      console.error("Failed to increase quantity", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response: { data: { message: string } } };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        }
      }
    }
  }, [cart, userRole, checkInventoryEnhanced, updateCartState]);

  const decreaseQty = useCallback(
    async (item: CartItem) => {
      const decrement = item.measurement_unit === 1 ? 0.25 : 1;
      const minValue = item.measurement_unit === 1 ? 0.25 : 1;

      if (item.quantity <= minValue) return;

      try {
        const newQuantity = Math.max(item.quantity - decrement, minValue);
        
        const updatedCart = cart.map((ci) =>
          ci._id === item._id ? { ...ci, quantity: newQuantity } : ci
        );
        
        await updateCartState(updatedCart);
        
      } catch (err) {
        console.error("Failed to decrease quantity", err);
        toast.error("Failed to decrease item quantity");
      }
    },
    [cart, updateCartState]
  );

  const removeFromCart = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const updatedCart = cart.filter((ci) => ci._id !== item._id);
        await updateCartState(updatedCart);
        
        // Also remove from backend directly
        await api.delete(`/cart/${item._id}`, { withCredentials: true });
        toast.success("Item removed from cart");
      } catch (err) {
        console.error("Failed to remove from cart", err);
        toast.error("Failed to remove item from cart");
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, updateCartState]
  );

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart", { withCredentials: true });
      setCart([]);
      setCartChanged(false);
      toast.success("Cart cleared successfully");
    } catch (err) {
      console.error("Failed to clear cart", err);
      toast.error("Failed to clear cart");
    }
  }, []);

  // Basic inventory check (legacy)
  const checkInventory = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      const item = cart.find(ci => ci._id === itemId);
      if (!item) return false;
      return checkInventoryEnhanced(item, quantity);
    },
    [cart, checkInventoryEnhanced]
  );

  const contextValue = {
    cart,
    loadingItemId,
    isSaving,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    loadCart,
    checkInventory,
    checkInventoryEnhanced,
    isItemInStock: (item: CartItem) => (item.quantity ?? 0) > 0,
    userRole,
    updateQuantity,
    updateCartState,
  };

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}