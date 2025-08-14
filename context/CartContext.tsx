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
import { useLanguage } from "./LanguageContext";

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

const CART_SESSION_KEY = "guest_cart";
const UNSYNCED_CART_KEY = "unsynced_cart";
const SAVE_DEBOUNCE_MS = 800;

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
  const pendingGuestCart = useRef<CartItem[]>([]);
  const pendingUserCart = useRef<CartItem[]>([]);
  const {locale} = useLanguage()

  const userRole = user?.role === "buyer" ? "buyer" : "customer";
  const isLoggedIn = !!user?._id;

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

  // Database helpers with better error handling
  const saveCartToDatabase = useCallback(
    async (cartItems: CartItem[]) => {
      if (!isLoggedIn) return;

      try {
        await api.post(
          `/cart/save?lang=${locale}`,
          { items: cartItems },
          { withCredentials: true }
        );
        console.log(`Saved ${cartItems.length} items to database`);
      } catch (error) {
        console.error("Failed to save cart to database:", error);
        // Save to local storage as backup
        localStorage.setItem(UNSYNCED_CART_KEY, JSON.stringify(cartItems));
        throw error;
      }
    },
    [isLoggedIn]
  );

  const loadCartFromDatabase = useCallback(async (): Promise<CartItem[]> => {
    if (!isLoggedIn) return [];

    try {
      const res = await api.get(`/cart?lang=${locale}`, { withCredentials: true });
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

      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Don't start saving indicator immediately to avoid flickering
      const savingTimeoutRef = setTimeout(() => setIsSaving(true), 100);

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (isLoggedIn) {
            await saveCartToDatabase(newCart);
          } else {
            saveCartToSession(newCart);
          }
          setCartDirty(false);
          console.log(newCart,'neeeww');
          
          localStorage.removeItem(UNSYNCED_CART_KEY); // Clear backup on successful save
        } catch (error) {
          console.error("Failed to save cart:", error);
          toast.error(
            "Changes saved locally. Will sync when connection is restored."
          );
        } finally {
          clearTimeout(savingTimeoutRef);
          setIsSaving(false);
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [isLoggedIn, saveCartToDatabase, saveCartToSession]
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
  }, [isLoggedIn, loadCartFromDatabase, loadCartFromSession]);

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

  // Inventory checking
  const checkInventoryEnhanced = useCallback(
    async (item: CartItem, quantity: number): Promise<boolean> => {
      if (userRole !== "buyer") return true; // Customers don't need inventory checks

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
    [userRole]
  );

  // Cart merging helper function
  const mergeCartItems = useCallback(
    (guestCart: CartItem[], userCart: CartItem[]): CartItem[] => {
      const mergedCart = [...userCart];

      guestCart.forEach((guestItem) => {
        const existingIndex = mergedCart.findIndex(
          (userItem) => userItem._id === guestItem._id
        );

        if (existingIndex >= 0) {
          // Item exists in both carts - combine quantities
          const existingItem = mergedCart[existingIndex];
          const combinedQuantity = existingItem.quantity + guestItem.quantity;

          // Validate the combined quantity based on measurement unit
          const increment = guestItem.measurement_unit === 1 ? 0.25 : 1;
          const validatedQuantity =
            Math.ceil(combinedQuantity / increment) * increment;

          mergedCart[existingIndex] = {
            ...existingItem,
            quantity: validatedQuantity,
          };

          console.log(
            `Merged item ${guestItem.name}: ${existingItem.quantity} + ${guestItem.quantity} = ${validatedQuantity}`
          );
        } else {
          // Item only exists in guest cart - add it
          mergedCart.push(guestItem);
          console.log(
            `Added guest item ${guestItem.name} with quantity ${guestItem.quantity}`
          );
        }
      });

      return mergedCart;
    },
    []
  );

  // Perform the actual cart merge
  const performCartMerge = useCallback(
    async (guestCart: CartItem[], userCart: CartItem[]) => {
      try {
        // Merge the carts
        const mergedCart = mergeCartItems(guestCart, userCart);
        console.log(`Merged cart has ${mergedCart.length} items`);

        // For buyers, validate inventory for merged items
        if (userRole === "buyer") return;
        // console.log("Validating inventory for merged cart items...");
        // const validatedCart: CartItem[] = [];
        // let hasInventoryIssues = false;
        // for (const item of mergedCart) {
        //   const isAvailable = await checkInventoryEnhanced(
        //     item,
        //     item.quantity
        //   );
        //   if (isAvailable) {
        //     validatedCart.push(item);
        //   } else {
        //     console.warn(
        //       `Insufficient inventory for ${item.name}, quantity: ${item.quantity}`
        //     );
        //     hasInventoryIssues = true;
        //     // Try to find the maximum available quantity
        //     try {
        //       const res = await api.get(
        //         "/categories/get-items?limit=10000&role=buyer"
        //       );
        //       const foundItem = res.data?.data?.find(
        //         (i: any) => i._id === item._id
        //       );
        //       if (foundItem && foundItem.quantity > 0) {
        //         const maxQuantity = foundItem.quantity;
        //         const increment = item.measurement_unit === 1 ? 0.25 : 1;
        //         const adjustedQuantity =
        //           Math.floor(maxQuantity / increment) * increment;
        //         if (adjustedQuantity > 0) {
        //           validatedCart.push({ ...item, quantity: adjustedQuantity });
        //           console.log(
        //             `Adjusted ${item.name} quantity to available stock: ${adjustedQuantity}`
        //           );
        //         }
        //       }
        //     } catch (error) {
        //       console.error(
        //         "Failed to check individual item availability:",
        //         error
        //       );
        //     }
        //   }
        // }
        // if (hasInventoryIssues) {
        //   toast.error(
        //     "Some items had limited stock and quantities were adjusted",
        //     {
        //       duration: 5000,
        //     }
        //   );
        // }
        // setCart(validatedCart);
        // await saveCartToDatabase(validatedCart);
        // }
        else {
          // For customers, no inventory validation needed
          setCart(mergedCart);
          await saveCartToDatabase(mergedCart);
        }

        // Clear guest cart after successful merge
        clearCartFromSession();
        setCartDirty(false);

        // Show success message
        if (guestCart.length > 0) {
        } else {
          toast.success("Welcome back! Your cart has been loaded.");
        }
      } catch (error) {
        console.error("Failed to perform cart merge:", error);
        throw error;
      }
    },
    [mergeCartItems, userRole, saveCartToDatabase, clearCartFromSession]
  );

  // Handle cart merging when user logs in (with optional user confirmation)
  const handleCartMerging = useCallback(
    async (autoMerge: boolean = false) => {
      try {
        setIsLoading(true);

        // Get guest cart from session
        const guestCart = loadCartFromSession();

        if (guestCart.length === 0) {
          // No guest cart to merge, just load user's database cart
          console.log(
            "No guest cart to merge, loading user cart from database"
          );
          await loadCart();
          return;
        }

        // Load user's database cart
        const userCart = await loadCartFromDatabase();
        console.log(
          `Found ${guestCart.length} guest items and ${userCart.length} user items`
        );

        // Store carts for potential merge dialog
        pendingGuestCart.current = guestCart;
        pendingUserCart.current = userCart;

        // If auto-merge is disabled and both carts have items, show confirmation dialog
        if (!autoMerge && userCart.length > 0 && guestCart.length > 0) {
          setMergingOptions({
            showMergeDialog: true,
            guestCartCount: guestCart.length,
            userCartCount: userCart.length,
            acceptMerge: async () => {
              await performCartMerge(
                pendingGuestCart.current,
                pendingUserCart.current
              );
              setMergingOptions(null);
            },
            rejectMerge: async () => {
              // Keep only user's database cart
              setCart(pendingUserCart.current);
              clearCartFromSession();
              setCartDirty(false);
              setMergingOptions(null);
              toast.success("Your saved cart has been restored.");
            },
          });
          setIsLoading(false);
          return;
        }

        // Auto-merge or one of the carts is empty
        await performCartMerge(guestCart, userCart);
      } catch (error) {
        console.error("Failed to merge carts:", error);
        toast.error(
          "Failed to merge your guest cart. Your previous cart has been restored."
        );
        // Fallback to just loading user's database cart
        await loadCart();
      } finally {
        if (!mergingOptions?.showMergeDialog) {
          setIsLoading(false);
        }
      }
    },
    [
      loadCartFromSession,
      loadCartFromDatabase,
      loadCart,
      performCartMerge,
      clearCartFromSession,
      mergingOptions?.showMergeDialog,
    ]
  );

  // Handle user authentication changes with improved logic and cart merging
  useEffect(() => {
    const newUserId = user?._id || null;
    const newUserRole = user?.role || null;
    const userChanged = currentUserId !== newUserId;
    const roleChanged = currentUserRole !== newUserRole;

    if (userChanged || roleChanged) {
      const wasLoggedOut = currentUserId && !newUserId;
      const wasLoggedIn = !currentUserId && newUserId;
      const userSwitched =
        currentUserId && newUserId && currentUserId !== newUserId;
      const roleChangedForSameUser = currentUserId === newUserId && roleChanged;

      console.log("User state change:", {
        wasLoggedOut,
        wasLoggedIn,
        userSwitched,
        roleChangedForSameUser,
        previousRole: currentUserRole,
        newRole: newUserRole,
        hasGuestCart: loadCartFromSession().length > 0,
      });

      if (wasLoggedOut) {
        console.log("Buyer logged out - clearing cart completely");
        setCart([]);
        clearCartFromSession();
        setCartDirty(false);
      } else if (wasLoggedIn) {
        // User logged in from guest - merge carts (with auto-merge enabled by default)
        if (newUserRole === "buyer") {
          console.log("Buyer logged in - skipping guest cart merge");
          clearCartFromSession();
          loadCart(); // load clean buyer cart from DB
        } else {
          // Customer logged in - merge guest cart
          handleCartMerging(true); // set to false if you want confirmation
        }
      } else if (userSwitched) {
        // Different user logged in - save current cart to session (if guest) then load new user's cart
        console.log("Different user logged in - switching carts");
        if (!currentUserId) {
          // Was guest, save current cart to session
          saveCartToSession(cart);
        }
        loadCart();
      } else if (roleChangedForSameUser) {
        // Same user, role changed - reload cart
        console.log("User role changed - reloading cart");
        loadCart();
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

  // Cart operations with improved error handling
  const addToCart = useCallback(
    async (item: CartItem) => {
      
      
      setLoadingItemId(item._id);
            console.log(item,'yaraaaaaab');

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
          const message =
            validatedItem.measurement_unit === 1
              ? "For KG items, minimum quantity is 0.25 KG and must be in 0.25 increments"
              : "For Piece items, quantity must be whole numbers ≥ 1";
          toast.error(message);
          return;
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(
          (ci) => ci._id === validatedItem._id
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const newQuantity =
            cart[existingItemIndex].quantity + validatedItem.quantity;

          if (userRole === "buyer") {
            const isAvailable = await checkInventoryEnhanced(
              validatedItem,
              newQuantity
            );
            if (!isAvailable) {
              toast.error(
                "Sorry, the requested quantity is not available in stock."
              );
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
              toast.error(
                "Sorry, the requested quantity is not available in stock."
              );
              return;
            }
          }

          const updatedCart = [...cart, validatedItem];
          await updateCartState(updatedCart);
        }

        toast.success(`${validatedItem.name} added to cart successfully!`);
      } catch (err) {
        console.error("Failed to add to cart", err);
        toast.error("Failed to add item to cart");
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, checkInventoryEnhanced, userRole, validateQuantity, updateCartState]
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
        toast.error("Failed to update quantity");
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, userRole, checkInventoryEnhanced, updateCartState]
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
        toast.error("Failed to decrease item quantity");
      } finally {
        setLoadingItemId(null);
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

      toast.success("Cart cleared");
    } catch (err) {
      console.error("Failed to clear cart", err);
      toast.error("Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, updateCartState, clearCartFromSession]);

  // Legacy inventory check for backward compatibility
  const checkInventory = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      const item = cart.find((ci) => ci._id === itemId);
      if (!item) return false;
      return checkInventoryEnhanced(item, quantity);
    },
    [cart, checkInventoryEnhanced]
  );

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

  // Load cart on mount
  useEffect(() => {
    if (!isInitialized.current) {
      loadCart();
    }
  }, [loadCart]);

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}
