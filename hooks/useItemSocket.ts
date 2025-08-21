import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";

interface ItemUpdatePayload {
  itemId: string;
  categoryId: string;
  quantity: number;
}

interface ItemSocketParams {
  itemIds: string[]; // Array of item IDs to listen for
  userRole: string;
}

export function useItemSocket({
  itemIds,
  userRole,
}: ItemSocketParams) {
  const queryClient = useQueryClient();
  const socket = getSocket();
  
  useEffect(() => {
    console.log("🔌 Setting up item socket listener for items:", itemIds);
    if (!socket || !itemIds?.length) return;

    const handleItemUpdated = (updatedItem: ItemUpdatePayload) => {
      // Only process updates for items in our cart
      if (!itemIds.includes(updatedItem.itemId)) {
        return;
      }
      
      console.log("🔄 Item updated from socket:", updatedItem);
      
      // Update the cart items query cache
      queryClient.setQueryData(
        ["cart-items", itemIds, userRole],
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((item: any) => 
              item._id === updatedItem.itemId 
                ? { ...item, quantity: updatedItem.quantity }
                : item
            )
          };
        }
      );

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["cart-items", itemIds, userRole]
      });
    };

    const handleItemDeleted = (payload: { itemId: string }) => {
      if (!itemIds.includes(payload.itemId)) {
        return;
      }
      
      console.log("🗑️ Item deleted from socket:", payload);
      
      // Invalidate the query since an item was deleted
      queryClient.invalidateQueries({
        queryKey: ["cart-items", itemIds, userRole]
      });
    };

    const handleItemCreated = (payload: any) => {
      // Not typically relevant for cart items but can be useful
      console.log("➕ New item created:", payload);
      
      // If the new item is relevant to our current cart, invalidate
      if (itemIds.includes(payload.itemId)) {
        queryClient.invalidateQueries({
          queryKey: ["cart-items", itemIds, userRole]
        });
      }
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