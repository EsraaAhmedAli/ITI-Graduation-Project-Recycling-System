"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { CartItem } from "@/models/cart";
import { useUserAuth } from "@/context/AuthFormContext";
import { useSimpleCartStorage } from "@/hooks/cart/useCartStorage";
import { useCartOperations } from "@/hooks/cart/useCartOperations";
import { toast } from "react-hot-toast";
import { useCartMerge } from "@/hooks/cart/useCartMerge";
import { useCartInventory } from "@/hooks/cart/useCartInventory";
import { useLanguage } from "./LanguageContext";

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  increaseQty: (item: CartItem) => Promise<void>;
  decreaseQty: (item: CartItem) => Promise<void>;
  removeFromCart: (item: CartItem) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  updateCartState: (
    newCart: CartItem[],
    options?: { saveImmediately?: boolean; saveToDb?: boolean }
  ) => Promise<void>;
  loadingItemId: string | null;
  updateQuantity: (item: CartItem) => void;
  checkInventory: (itemId: string, quantity: number) => Promise<boolean>;
  checkInventoryEnhanced: (
    item: CartItem,
    quantity: number
  ) => Promise<boolean>;
  isItemInStock: (item: CartItem) => boolean;
  userRole: "customer" | "buyer";
  isSaving: boolean;
  isLoading: boolean;
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
  // Core state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  // User state tracking
  const { user } = useUserAuth();
  const userRole = user?.role === "buyer" ? "buyer" : "customer";
  const isLoggedIn = !!user?._id;
  const previousUserIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const hasHandledLoginRef = useRef(false);
  const { t, locale } = useLanguage();

  const updateCartState = async (
    newCart: CartItem[],
    options?: { saveImmediately?: boolean; saveToDb?: boolean }
  ) => {
    console.log(
      `🔄 Updating cart state with ${newCart.length} items (${userRole})`,
      options
    );

    // Always update React state first
    setCart(newCart);
    storage.saveGuestCart(newCart);
  };

  // FIXED: Load cart function with buyer support
  const loadCart = async () => {
    if (!isInitializedRef.current) {
      setIsLoading(true);
    }

    try {
      let cartItems: CartItem[] = [];

      if (isLoggedIn && user?._id) {
        console.log(`📡 Loading cart for logged-in ${userRole}`);

        // Load from database first for both customers and buyers
        try {
          cartItems = await storage.loadCartFromDatabase();
          console.log(`📡 Database: ${cartItems.length} items`);
        } catch (dbError) {
          console.warn(
            "⚠️ Database load failed, using localStorage fallback:",
            dbError
          );
        }
      }

      // Just set the cart state
      setCart(cartItems);
    } catch (error) {
      console.error("❌ Failed to load cart:", error);
      toast.error("Failed to load cart items");
      setCart([]);
    } finally {
      setIsLoading(false);
      isInitializedRef.current = true;
    }
  };

  //inventory Hook
  const { checkInventory, checkInventoryEnhanced } = useCartInventory({
    cart,
    locale,
    userRole,
  });
  // Storage hook
  const storage = useSimpleCartStorage({
    isLoggedIn,
    userId: user?._id,
    userRole,
  });

  // Cart merge hook (only for customers - buyers don't merge)
  const { handleCartMerging } = useCartMerge({
    clearGuestCart: storage.clearGuestCart,
    loadCartFromDatabase: storage.loadCartFromDatabase,
    loadGuestCart: storage.loadGuestCart,
    updateCartState,
  });

  // Cart operations hook
  const cartOps = useCartOperations({
    isLoggedIn,
    clearCartFromSession: storage.clearGuestCart,
    t,
    locale,
    setIsLoading,
    setLoadingItemId,
    cart,
    userRole,
    updateCartState,
    checkInventoryEnhanced,
  });

  // FIXED: Handle user logout - Save current cart to DB, then clear ALL local data
  const handleUserLogout = useCallback(
    async (loggedOutUserId: string) => {
      console.group(`🔓 HANDLE USER LOGOUT (${userRole})`);
      console.log(`💾 Handling logout for user: ${loggedOutUserId}`);

      hasHandledLoginRef.current = false;

      if (userRole !== "buyer" && userRole !== "customer") {
        console.log("⏭️ User role not buyer/customer, skipping");
        console.groupEnd();
        return;
      }

      try {
        // STEP 1: Save current cart to database FIRST (for both customers and buyers)
        if (cart.length > 0) {
          console.log(
            `💾 Saving ${cart.length} ${userRole} items to database before logout`
          );
          setIsSaving(true);
          try {
            isInitializedRef.current = false;
            hasHandledLoginRef.current = false;
            previousUserIdRef.current = null;
            // localStorage.removeItem("freshLogin"); // reset merge flag
            await storage.saveCartToDatabase(cart, loggedOutUserId);
            console.log(`✅ ${userRole} cart saved to database on logout`);
          } catch (saveError) {
            console.error("❌ Failed to save cart on logout:", saveError);
          } finally {
            setIsSaving(false);
          }
        }

        // STEP 2: COMPLETE SECURITY CLEARING (for both customers and buyers)
        console.log(`🔒 SECURITY: Clearing all local ${userRole} cart data`);

        // Clear React state
        setCart([]);
        storage.clearGuestCart();

        // Clear guest cart from localStorage (CRITICAL for both roles)

        // Reset all flags for next user

        console.log(`🔒 ${userRole} logout complete - all local data cleared`);
      } catch (error) {
        console.error("❌ Logout error:", error);
        // Emergency clear
        setCart([]);
        storage.clearGuestCart();
      }

      console.groupEnd();
    },
    [cart, storage, userRole]
  );
  // ENHANCED: handleUserLogin with role-specific logic
  // ENHANCED: handleUserLogin with role-specific logic
  const handleUserLogin = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    const currentUserId = parsedUser?._id || null;
    const currentUserRole = parsedUser?.role || null;

    console.group(`🔑 HANDLE USER LOGIN (${currentUserRole})`);

    if (hasHandledLoginRef.current) {
      console.log("⏭️ Login already handled, skipping");
      console.groupEnd();
      return;
    }

    hasHandledLoginRef.current = true;

    if (!currentUserId || !["buyer", "customer"].includes(currentUserRole)) {
      console.log("⏭️ Guest or unsupported role, initializing guest cart");
      const guestCart = storage.loadGuestCart();
      setCart(guestCart);
      isInitializedRef.current = true;
      console.groupEnd();
      return;
    }

    setIsLoading(true);

    try {
      const guestCart = storage.loadGuestCart();
      const dbCart = await storage.loadCartFromDatabase();

      console.log(`🛒 Guest cart: ${guestCart.length} items`);
      console.log(`📡 Database cart: ${dbCart.length} items`);

      const isFresh = localStorage.getItem("freshLogin");

      if (!isFresh) {
        if (guestCart.length > 0 && currentUserRole === "customer") {
          console.log(`🔄 MERGING customer carts...`);
          await handleCartMerging();
          console.log("✅ Customer merge completed");
        } else {
          console.log("📦 No guest items, using database cart");
          setCart(dbCart);
          if (dbCart.length > 0) {
            storage.saveGuestCart(dbCart);
          }
        }
        // mark this session as merged
        localStorage.setItem("freshLogin", "true");
      } else {
        console.log(
          "👤 Customer reload detected → skip merge, keep current cart"
        );
        setCart(guestCart);
      }
    } catch (error) {
      console.error("❌ Login handling failed:", error);

      if (currentUserRole === "buyer") {
        const fallbackCart = storage.loadGuestCart();
        setCart(fallbackCart);
        console.log(
          `🔄 Fallback: Using ${fallbackCart.length} localStorage items`
        );
      } else {
        setCart([]);
      }
    } finally {
      setIsLoading(false);
      isInitializedRef.current = true;
      console.groupEnd();
    }
  }, [handleCartMerging, storage]);

  // USER STATE EFFECT
  useEffect(() => {
    const myFun = async () => {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      const currentUserId = parsedUser?._id || null;
      const currentUserRole = parsedUser?.role || null;
      const previousUserId = previousUserIdRef.current;

      if (["admin", "delivery"].includes(currentUserRole)) return;
      if (!storedUser && localStorage.getItem("freshLogin")) {
        console.log(`🔓 LOGGED OUT`);
        localStorage.removeItem("freshLogin"); // Clear immediately
        await handleUserLogout(previousUserId);
      } else if (currentUserId && !previousUserId) {
        console.log(`🔑 ${currentUserRole?.toUpperCase()} LOGGED IN`);

        if (currentUserRole === "customer" || currentUserRole === "buyer") {
          await handleUserLogin();
        }

        previousUserIdRef.current = currentUserId;
      }
    };
    myFun();
  }, [handleUserLogin, handleUserLogout]);
  // Add this useEffect to handle initial guest cart loading
  useEffect(() => {
    // Initialize guest cart on component mount if no user
    const initializeGuestCart = () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser && !isInitializedRef.current) {
        console.log("👤 Initializing guest cart on page load");
        const guestCart = storage.loadGuestCart();
        setCart(guestCart);
        isInitializedRef.current = true;
      }
    };

    initializeGuestCart();
  }, [storage]); // Run once on mount

  const contextValue: CartContextType = {
    cart,
    addToCart: cartOps.addToCart,
    increaseQty: cartOps.increaseQty,
    decreaseQty: cartOps.decreaseQty,
    removeFromCart: cartOps.removeFromCart,
    clearCart: cartOps.clearCart,
    loadCart,
    isItemInStock: (item) => (item.quantity ?? 0) > 0,
    updateCartState,
    loadingItemId,
    updateQuantity: cartOps.updateQuantity,
    checkInventory,
    checkInventoryEnhanced,
    userRole,
    isLoading,
    isSaving,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}