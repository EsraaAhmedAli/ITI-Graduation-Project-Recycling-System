import { Item } from "./../components/Types/categories.type";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { queryClient } from "@/lib/queryClient";
import { Category } from "@/components/Types/categories.type";
import { useQueryClient } from "@tanstack/react-query";
import { CartItem } from "@/models/cart";
import { GetCartItemsResponse } from "./cart/useGetCartItems";

interface ItemUpdatePayload {
  itemId: string;
  categoryId: string;
  quantity: number;
}

export function useItemSocket({
  itemIds, // Changed from pagination params to specific item IDs
  userRole,
}: {
  itemIds: string[]; // Only listen for updates to these specific items
  userRole?: string;
}) {
  const queryClient = useQueryClient();
  const socket = getSocket();
  
  useEffect(() => {
    console.log("🔌 Setting up cart item socket listeners for:", itemIds);
    if (!socket || itemIds?.length === 0) return;

    const handleItemUpdated = (updatedItem: ItemUpdatePayload) => {
      // Only process updates for items in our cart
      if (!itemIds.includes(updatedItem.itemId)) {
        return;
      }
      
      console.log("🔄 Cart item updated from socket:", updatedItem);
      
      // Update the cart-items query
      queryClient.setQueriesData<GetCartItemsResponse>(
        { predicate: (query) => query.queryKey[0] === "cart-items" },
        (oldData) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((item) =>
              item._id === updatedItem.itemId
                ? { ...item, quantity: updatedItem.quantity }
                : item
            ),
          };
        }
      );
    };

    const handleItemDeleted = (payload: { itemId: string }) => {
      // Only process deletions for items in our cart
      if (!itemIds.includes(payload.itemId)) {
        return;
      }
      
      console.log("🗑️ Cart item deleted from socket:", payload);
      
      queryClient.setQueriesData<GetCartItemsResponse>(
        { predicate: (query) => query.queryKey[0] === "cart-items" },
        (oldData) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((item) => item._id !== payload.itemId),
          };
        }
      );
    };

    const handleItemCreated = (payload: Category) => {
      // For new items, we don't need to do anything in cart context
      // unless the item is somehow added to cart externally
      console.log("➕ New item created (not relevant for cart):", payload);
    };

    socket.on("itemUpdated", handleItemUpdated);
    socket.on("itemDeleted", handleItemDeleted);
    socket.on("itemCreated", handleItemCreated);

    return () => {
      socket.off("itemUpdated", handleItemUpdated);
      socket.off("itemDeleted", handleItemDeleted);
      socket.off("itemCreated", handleItemCreated);
    };
  }, [queryClient, itemIds, userRole, socket]);
}