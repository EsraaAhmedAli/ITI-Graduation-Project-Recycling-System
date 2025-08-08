import { Item } from "./../components/Types/categories.type";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { queryClient } from "@/lib/queryClient";
import { GetItemsResponse } from "./useGetItems";
import { Category } from "@/components/Types/categories.type";
import { useQueryClient } from "@tanstack/react-query";
import { CartItem } from "@/models/cart";

interface ItemUpdatePayload {
  itemId: string;
  categoryId: string;
  quantity: number;
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
    console.log("🔌 Setting up item socket listeners...");
    if (!socket) return;
    // console.log("🔌 Socket initialized:", socket.);

    // const handleItemUpdated = (updatedItem: ItemUpdatePayload) => {
    //   console.log("🔄 Item updated from socket:", updatedItem);

    //   queryClient.setQueryData(
    //     [
    //       "categories items",
    //       currentPage,
    //       itemsPerPage,
    //       userRole,
    //       selectedCategory,
    //       searchTerm,
    //     ],
    //     (oldData: any) => {
    //       if (!oldData) return oldData;
    //       console.log("old data:", oldData);
    //       const updatedItems = oldData.data.map((item: CartItem) =>
    //         item._id === updatedItem.itemId
    //           ? { ...item, quantity: updatedItem.quantity }
    //           : item
    //       );
    //       return { ...oldData, data: updatedItems };
    //     }
    //   );
    // };
    const handleItemUpdated = (updatedItem: ItemUpdatePayload) => {
      console.log("🔄 Item updated from socket:", updatedItem);

      queryClient.setQueriesData<GetItemsResponse>(
        { predicate: (query) => query.queryKey[0] === "categories items" },
        (oldData) => {
          if (!oldData?.data) return oldData;
          console.log("old data:", oldData);
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
      queryClient.setQueriesData<GetItemsResponse>(
        { predicate: (query) => query.queryKey[0] === "categories items" },
        (oldData) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.filter((item) => item._id !== payload.itemId),
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.totalItems - 1,
            },
          };
        }
      );
    };

    const handleItemCreated = (payload: Category) => {
      queryClient.setQueriesData<GetItemsResponse>(
        { predicate: (query) => query.queryKey[0] === "categories items" },
        (oldData) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: [payload, ...oldData.data],
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.totalItems + 1,
            },
          };
        }
      );
    };

    socket.on("itemUpdated", handleItemUpdated);
    socket.on("itemDeleted", handleItemDeleted);
    socket.on("itemCreated", handleItemCreated);

    return () => {
      socket.off("itemUpdated", handleItemUpdated);
      socket.off("itemDeleted", handleItemDeleted);
      socket.off("itemCreated", handleItemCreated);
    };
  }, [
    queryClient,
    currentPage,
    itemsPerPage,
    userRole,
    selectedCategory,
    searchTerm,
    socket,
  ]);
}
