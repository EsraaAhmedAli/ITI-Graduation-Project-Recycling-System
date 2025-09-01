import { useLanguage } from "./../../context/LanguageContext";
import { useCallback } from "react";
import { CartItem } from "@/models/cart";
import { toast } from "react-hot-toast";

interface CartMergeProps {
  loadGuestCart: () => CartItem[];
  clearGuestCart: () => void;
  loadCartFromDatabase: () => Promise<CartItem[]>;
  updateCartState: (items: CartItem[]) => Promise<void>;
}

export const useCartMerge = ({
  loadGuestCart,
  loadCartFromDatabase,
  updateCartState,
}: CartMergeProps) => {
  const { t, convertNumber } = useLanguage();
  // Merge guest + user cart items intelligently
  const mergeCartItems = useCallback(
    (guestCart: CartItem[], userCart: CartItem[]): CartItem[] => {
      console.log(
        `🔄 Merging carts: ${guestCart.length} guest + ${userCart.length} user items`
      );

      // Start with user cart as base
      const merged = [...userCart];

      // Add guest items
      guestCart.forEach((guestItem) => {
        const existingIndex = merged.findIndex(
          (item) => item._id === guestItem._id
        );

        if (existingIndex >= 0) {
          // Item exists in both carts - combine quantities
          const oldQty = merged[existingIndex].quantity || 0;
          const guestQty = guestItem.quantity || 0;
          const newQty = oldQty + guestQty;

          merged[existingIndex] = {
            ...merged[existingIndex],
            quantity: newQty,
          };
          console.log(
            `📦 Combined item ${guestItem._id}: ${oldQty} + ${guestQty} = ${newQty}`
          );
        } else {
          // Item only in guest cart - add it
          merged.push({ ...guestItem });
          console.log(
            `➕ Added guest item ${guestItem._id} with quantity ${guestItem.quantity}`
          );
        }
      });

      console.log(`✅ Merge complete: ${merged.length} total items`);
      return merged;
    },
    []
  );

  // Main cart merging handler - ONLY called when user logs in with existing guest cart
  const handleCartMerging = useCallback(async (): Promise<void> => {
    console.log("🔄 Starting cart merge process...");

    try {
      // 1️⃣ Load both carts
      const guestCart = loadGuestCart();
      const userCart = await loadCartFromDatabase();

      console.log(
        `📊 Merge input: ${guestCart.length} guest items, ${userCart.length} user items`
      );

      // 2️⃣ Check if merging is actually needed
      if (guestCart.length === 0) {
        console.log("⏭️ No guest cart items to merge, using user cart");
        await updateCartState(userCart);
        return;
      }

      // 3️⃣ Perform the merge
      const mergedCart = mergeCartItems(guestCart, userCart);

      // 4️⃣ Update cart state with merged items
      await updateCartState(mergedCart);

      // 6️⃣ Show success message
      // const addedItems = guestCart.length;
      // const totalItems = mergedCart.length;
      toast.success(t("toast.cart.merge.success"));
    } catch (error) {
      toast.error(t("toast.cart.merge.fail"));

      // // Fallback: just load the user's saved cart
      // try {
      //   const userCart = await loadCartFromDatabase();
      //   await updateCartState(userCart);
      //   console.log("🔄 Fallback: loaded user cart after merge failure");
      // } catch (fallbackError) {
      //   console.error("❌ Fallback also failed:", fallbackError);
      //   await updateCartState([]);
      // }
    }
  }, [loadGuestCart, loadCartFromDatabase, updateCartState, mergeCartItems, t]);

  return {
    handleCartMerging,
    mergeCartItems, // Export for testing or manual use
  };
};
