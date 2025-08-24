import { CartItem } from "@/models/cart";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useCartInventory = ({ userRole, cart, locale }) => {
  const queryClient = useQueryClient();

  const checkInventoryEnhanced = useCallback(
    async (item: CartItem, quantity: number): Promise<boolean> => {
      if (userRole !== "buyer") return true;
      
      // Get the cart item IDs for the correct query key
      const cartItemIds = cart.map((cartItem: CartItem) => cartItem._id);
      
      // Check cart-items cache with the correct query key structure
      const cartItemsCache = queryClient.getQueryData([
        "cart-items", 
        cartItemIds, 
        userRole
      ]) as any;
      
      if (cartItemsCache?.data) {
        const foundItem = cartItemsCache.data.find((i: any) => i._id === item._id);
        if (foundItem && foundItem.quantity !== undefined) {
          const isAvailable = foundItem.quantity >= quantity;
          console.log(
            `Inventory check from cart cache for ${item.name[locale]}: requested=${quantity}, available=${foundItem.quantity}, result=${isAvailable}`
          );
          return isAvailable;
        }
      }

      // Check if we have item-details cache as fallback
      const itemDetailsCache = queryClient.getQueryData([
        "item-details", 
        item.name?.en?.toLowerCase()
      ]);
      
      if (itemDetailsCache?.quantity !== undefined) {
        const isAvailable = itemDetailsCache.quantity >= quantity;
        console.log(
          `Inventory check from item-details cache for ${item.name[locale]}: requested=${quantity}, available=${itemDetailsCache.quantity}, result=${isAvailable}`
        );
        return isAvailable;
      }

      // Fallback to item's own quantity property
      const isAvailable = (item.quantity || 0) >= quantity;
      console.log(
        `Inventory check fallback for ${item.name[locale]}: requested=${quantity}, available=${item.quantity || 0}, result=${isAvailable}`
      );
      
      return isAvailable;
    },
    [userRole, locale, queryClient, cart]
  );

  const checkInventory = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      const item = cart.find((ci: CartItem) => ci._id === itemId);
      if (!item) return false;
      return checkInventoryEnhanced(item, quantity);
    },
    [cart, checkInventoryEnhanced]
  );

  return { checkInventory, checkInventoryEnhanced };
};