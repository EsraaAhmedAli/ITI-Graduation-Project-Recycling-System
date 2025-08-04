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
  updateCartState: (newCart: CartItem[]) => void;
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

const CART_SESSION_KEY = "guest_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { user } = useUserAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [cartDirty, setCartDirty] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userRole = user?.role === "buyer" ? "buyer" : "customer";
  const isLoggedIn = !!user?._id;

  // Session storage helpers
  const saveCartToSession = useCallback((cartItems: CartItem[]) => {
    try {
      localStorage.setItem(CART_SESSION_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to session:", error);
    }
  }, []);

  const loadCartFromSession = useCallback((): CartItem[] => {
    try {
      const stored = localStorage.getItem(CART_SESSION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load cart from session:", error);
      return [];
    }
  }, []);

  const clearCartFromSession = useCallback(() => {
    try {
      localStorage.removeItem(CART_SESSION_KEY);
    } catch (error) {
      console.error("Failed to clear cart from session:", error);
    }
  }, []);

  // Database helpers
  const saveCartToDatabase = useCallback(
    async (cartItems: CartItem[]) => {
      if (!isLoggedIn) return;

      try {
        await api.post(
          "/cart/save",
          { items: cartItems },
          { withCredentials: true }
        );
        console.log("Cart saved to database");
      } catch (error) {
        console.error("Failed to save cart to database:", error);
        throw error;
      }
    },
    [isLoggedIn]
  );

  const loadCartFromDatabase = useCallback(async (): Promise<CartItem[]> => {
    if (!isLoggedIn) return [];

    try {
      const res = await api.get("/cart", { withCredentials: true });
      return res.data.items || [];
    } catch (error) {
      console.error("Failed to load cart from database:", error);
      throw error;
    }
  }, [isLoggedIn]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!cartDirty) return;

      try {
        if (isLoggedIn) {
          await saveCartToDatabase(cart);
        } else {
          saveCartToSession(cart);
        }
        setCartDirty(false);
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    }, 1000); // Save after 1 second of inactivity
  }, [cart, cartDirty, isLoggedIn, saveCartToDatabase, saveCartToSession]);

  // Update cart state and mark as dirty
  const updateCartState = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    setCartDirty(true);
  }, []);

  // Load cart based on authentication state
  const loadCart = useCallback(async () => {
    try {
      let cartItems: CartItem[] = [];

      if (isLoggedIn) {
        cartItems = await loadCartFromDatabase();
      } else {
        cartItems = loadCartFromSession();
      }

      setCart(cartItems);
      setCartDirty(false);
    } catch (error) {
      console.error("Failed to load cart:", error);
      toast.error("Failed to load cart items");
    }
  }, [isLoggedIn, loadCartFromDatabase, loadCartFromSession]);

  // Handle user authentication changes
  useEffect(() => {
    const newUserId = user?._id || null;
    const userChanged = currentUserId !== newUserId;

    if (userChanged) {
      const wasLoggedOut = currentUserId && !newUserId; // User logged out
      const wasLoggedIn = !currentUserId && newUserId; // User logged in (from guest)
      const userSwitched =
        currentUserId && newUserId && currentUserId !== newUserId; // Different user logged in

      if (wasLoggedOut) {
        // User logged out - save current cart to session and keep it
        console.log("User logged out - saving cart to session");
        saveCartToSession(cart);
      } else if (wasLoggedIn) {
        // User logged in from guest - DO NOT merge carts, just load user's database cart
        console.log("User logged in - loading user's database cart only");

        // Clear current cart first to avoid mixing
        setCart([]);
        setCartDirty(false);

        // Don't merge session cart - each user should have their own isolated cart
        // Just load the user's database cart
        loadCart();

        // Optionally: Ask user if they want to merge (but for now, keep separate)
        const sessionCart = loadCartFromSession();
        if (sessionCart.length > 0) {
          console.log(
            `Guest session had ${sessionCart.length} items - keeping separate`
          );
          // Don't clear session cart - keep it for when user logs out
        }
      } else if (userSwitched) {
        // Different user logged in - clear current cart and load new user's cart
        console.log(
          "Different user logged in - clearing current cart and loading new user's cart"
        );
        setCart([]);
        setCartDirty(false);
        loadCart();
      } else if (newUserId && currentUserId === newUserId) {
        // Same user, just reload their cart
        console.log("Same user - reloading cart");
        loadCart();
      }

      setCurrentUserId(newUserId);
    }
  }, [
    user?._id,
    currentUserId,
    loadCart,
    saveCartToDatabase,
    saveCartToSession,
    loadCartFromSession,
    clearCartFromSession,
    cart,
  ]);

  // Auto-save when cart changes
  useEffect(() => {
    if (cartDirty) {
      debouncedSave();
    }
  }, [cartDirty, debouncedSave]);

  // Handle page unload/reload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!cartDirty) return;

      try {
        if (isLoggedIn) {
          // Use sendBeacon for reliable background save
          const payload = JSON.stringify({ items: cart });
          const blob = new Blob([payload], { type: "application/json" });
          const success = navigator.sendBeacon(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/cart/save`,
            blob
          );
          console.log("Cart beacon sent:", success);
        } else {
          // Save to session storage immediately
          saveCartToSession(cart);
        }
      } catch (error) {
        console.error("Failed to save cart on page unload:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cart, cartDirty, isLoggedIn, saveCartToSession]);

  // Inventory checking
  const checkInventoryEnhanced = useCallback(
    async (item: CartItem, quantity: number): Promise<boolean> => {
      try {
        const res = await api.get(
          "/categories/get-items?limit=10000&role=buyer"
        );
        const found = res.data?.data?.find((i: any) => i._id === item._id);
        return found && found.quantity >= quantity;
      } catch (err) {
        console.error("Failed to check inventory:", err);
        return false;
      }
    },
    []
  );

  const validateQuantity = useCallback((qty: number, unit: number): boolean => {
    return unit === 1
      ? qty >= 1 && Math.abs(qty * 4 - Math.round(qty * 4)) < 0.0001
      : Number.isInteger(qty) && qty >= 1;
  }, []);

  // Cart operations
  const addToCart = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const validated = { ...item };
        if (!validateQuantity(validated.quantity, validated.measurement_unit)) {
          toast.error(
            validated.measurement_unit === 1
              ? "For KG items, use increments of 0.25 and at least 1 KG"
              : "For piece items, quantity must be whole numbers ≥ 1"
          );
          return;
        }

        if (userRole === "buyer") {
          const isAvailable = await checkInventoryEnhanced(
            validated,
            validated.quantity
          );
          if (!isAvailable) {
            toast.error("Sorry, this quantity is not available in stock.");
            return;
          }
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(
          (ci) => ci._id === validated._id
        );
        let newCart: CartItem[];

        if (existingItemIndex >= 0) {
          // Update existing item
          newCart = [...cart];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + validated.quantity,
          };
        } else {
          // Add new item
          newCart = [...cart, validated];
        }

        updateCartState(newCart);
        toast.success(`${validated.name} added to cart!`);
      } catch (err) {
        console.error("Failed to add to cart", err);
        toast.error("Failed to add item to cart");
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, userRole, checkInventoryEnhanced, validateQuantity, updateCartState]
  );

  const updateQuantity = useCallback(
    (item: CartItem) => {
      const newCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: item.quantity } : ci
      );
      updateCartState(newCart);
    },
    [cart, updateCartState]
  );

  const increaseQty = useCallback(
    async (item: CartItem) => {
      const inc = item.measurement_unit === 1 ? 0.25 : 1;
      const newCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: ci.quantity + inc } : ci
      );
      updateCartState(newCart);
    },
    [cart, updateCartState]
  );

  const decreaseQty = useCallback(
    async (item: CartItem) => {
      const dec = item.measurement_unit === 1 ? 0.25 : 1;
      if (item.quantity <= dec) return;

      const newCart = cart.map((ci) =>
        ci._id === item._id ? { ...ci, quantity: ci.quantity - dec } : ci
      );
      updateCartState(newCart);
    },
    [cart, updateCartState]
  );

  const removeFromCart = useCallback(
    async (item: CartItem) => {
      setLoadingItemId(item._id);
      try {
        const newCart = cart.filter((ci) => ci._id !== item._id);
        updateCartState(newCart);
        toast.success("Item removed from cart");
      } catch (err) {
        console.error("Failed to remove item", err);
        toast.error("Failed to remove item");
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, updateCartState]
  );

  const clearCart = useCallback(async () => {
    try {
      updateCartState([]);

      // Also clear from database/session immediately
      if (isLoggedIn) {
        await api.delete("/cart", { withCredentials: true });
      } else {
        clearCartFromSession();
      }

      toast.success("Cart cleared");
    } catch (err) {
      console.error("Failed to clear cart", err);
      toast.error("Failed to clear cart");
    }
  }, [isLoggedIn, updateCartState, clearCartFromSession]);

  const contextValue: CartContextType = {
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
    isItemInStock: (item) => (item.quantity ?? 0) > 0,
    userRole,
    updateQuantity,
    updateCartState,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}
