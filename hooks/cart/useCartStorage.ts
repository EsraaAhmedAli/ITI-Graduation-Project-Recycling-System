import { useLanguage } from "./../../context/LanguageContext";
import { convertNumbers } from "./../../utils/numbersUtility";
import { useCallback, useRef } from "react";
import api from "@/lib/axios";
import { CartItem } from "@/models/cart";
import { toast } from "react-hot-toast";

const GUEST_CART_KEY = "cart";

interface SimpleCartStorageProps {
  isLoggedIn: boolean;
  userId?: string | null;
  userRole: string;
}

export const useSimpleCartStorage = ({
  isLoggedIn,
  userId,
  userRole,
}: SimpleCartStorageProps) => {
  const { t, convertNumber } = useLanguage();
  // Save guest cart to localStorage (only for customers)
  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
      console.log(`👤 Saved ${cartItems.length} items to guest cart`);
    } catch (error) {
      console.error("Failed to save guest cart:", error);
    }
  }, []);

  // Load guest cart from localStorage
  const loadGuestCart = useCallback((): CartItem[] => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      console.log("&& stored => ", stored);
      const items = stored ? JSON.parse(stored) : [];
      console.log(`👤 Loaded ${items.length} items from guest cart`);
      return items;
    } catch (error) {
      console.error("Failed to load guest cart:", error);
      return [];
    }
  }, []);

  // Clear guest cart
  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
      console.log("🗑️ Cleared guest cart");
    } catch (error) {
      console.error("Failed to clear guest cart:", error);
    }
  }, []);

  // Load cart from database
  const loadCartFromDatabase = useCallback(async (): Promise<CartItem[]> => {
    if (!isLoggedIn || !userId) return [];

    try {
      console.log("📡 Loading cart from database...");
      const res = await api.get("/cart", { withCredentials: true });
      const items = res.data.items || [];
      console.log(`✅ Loaded ${items.length} items from database`);
      return items;
    } catch (error) {
      console.error("Failed to load cart from database:", error);
      throw error;
    }
  }, [isLoggedIn, userId]);

  // Save cart to database (only on logout)
  const saveCartToDatabase = useCallback(
    async (cartItems: CartItem[], forceUserId?: string): Promise<boolean> => {
      const effectiveUserId = forceUserId || userId;
      const effectiveLoggedIn = forceUserId ? true : isLoggedIn;

      if (!effectiveLoggedIn || !effectiveUserId) {
        console.log("⏭️ Skipping database save (not logged in)", {
          effectiveUserId,
          effectiveLoggedIn,
        });
        return false;
      }

      if (cartItems.length === 0) {
        console.log("⏭️ Skipping database save (empty cart)");
        return true;
      }

      try {
        console.log(
          `🚀 Saving cart to database for user: ${effectiveUserId}...`
        );

        // Format items for backend
        const validatedItems = cartItems.map((item) => ({
          ...item,
          quantity: Math.max(0, item.quantity || 0),
          // Ensure bilingual structure if needed
          name:
            typeof item.name === "string"
              ? { en: item.name, ar: item.name_ar || item.name }
              : item.name,
          categoryName:
            typeof item.categoryName === "string"
              ? {
                  en: item.categoryName,
                  ar: item.categoryName_ar || item.categoryName,
                }
              : item.categoryName,
        }));

        await api.post(
          "/cart/save",
          { userId: effectiveUserId, items: validatedItems },

          {
            withCredentials: true,
            timeout: 15000,
          }
        );

        console.log(
          `✅ Successfully saved ${cartItems.length} items to database`
        );
        toast.success(
          t("toast.cart.save.success", {
            length: convertNumber(cartItems.length),
          })
        );
        return true;
      } catch (error: any) {
        console.error(t("toast.cart.save.fail"));

        // Handle specific error types
        if (error?.response?.status === 400) {
          toast.error("Invalid cart data");
        } else if (error?.code === "ECONNABORTED") {
          toast.error("Save timeout - please try again");
        } else if (error?.response?.status >= 500) {
          toast.error("Server error - cart not saved");
        } else {
          toast.error("Failed to save cart");
        }

        return false;
      }
    },
    [isLoggedIn, userId]
  );

  return {
    saveGuestCart,
    loadGuestCart,
    clearGuestCart,
    loadCartFromDatabase,
    saveCartToDatabase,
  };
};
