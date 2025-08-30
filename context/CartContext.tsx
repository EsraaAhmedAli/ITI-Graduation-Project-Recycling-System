"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { CartItem } from "@/models/cart";
import { useUserAuth } from "@/context/AuthFormContext";
import { useLanguage } from "./LanguageContext";
import { useCartStorage } from "@/hooks/cart/useCarrStorage";
import { useCartOperations } from "@/hooks/cart/useCartOperations";
import { useCartMerge } from "@/hooks/cart/useCartMerge";
import { useCartInventory } from "@/hooks/cart/useCartInventory";

// Updated interfaces to match new backend structure

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
  updateCartState: (newCart: CartItem[]) => Promise<void>;
  userRole: "customer" | "buyer";
  isSaving: boolean;
  isLoading: boolean;
  mergingOptions: {
    showMergeDialog: boolean;
    guestCartCount: number;
    userCartCount: number;
    acceptMerge: () => Promise<void>;
    rejectMerge: () => Promise<void>;
  } | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
const UNSYNCED_CART_KEY = "unsynced_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mergingOptions, setMergingOptions] = useState<{
    showMergeDialog: boolean;
    guestCartCount: number;
    userCartCount: number;
    acceptMerge: () => Promise<void>;
    rejectMerge: () => Promise<void>;
  } | null>(null);
  const { user } = useUserAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [cartDirty, setCartDirty] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  const { locale } = useLanguage();
  const userRole = user?.role === "buyer" ? "buyer" : "customer";
  const isLoggedIn = !!user?._id;
  const { t } = useLanguage();
  const { checkInventory, checkInventoryEnhanced } = useCartInventory({
    cart,
    locale,
    userRole,
  });
  const {
    clearCartFromSession,
    loadCart,
    loadCartFromDatabase,
    loadCartFromSession,
    saveCartToDatabase,
    saveCartToSession,
    updateCartState,
  } = useCartStorage({
    isInitialized,
    isLoggedIn,
    saveTimeoutRef,
    setCart,
    setCartDirty,
    setIsLoading,
    setIsSaving,
  });
  const {
    addToCart,
    clearCart,
    decreaseQty,
    increaseQty,
    removeFromCart,
    updateQuantity,
    validateQuantity,
  } = useCartOperations({
    cart,
    clearCartFromSession,
    isLoggedIn,
    locale,
    setIsLoading,
    setLoadingItemId,
    t,
    updateCartState,
    userRole,
    checkInventoryEnhanced,
  });
  const {
    getAllItemsFromCategories,
    handleCartMerging,
    mergeCartItems,
    performCartMerge,
  } = useCartMerge({
    checkInventoryEnhanced,
    clearCartFromSession,
    loadCart,
    loadCartFromDatabase,
    loadCartFromSession,
    mergingOptions,
    saveCartToDatabase,
    setCart,
    setCartDirty,
    setIsLoading,
    setMergingOptions,
    userRole,
  });

  // Handle user authentication changes with improved logic and cart merging
  useEffect(() => {
    const newUserId = user?._id || null;
    const newUserRole = user?.role || null;
    const userChanged = currentUserId !== newUserId;
    const roleChanged = currentUserRole !== newUserRole;

    if (userChanged || roleChanged) {
      const wasLoggedOut = currentUserId && !newUserId;
      const wasLoggedIn = !currentUserId && newUserId;
      const allowedGuests = ["customer", "buyer"];
      // const userSwitched =
      //   currentUserId && newUserId && currentUserId !== newUserId;
      // const roleChangedForSameUser = currentUserId === newUserId && roleChanged;

      // console.log("User state change:", {
      //   wasLoggedOut,
      //   wasLoggedIn,
      //   userSwitched,
      //   roleChangedForSameUser,
      //   previousRole: currentUserRole,
      //   newRole: newUserRole,
      //   hasGuestCart: loadCartFromSession().length > 0,
      // });

      if (wasLoggedOut) {
        console.log("Buyer logged out - clearing cart completely");
        setCart([]);
        clearCartFromSession();
        setCartDirty(false);
      } else if (wasLoggedIn) {
        // User logged in from guest - merge carts (with auto-merge enabled by default)
        if (newUserRole !== "customer") {
          console.log("Not Guest logged in - skipping guest cart merge");
          clearCartFromSession();
          loadCart(); // load clean buyer cart from DB
        } else {
          // Customer logged in - merge guest cart
          handleCartMerging(true); // set to false if you want confirmation
        }
      }
      setCurrentUserId(newUserId);
      setCurrentUserRole(newUserRole);
    }
  }, [
    user?._id,
    user?.role,
    currentUserId,
    currentUserRole,
    cart,
    saveCartToSession,
    clearCartFromSession,
    loadCart,
    handleCartMerging,
    loadCartFromSession,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Improved page unload handling
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("EVENT FIRED");
      if (!cartDirty || cart.length === 0) return;

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

          // Fallback to sync request if beacon fails
          if (!success) {
            localStorage.setItem(UNSYNCED_CART_KEY, JSON.stringify(cart));
          }
        } else {
          // Save to session storage immediately for guests
          saveCartToSession(cart);
        }
      } catch (error) {
        console.error("Failed to save cart on page unload:", error);
        // Last resort - save to localStorage
        try {
          localStorage.setItem(UNSYNCED_CART_KEY, JSON.stringify(cart));
        } catch (storageError) {
          console.error("Failed to save cart to localStorage:", storageError);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cart, cartDirty, isLoggedIn, saveCartToSession]);

  useEffect(() => {
    if (!isInitialized.current) {
      loadCart();
    }
  }, [loadCart]);
  // Legacy inventory check for backward compatibility

  const contextValue: CartContextType = {
    cart,
    loadingItemId,
    isSaving,
    isLoading,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    loadCart,
    checkInventory,
    checkInventoryEnhanced,
    isItemInStock: (item) => (item.quantity ?? 0) > 0,
    userRole,
    updateQuantity,
    updateCartState,
    mergingOptions,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}
