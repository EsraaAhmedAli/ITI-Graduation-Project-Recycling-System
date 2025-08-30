import api from "@/lib/axios";
import { CartItem } from "@/models/cart";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

const CART_SESSION_KEY = "guest_cart";
const UNSYNCED_CART_KEY = "unsynced_cart";
const SAVE_DEBOUNCE_MS = 800;

export const useCartStorage = ({
  isLoggedIn,
  setIsLoading,
  setCart,
  setCartDirty,
  setIsSaving,
  saveTimeoutRef,
  isInitialized,
}) => {
  // Session storage helpers with error handling
  const saveCartToSession = useCallback((cartItems: CartItem[]) => {
    try {
      localStorage.setItem(CART_SESSION_KEY, JSON.stringify(cartItems));
      console.log(`Saved ${cartItems.length} items to session storage`);
    } catch (error) {
      console.error("Failed to save cart to session:", error);
      toast.error("Failed to save cart locally");
    }
  }, []);

  const loadCartFromSession = useCallback((): CartItem[] => {
    try {
      const stored = localStorage.getItem(CART_SESSION_KEY);
      const items = stored ? JSON.parse(stored) : [];
      console.log(`Loaded ${items.length} items from session storage`);
      return items;
    } catch (error) {
      console.error("Failed to load cart from session:", error);
      return [];
    }
  }, []);

  const clearCartFromSession = useCallback(() => {
    try {
      localStorage.removeItem(CART_SESSION_KEY);
      localStorage.removeItem(UNSYNCED_CART_KEY);
      console.log("Cleared cart from session storage");
    } catch (error) {
      console.error("Failed to clear cart from session:", error);
    }
  }, []);

  const saveCartToDatabase = useCallback(
    async (cartItems: CartItem[]) => {
      if (!isLoggedIn) return;

      try {
        // Ensure all items have proper bilingual structure
        const validatedItems = cartItems.map((item) => ({
          ...item,
          // No transformation needed if your createCartItem already creates proper structure
        }));

        await api.post(
          "/cart/save",
          { items: validatedItems },
          { withCredentials: true }
        );
        console.log(`Saved ${cartItems.length} items to database`);
      } catch (error) {
        console.error("Failed to save cart to database:", error);
        localStorage.setItem(UNSYNCED_CART_KEY, JSON.stringify(cartItems));
        throw error;
      }
    },
    [isLoggedIn]
  );

  const loadCartFromDatabase = useCallback(async (): Promise<CartItem[]> => {
    if (!isLoggedIn) return [];

    try {
      const res = await api.get("/cart", { withCredentials: true });
      const items = res.data.items || [];
      console.log(`Loaded ${items.length} items from database`);
      return items;
    } catch (error) {
      console.error("Failed to load cart from database:", error);
      // Try to load from unsynced backup
      try {
        const unsynced = localStorage.getItem(UNSYNCED_CART_KEY);
        if (unsynced) {
          console.log("Loading from unsynced backup");
          return JSON.parse(unsynced);
        }
      } catch (backupError) {
        console.error("Failed to load backup cart:", backupError);
      }
      throw error;
    }
  }, [isLoggedIn]);

  // Improved updateCartState with better error handling
  const updateCartState = useCallback(
    async (newCart: CartItem[]) => {
      setCart(newCart);
      setCartDirty(true);
    },
    [setCartDirty, setCart]
  );

  // Load cart based on authentication state
  const loadCart = useCallback(async () => {
    if (!isInitialized.current) {
      setIsLoading(true);
    }

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
    } finally {
      setIsLoading(false);
      isInitialized.current = true;
    }
  }, [
    isLoggedIn,
    loadCartFromDatabase,
    loadCartFromSession,
    setCart,
    isInitialized,
    setCartDirty,
    setIsLoading,
  ]);

  return {
    saveCartToSession,
    loadCartFromSession,
    clearCartFromSession,
    saveCartToDatabase,
    loadCartFromDatabase,
    updateCartState,
    loadCart,
  };
};
