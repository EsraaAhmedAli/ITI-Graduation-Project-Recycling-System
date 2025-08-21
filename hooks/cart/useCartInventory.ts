import { CartItem } from "@/models/cart";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useCartInventory = ({ userRole, cart, locale }) => {
  const queryClient = useQueryClient();

  const checkInventoryEnhanced = useCallback(
    async (item: CartItem, quantity: number): Promise<boolean> => {
      if (userRole !== "buyer") return true;
      
      
      const itemDetailsCache = queryClient.getQueryData(["item-details", item.name?.en?.toLowerCase()]);
      if (itemDetailsCache?.quantity !== undefined) {
        const isAvailable = itemDetailsCache.quantity >= quantity;
        console.log(
          `Inventory check from cache for ${item.name[locale]}: requested=${quantity}, available=${itemDetailsCache.quantity}, result=${isAvailable}`
        );
        return isAvailable;
      }

      // Check if we have cart-items cache (from cart page)
      const cartItemsCache = queryClient.getQueryData(["cart-items"]) as any;
      if (cartItemsCache?.data) {
        const foundItem = cartItemsCache.data.find((i: any) => i._id === item._id);
        if (foundItem) {
          const isAvailable = foundItem.quantity >= quantity;
          console.log(
            `Inventory check from cart cache for ${item.name[locale]}: requested=${quantity}, available=${foundItem.quantity}, result=${isAvailable}`
          );
          return isAvailable;
        }
      }

      const isAvailable = (item.quantity || 0) >= quantity;
      console.log(
        `Inventory check fallback for ${item.name[locale]}: requested=${quantity}, available=${item.quantity || 0}, result=${isAvailable}`
      );
      
      return isAvailable;
    },
    [userRole, locale, queryClient]
  );

  const checkInventory = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      const item = cart.find((ci) => ci._id === itemId);
      if (!item) return false;
      return checkInventoryEnhanced(item, quantity);
    },
    [cart, checkInventoryEnhanced]
  );

  return { checkInventory, checkInventoryEnhanced };
};