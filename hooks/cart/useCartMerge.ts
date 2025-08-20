import api from "@/lib/axios";
import { CartItem } from "@/models/cart";
import { useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
interface ItemName {
  en: string;
  ar: string;
}

interface BackendItem {
  _id: string;
  name: ItemName;
  points: number;
  price: number;
  quantity: number;
  measurement_unit: number;
  image: string;
  displayName: string;
}

interface BackendCategory {
  _id: string;
  name: ItemName;
  description: ItemName;
  image: string;
  items: BackendItem[];
  createdAt: string;
  updatedAt: string;
  displayName: string;
  displayDescription: string;
}

interface BackendResponse {
  success: boolean;
  data: BackendCategory[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const useCartMerge = ({
  loadCart,
  loadCartFromDatabase,
  loadCartFromSession,
  setCart,
  setCartDirty,
  clearCartFromSession,
  userRole,
  checkInventoryEnhanced,
  saveCartToDatabase,
  setIsLoading,
  setMergingOptions,
  mergingOptions,
}) => {
  const pendingGuestCart = useRef<CartItem[]>([]);
  const pendingUserCart = useRef<CartItem[]>([]);
  const getAllItemsFromCategories = useCallback(
    (categories: BackendCategory[]): BackendItem[] => {
      const allItems: BackendItem[] = [];
      categories.forEach((category) => {
        if (category.items && Array.isArray(category.items)) {
          allItems.push(...category.items);
        }
      });
      return allItems;
    },
    []
  );

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
        if (userRole === "buyer") {
          console.log("Validating inventory for merged cart items...");
          const validatedCart: CartItem[] = [];
          let hasInventoryIssues = false;

          for (const item of mergedCart) {
            const isAvailable = await checkInventoryEnhanced(
              item,
              item.quantity
            );
            if (isAvailable) {
              validatedCart.push(item);
            } else {
              console.warn(
                `Insufficient inventory for ${item.name}, quantity: ${item.quantity}`
              );
              hasInventoryIssues = true;

              // Try to find the maximum available quantity
              try {
                const res = await api.get(
                  "/categories/get-items?limit=10000&role=buyer"
                );
                const response: BackendResponse = res.data;

                if (response.success && response.data) {
                  const allItems = getAllItemsFromCategories(response.data);
                  const foundItem = allItems.find(
                    (i: BackendItem) => i._id === item._id
                  );

                  if (foundItem && foundItem.quantity > 0) {
                    const maxQuantity = foundItem.quantity;
                    const increment = item.measurement_unit === 1 ? 0.25 : 1;
                    const adjustedQuantity =
                      Math.floor(maxQuantity / increment) * increment;
                    if (adjustedQuantity > 0) {
                      validatedCart.push({
                        ...item,
                        quantity: adjustedQuantity,
                      });
                      console.log(
                        `Adjusted ${item.name} quantity to available stock: ${adjustedQuantity}`
                      );
                    }
                  }
                }
              } catch (error) {
                console.error(
                  "Failed to check individual item availability:",
                  error
                );
              }
            }
          }

          if (hasInventoryIssues) {
            toast.error(
              "Some items had limited stock and quantities were adjusted"
            );
          }

          setCart(validatedCart);
          await saveCartToDatabase(validatedCart);
        } else {
          // For customers, no inventory validation needed
          setCart(mergedCart);
          await saveCartToDatabase(mergedCart);
        }

        // Clear guest cart after successful merge
        clearCartFromSession();
        setCartDirty(false);

        // Show success message
        if (guestCart.length > 0) {
          toast.success(
            `Cart merged successfully! ${mergedCart.length} items total.`
          );
        } else {
          toast.success("Welcome back! Your cart has been loaded.");
        }
      } catch (error) {
        console.error("Failed to perform cart merge:", error);
        throw error;
      }
    },
    [
      mergeCartItems,
      userRole,
      saveCartToDatabase,
      clearCartFromSession,
      checkInventoryEnhanced,
      getAllItemsFromCategories,
      setCart,
      setCartDirty,
    ]
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
      setCart,
      setCartDirty,
      setIsLoading,
      setMergingOptions,
    ]
  );

  return {
    mergeCartItems,
    performCartMerge,
    handleCartMerging,
    getAllItemsFromCategories,
  };
};
