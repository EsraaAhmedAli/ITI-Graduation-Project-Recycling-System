import api from "@/lib/axios";
import { CartItem } from "@/models/cart";
import { useCallback } from "react";
export const useCartInventory = ({ userRole, cart, locale }) => {
  const checkInventoryEnhanced = useCallback(
    async (item: CartItem, quantity: number): Promise<boolean> => {
      if (userRole !== "buyer") return true; // Customers don't need inventory checks
      console.log(item, "iiiiiiiii");

      try {
        // API call to get items
        const res = await api.get(
          "/categories/get-items?limit=10000&role=buyer"
        );

        // The response.data.data is directly an array of items, not nested in categories
        const allItems = res.data?.data || [];
        console.log(allItems, "all items from API");

        // Check if response is an array
        if (!Array.isArray(allItems)) {
          console.error("Expected array of items, got:", allItems);
          return false;
        }

        // Find the item directly in the array
        const foundItem = allItems.find((i: any) => i._id === item._id);

        const isAvailable = foundItem && foundItem.quantity >= quantity;
        console.log(
          `Inventory check for ${
            item.name[locale]
          }: requested=${quantity}, available=${
            foundItem?.quantity || 0
          }, result=${isAvailable}`
        );

        return !!isAvailable;
      } catch (err) {
        console.error("Failed to check inventory:", err);
        return false;
      }
    },
    [userRole, locale]
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
