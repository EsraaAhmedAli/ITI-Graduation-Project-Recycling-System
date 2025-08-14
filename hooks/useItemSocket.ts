import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { GetItemsResponse } from "./useGetItems";
import { CartItem } from "@/models/cart";

interface ItemUpdatePayload {
  itemId: string;
  categoryId: string;
  quantity: number;
}

interface ItemDeletedPayload {
  itemId: string;
}

interface ItemCreatedPayload {
  item: CartItem;
}

export function useItemSocket({
  currentPage,
  itemsPerPage,
  userRole,
  selectedCategory,
  searchTerm,
}: {
  currentPage: number;
  itemsPerPage: number;
  userRole?: string;
  selectedCategory: string;
  searchTerm: string;
}) {
  const queryClient = useQueryClient();
  const socket = getSocket();

  useEffect(() => {
    if (!socket) {
      console.warn("Socket not initialized");
      return;
    }

    console.log("🔌 Setting up item socket listeners...");

    const handleItemUpdated = (updatedItem: ItemUpdatePayload) => {
      console.log("🔄 Received item update:", updatedItem);

      // Update all queries that start with "categories items"
      queryClient.setQueriesData<GetItemsResponse>(
        { queryKey: ["categories items"] },
        (oldData) => {
          if (!oldData) return oldData;

          const updatedItems = oldData.data.map((item) => 
            item._id === updatedItem.itemId
              ? { ...item, quantity: updatedItem.quantity }
              : item
          );

          console.log("🔄 Updated items data:", updatedItems);
          return { ...oldData, data: updatedItems };
        }
      );
    };

    const handleItemDeleted = (payload: ItemDeletedPayload) => {
      console.log("🗑️ Received item deletion:", payload);

      queryClient.setQueriesData<GetItemsResponse>(
        { queryKey: ["categories items"] },
        (oldData) => {
          if (!oldData) return oldData;

          const filteredItems = oldData.data.filter(
            (item) => item._id !== payload.itemId
          );

          return {
            ...oldData,
            data: filteredItems,
            pagination: {
              ...oldData.pagination,
              totalItems: oldData.pagination.totalItems - 1,
            },
          };
        }
      );
    };

    const handleItemCreated = (payload: ItemCreatedPayload) => {
      console.log("🆕 Received new item:", payload.item);

      queryClient.setQueriesData<GetItemsResponse>(
        { queryKey: ["categories items"] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: [payload.item, ...oldData.data],
            pagination: {
              ...oldData.pagination,
              totalItems: oldData.pagination.totalItems + 1,
            },
          };
        }
      );
    };

    socket.on("itemUpdated", handleItemUpdated);
    socket.on("itemDeleted", handleItemDeleted);
    socket.on("itemCreated", handleItemCreated);

    return () => {
      console.log("🔌 Cleaning up socket listeners...");
      socket.off("itemUpdated", handleItemUpdated);
      socket.off("itemDeleted", handleItemDeleted);
      socket.off("itemCreated", handleItemCreated);
    };
  }, [queryClient, socket]);
}