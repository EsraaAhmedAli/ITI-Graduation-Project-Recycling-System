"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/models/cart";
import api from "@/lib/axios";
import Image from "next/image";
import { toast } from "react-toastify";

type ValidatedItem = {
  material: string;
  quantity: number;
  unit: "KG" | "pieces" | "piece";
};

interface DatabaseItem {
  _id: string;
  name: string;
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
  categoryId: string;
  categoryName: string;
}

interface EnrichedItem extends ValidatedItem {
  _id?: string;
  image?: string;
  points?: number;
  price?: number;
  measurement_unit?: 1 | 2;
  categoryId?: string;
  categoryName?: string;
  found: boolean;
}

interface ItemsDisplayCardProps {
  items: ValidatedItem[];
  onClose: () => void;
}

const ItemsDisplayCard = ({ items, onClose }: ItemsDisplayCardProps) => {
  const [localItems, setLocalItems] = useState<EnrichedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, cart, clearCart, updateCartState } = useCart();
  const router = useRouter();

  // Debug: Monitor cart changes
  useEffect(() => {
    console.log(
      `🛒 Cart updated: ${cart.length} items`,
      cart.map((item) => ({ name: item.name, quantity: item.quantity }))
    );
  }, [cart]);

  // Function to get fresh cart state
  const getFreshCartState = (): CartItem[] => {
    // Try to get fresh cart state from localStorage first
    try {
      const stored = localStorage.getItem("guest_cart"); // Correct key used by CartContext
      const freshCart = stored ? JSON.parse(stored) : [];
      console.log(
        `🔄 Fresh cart state from storage: ${freshCart.length} items`,
        freshCart.map((item: CartItem) => ({
          name: item.name,
          quantity: item.quantity,
        }))
      );
      return freshCart;
    } catch (error) {
      console.error("❌ Error getting fresh cart state:", error);
      return cart; // Fallback to component state
    }
  };

  // Clear cart before starting to add items (to ensure clean start)
  const clearCartBeforeAdding = async () => {
    const currentCart = getFreshCartState();
    if (currentCart.length > 0) {
      console.log("🧹 Clearing existing cart before adding voice items...");
      await clearCart();
      // Wait for cart to be cleared
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  // Improved function to fetch all items at once with role-based pricing
  const fetchAllItemsFromDatabase = async (): Promise<DatabaseItem[]> => {
    try {
      console.log("🔍 Fetching all items from database...");

      // Determine user role for pricing
      let userRole = "customer"; // Default to customer pricing

      try {
        // Check if user is logged in and has buyer role
        const token = localStorage.getItem("token");
        if (token) {
          // Decode token to check user role (you might need to adjust this based on your token structure)
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          if (tokenPayload.role === "buyer") {
            userRole = "buyer";
          }
        }
      } catch (_error) {
        console.log("🔍 Could not determine user role, using customer pricing");
      }

      console.log(`💰 Using ${userRole} pricing`);

      // Use the get-items endpoint with role-based pricing
      const response = await api.get(
        `/categories/get-items?limit=1000&role=${userRole}`
      );
      const allItems = response.data?.data || [];

      console.log(
        `✅ Retrieved ${allItems.length} items from database with ${userRole} pricing`
      );
      return allItems;
    } catch (error) {
      console.error("❌ Error fetching all items:", error);
      return [];
    }
  };

  // Memoize the findMatchingItem function to avoid dependency issues
  const findMatchingItem = useMemo(() => {
    // Helper function to calculate string similarity
    const calculateSimilarity = (str1: string, str2: string): number => {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;

      if (longer.length === 0) return 1.0;

      const editDistance = getEditDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    };

    // Helper function to calculate edit distance (Levenshtein distance)
    const getEditDistance = (str1: string, str2: string): number => {
      const matrix = [];

      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }

      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      return matrix[str2.length][str1.length];
    };

    return (
      itemName: string,
      allItems: DatabaseItem[]
    ): DatabaseItem | null => {
      const normalizedSearchName = itemName.toLowerCase().trim();

      console.log(
        `🔍 Searching for: "${itemName}" (normalized: "${normalizedSearchName}")`
      );
      console.log(
        `📋 Available items: ${allItems.map((item) => item.name).join(", ")}`
      );

      // Clean function to remove Arabic diacritics and normalize text
      const cleanText = (text: string) => {
        return (
          text
            .toLowerCase()
            .trim()
            // Remove Arabic diacritics (ً ٌ ٍ َ ُ ِ ّ ْ)
            .replace(/[\u064B-\u0652]/g, "")
            // Remove common prefixes that might cause issues
            .replace(/^ً+/, "")
            .trim()
        );
      };

      const cleanedSearchName = cleanText(normalizedSearchName);

      // Try EXACT match first (most reliable) - case insensitive
      let found = allItems.find(
        (item) => cleanText(item.name) === cleanedSearchName
      );

      if (found) {
        console.log(`✅ Exact match found: ${itemName} -> ${found.name}`);
        return found;
      }

      // Try exact match with pluralization (add/remove 's')
      const pluralVariations = [
        cleanedSearchName.replace(/s$/, ""), // Remove plural 's' (books -> book)
        cleanedSearchName + "s", // Add plural 's' (book -> books)
      ];

      for (const variation of pluralVariations) {
        if (variation !== cleanedSearchName && variation.length > 2) {
          // Don't repeat the same search and avoid very short strings
          found = allItems.find((item) => cleanText(item.name) === variation);
          if (found) {
            console.log(
              `✅ Exact pluralization match found: ${itemName} -> ${found.name} (via "${variation}")`
            );
            return found;
          }
        }
      }

      // Try common word variations for specific items
      const commonVariations: Record<string, string[]> = {
        newspaper: ["news paper"],
        "news paper": ["newspaper"],
        powerbank: ["power bank"],
        "power bank": ["powerbank"],
        "solid plastic": ["solid plasitc", "plastics"], // Handle the typo in database
        plastic: ["solid plastic", "solid plasitc"],
        plastics: ["solid plastic", "solid plasitc"],
        "water colman": ["water colman"], // Handle Arabic diacritics
        colman: ["water colman"],
      };

      if (commonVariations[cleanedSearchName]) {
        for (const variation of commonVariations[cleanedSearchName]) {
          found = allItems.find(
            (item) => cleanText(item.name) === cleanText(variation)
          );
          if (found) {
            console.log(
              `✅ Common variation match found: ${itemName} -> ${found.name} (via "${variation}")`
            );
            return found;
          }
        }
      }

      // Try fuzzy matching for database typos (like "Solid Plasitc" -> "solid plastic")
      found = allItems.find((item) => {
        const cleanItemName = cleanText(item.name);
        const similarity = calculateSimilarity(
          cleanedSearchName,
          cleanItemName
        );
        return similarity > 0.85; // 85% similarity threshold
      });

      if (found) {
        console.log(
          `✅ Fuzzy match found: ${itemName} -> ${found.name} (similarity match)`
        );
        return found;
      }

      // NO PARTIAL MATCHING - only exact matches allowed
      // This prevents "laptop motherboard" from matching "laptop"
      // If an item doesn't exist exactly in the database, it should be marked as "not in catalog"

      console.log(`❌ No exact match found for: ${itemName}`);
      return null;
    };
  }, []);

  // Function to enrich items with database details
  const enrichItems = useCallback(async () => {
    setIsLoading(true);
    console.log("🚀 Starting item enrichment process...");

    try {
      // Fetch all items from database once
      const allDatabaseItems = await fetchAllItemsFromDatabase();

      const mergedItems = new Map<string, EnrichedItem>(); // Map to track items by database ID

      for (const item of items) {
        console.log(`🔍 Processing item: ${item.material}`);

        const dbItem = findMatchingItem(item.material, allDatabaseItems);

        if (dbItem) {
          console.log(`✅ Found in database: ${item.material}`, {
            id: dbItem._id,
            price: dbItem.price,
            points: dbItem.points,
            category: dbItem.categoryName,
          });

          const enrichedItem: EnrichedItem = {
            ...item,
            material: dbItem.name, // Use database name instead of AI name
            _id: dbItem._id,
            image: dbItem.image,
            points: dbItem.points,
            price: dbItem.price,
            measurement_unit: dbItem.measurement_unit,
            categoryId: dbItem.categoryId,
            categoryName: dbItem.categoryName,
            found: true,
          };

          // Check if we already have this database item (merge duplicates)
          if (mergedItems.has(dbItem._id)) {
            const existingItem = mergedItems.get(dbItem._id)!;
            console.log(
              `🔄 Merging duplicate item: ${item.material} + ${existingItem.material} (both map to ${dbItem.name})`
            );

            // Merge quantities
            existingItem.quantity += item.quantity;
            console.log(
              `➕ Updated quantity: ${existingItem.quantity} ${existingItem.unit}`
            );
          } else {
            console.log(
              `➕ Adding new database item: ${dbItem.name} (${item.quantity} ${item.unit})`
            );
            mergedItems.set(dbItem._id, enrichedItem);
          }
        } else {
          console.log(
            `❌ Not found in database: ${item.material}, using defaults`
          );

          // If not found in database, create with default values
          // Use the original material name as a unique key for non-database items
          const defaultItemKey = `default_${item.material}`;

          const defaultItem: EnrichedItem = {
            ...item,
            points: item.unit === "KG" ? 5 : 2, // Default points
            price: item.unit === "KG" ? 1.5 : 0.5, // Default price
            measurement_unit: item.unit === "KG" ? 1 : 2,
            image: "/placeholder-item.jpg", // Default image
            categoryName: item.material,
            found: false,
          };

          // Check if we already have this default item type
          const existingDefault = Array.from(mergedItems.values()).find(
            (existing) => !existing.found && existing.material === item.material
          );

          if (existingDefault) {
            console.log(`🔄 Merging duplicate default item: ${item.material}`);
            existingDefault.quantity += item.quantity;
            console.log(
              `➕ Updated quantity: ${existingDefault.quantity} ${existingDefault.unit}`
            );
          } else {
            console.log(
              `➕ Adding new default item: ${item.material} (${item.quantity} ${item.unit})`
            );
            mergedItems.set(defaultItemKey, defaultItem);
          }
        }
      }

      // Convert merged items map to array
      const finalEnrichedItems = Array.from(mergedItems.values());

      console.log(
        `✅ Enrichment complete. Found ${
          finalEnrichedItems.filter((i) => i.found).length
        }/${finalEnrichedItems.length} unique items in database`
      );
      console.log(
        `🔄 Merged from ${items.length} original items to ${finalEnrichedItems.length} final items`
      );

      setLocalItems(finalEnrichedItems);
    } catch (error) {
      console.error("❌ Error during enrichment:", error);
      toast.error("Failed to load item details");
    } finally {
      setIsLoading(false);
    }
  }, [items, findMatchingItem]);

  useEffect(() => {
    enrichItems();
  }, [enrichItems]);

  const increaseQuantity = (index: number) => {
    setLocalItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const increment =
            item.unit === "pieces" || item.unit === "piece" ? 1 : 0.25;
          return { ...item, quantity: item.quantity + increment };
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (index: number) => {
    setLocalItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const isPiece = item.unit === "pieces" || item.unit === "piece";
          const decrement = isPiece ? 1 : 0.25;
          const minValue = isPiece ? 1 : 0.25;
          return {
            ...item,
            quantity: Math.max(item.quantity - decrement, minValue),
          };
        }
        return item;
      })
    );
  };

  const removeItem = (index: number) => {
    setLocalItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, value: string) => {
    const item = localItems[index];

    if (value === "") {
      setLocalItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, quantity: 0 } : item))
      );
      return;
    }

    if (item.unit === "pieces" || item.unit === "piece") {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        setLocalItems((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, quantity: numValue } : item
          )
        );
      }
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setLocalItems((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, quantity: numValue } : item
          )
        );
      }
    }
  };

  const handleQuantityBlur = (index: number) => {
    const item = localItems[index];
    const isKG = item.unit === "KG";

    if (isKG) {
      // For KG items, round to nearest 0.25
      const rounded = Math.round(item.quantity * 4) / 4;
      const minValue = 0.25;
      const finalValue = Math.max(rounded, minValue);

      setLocalItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, quantity: finalValue } : item
        )
      );
    } else {
      // For pieces, round to nearest integer
      const minValue = 1;
      const finalValue = Math.max(Math.round(item.quantity || 0), minValue);

      setLocalItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, quantity: finalValue } : item
        )
      );
    }
  };

  // Validate quantity before adding to cart
  const validateQuantityForCart = (quantity: number, unit: string): boolean => {
    if (unit === "KG") {
      // Check for 0.25 increments
      const multiplied = Math.round(quantity * 4);
      return multiplied >= 1 && Math.abs(quantity * 4 - multiplied) < 0.0001;
    } else {
      // Piece items must be whole numbers >= 1
      return Number.isInteger(quantity) && quantity >= 1;
    }
  };

  // Function to add multiple items to cart in batch (avoid race conditions)
  const addItemsToCartBatch = async (items: any[]) => {
    console.log("🛒 Starting batch add to cart...");

    // Clear cart first
    await clearCartBeforeAdding();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for clear to complete

    // Get fresh empty cart state
    let currentCart = getFreshCartState();
    console.log("🔍 Starting with fresh cart:", currentCart.length);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`� Batch adding item ${i + 1}/${items.length}: ${item.name}`);

      // Create the cart item
      const cartItem: CartItem = {
        _id: item._id,
        categoryId: item.categoryId!,
        categoryName: item.categoryName!,
        name: item.material,
        image: item.image!,
        points: item.points!,
        price: item.price!,
        measurement_unit: item.measurement_unit!,
        quantity: item.quantity,
        paymentMethod: "cash",
        deliveryFee: 0,
      };

      // Add to our local cart array
      currentCart = [...currentCart, cartItem];

      // Save to localStorage directly
      try {
        localStorage.setItem("guest_cart", JSON.stringify(currentCart));
        console.log(
          `💾 Saved item ${i + 1} to localStorage. Cart now has ${
            currentCart.length
          } items`
        );
      } catch (error) {
        console.error("❌ Failed to save to localStorage:", error);
      }

      // Small delay between items
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Trigger a cart context update by calling addToCart with the last item
    // This will sync the React state with our localStorage changes
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      const lastCartItem: CartItem = {
        _id: lastItem._id,
        categoryId: lastItem.categoryId!,
        categoryName: lastItem.categoryName!,
        name: lastItem.material,
        image: lastItem.image!,
        points: lastItem.points!,
        price: lastItem.price!,
        measurement_unit: lastItem.measurement_unit!,
        quantity: lastItem.quantity,
        paymentMethod: "cash",
        deliveryFee: 0,
      };

      console.log("🔄 Triggering context sync with last item...");
      // Force the cart context to reload from localStorage
      try {
        // First clear the context cart
        clearCart();
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Then add one item to trigger reload
        await addToCart(lastCartItem);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("❌ Failed to sync context:", error);
      }
    }

    const finalCart = getFreshCartState();
    console.log(
      `✅ Batch add complete. Final cart has ${finalCart.length} items:`,
      finalCart.map((item) => ({ name: item.name, quantity: item.quantity }))
    );

    return finalCart.length;
  };

  // Direct updateCartState approach - merge with existing cart instead of clearing
  const addAllToCart = async () => {
    console.log(
      "🛒 Starting cart addition using context updateCartState (merging mode)..."
    );
    setIsAddingToCart(true);

    try {
      const itemsInCatalog = localItems.filter((item) => item.found);

      if (itemsInCatalog.length === 0) {
        toast.error("No items in catalog to add to cart");
        return;
      }

      console.log(`📦 Found ${itemsInCatalog.length} items in catalog to add`);

      // Validate all items first
      const validItems = [];
      for (const item of itemsInCatalog) {
        if (!item.found || !item._id) {
          console.log(`⏭️ Skipping ${item.material}: Not found in database`);
          continue;
        }

        if (!validateQuantityForCart(item.quantity, item.unit)) {
          const message =
            item.unit === "KG"
              ? `${item.material}: For KG items, quantity must be in 0.25 increments`
              : `${item.material}: For Piece items, quantity must be whole numbers ≥ 1`;
          console.log(
            `❌ Invalid quantity for ${item.material}: ${item.quantity}`
          );
          toast.error(message);
          continue;
        }

        validItems.push(item);
      }

      if (validItems.length === 0) {
        toast.error("No valid items to add to cart");
        return;
      }

      console.log(`✅ ${validItems.length} items passed validation`);

      // Get current cart state for merging
      console.log("🔄 Getting current cart state for merging...");
      const currentCart = getFreshCartState();
      console.log(`📋 Current cart has ${currentCart.length} items`);

      // Build new cart items
      const newCartItems: CartItem[] = [];

      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        console.log(
          `🔄 Building cart item ${i + 1}/${validItems.length}: ${
            item.material
          }`
        );

        const cartItem: CartItem = {
          _id: item._id,
          categoryId: item.categoryId!,
          categoryName: item.categoryName!,
          name: item.material,
          image: item.image!,
          points: item.points!,
          price: item.price!,
          measurement_unit: item.measurement_unit!,
          quantity: item.quantity,
          paymentMethod: "cash",
          deliveryFee: 0,
        };

        newCartItems.push(cartItem);
        console.log(
          `➕ Built cart item: ${item.material} (${item.quantity} ${item.unit})`
        );
      }

      // Merge logic: Check for existing items and either update quantity or add new
      const mergedCart = [...currentCart];
      let addedCount = 0;
      let updatedCount = 0;

      for (const newItem of newCartItems) {
        const existingItemIndex = mergedCart.findIndex(
          (existingItem) => existingItem._id === newItem._id
        );

        if (existingItemIndex !== -1) {
          // Item exists, update quantity
          const existingItem = mergedCart[existingItemIndex];
          const newQuantity = existingItem.quantity + newItem.quantity;
          mergedCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
          console.log(
            `🔄 Updated existing item: ${newItem.name} (${existingItem.quantity} + ${newItem.quantity} = ${newQuantity})`
          );
          updatedCount++;
        } else {
          // New item, add to cart
          mergedCart.push(newItem);
          console.log(
            `➕ Added new item: ${newItem.name} (${newItem.quantity} ${
              newItem.measurement_unit === 1 ? "KG" : "pieces"
            })`
          );
          addedCount++;
        }
      }

      // Use the context's updateCartState method with merged cart
      console.log(
        `💾 Using updateCartState to merge cart: ${mergedCart.length} total items (${addedCount} new, ${updatedCount} updated)...`
      );
      await updateCartState(mergedCart);

      // Wait for the debounced save to complete
      console.log("⏳ Waiting for cart state to fully sync...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify the cart state
      const finalCart = getFreshCartState();
      console.log(`📊 Final results: Cart has ${finalCart.length} items`);
      console.log(
        "🔍 Final cart contents:",
        finalCart.map((item) => ({ name: item.name, quantity: item.quantity }))
      );

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      const message =
        addedCount > 0 && updatedCount > 0
          ? `Added ${addedCount} new items and updated ${updatedCount} existing items in cart!`
          : addedCount > 0
          ? `Added ${addedCount} new items to cart!`
          : `Updated ${updatedCount} items in cart!`;

      console.log(`🎉 ${message}`);
      toast.success(message);

      return validItems.length;
    } catch (error) {
      console.error("❌ Error in addAllToCart:", error);
      toast.error("Failed to add items to cart");
      return 0;
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCheckout = async () => {
    console.log("🚀 Starting checkout process...");
    try {
      await addAllToCart();
      console.log("✅ All items added, navigating immediately...");

      // Navigate to cart immediately
      console.log("📍 Navigating to cart page...");
      router.push("/cart");

      // Close modal immediately
      console.log("🚪 Closing modal...");
      onClose();
    } catch (error) {
      console.error("❌ Error during checkout:", error);
      onClose();
    }
  };

  const handleBrowseMore = async () => {
    console.log("🚀 Starting browse more process...");
    try {
      await addAllToCart();
      console.log("✅ All items added, navigating immediately...");

      // Navigate to category immediately
      console.log("📍 Navigating to category page...");
      router.push("/category");

      // Close modal immediately
      console.log("🚪 Closing modal...");
      onClose();
    } catch (error) {
      console.error("❌ Error during browse more:", error);
      onClose();
    }
  };

  const handleCloseWithoutSaving = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseWithoutSaving();
    }
  };

  // Loading state component remains the same
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mb-4">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state component remains the same
  if (localItems.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No items found in your order</p>
            <button
              onClick={handleCloseWithoutSaving}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component UI remains the same...
  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {showSuccess && (
          <div className="absolute top-4 left-4 right-4 bg-success text-white px-4 py-2 rounded-lg flex items-center space-x-2 z-10">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Items added to cart successfully!</span>
          </div>
        )}

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              AI Found Items
            </h3>
            <button
              onClick={handleCloseWithoutSaving}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {localItems.map((item, index) => {
              // Only show calculated values for items found in database
              const calculatedPoints = item.found
                ? Math.floor(item.quantity * (item.points || 0))
                : 0;
              const calculatedPrice = item.found
                ? (item.quantity * (item.price || 0)).toFixed(2)
                : "0.00";

              return (
                <div
                  key={index}
                  className={`border rounded-xl p-5 transition-all duration-200 ${
                    item.found
                      ? "bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 hover:from-primary/10 hover:to-secondary/10"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-150"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Item Image - only show for items in catalog */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.found &&
                        item.image &&
                        item.image !== "/placeholder-item.jpg" ? (
                          <Image
                            src={item.image}
                            alt={item.material}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const nextSibling = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (nextSibling)
                                nextSibling.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`${
                            item.found &&
                            item.image &&
                            item.image !== "/placeholder-item.jpg"
                              ? "hidden"
                              : ""
                          } text-gray-400`}
                        >
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-800 text-xl mb-2">
                            {item.material}
                            {!item.found && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                Not in catalog
                              </span>
                            )}
                            {item.found && (
                              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                ✓ Found in catalog
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-6 mb-2">
                          <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <span>Unit:</span>
                            <span className="font-medium">
                              {item.unit === "KG" ? "Kilograms" : "Pieces"}
                            </span>
                          </p>
                          {/* Only show points and price for items found in catalog */}
                          {item.found && (
                            <>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm text-success font-semibold">
                                  {calculatedPoints} pts
                                </span>
                                <svg
                                  className="w-4 h-4 text-success"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                  />
                                </svg>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm text-blue-600 font-semibold">
                                  {calculatedPrice} EGP
                                </span>
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                  />
                                  <circle cx="12" cy="12" r="2" />
                                </svg>
                              </div>
                            </>
                          )}
                          {/* Show message for items not in catalog */}
                          {!item.found && (
                            <div className="text-sm text-orange-600 italic">
                              Price and points will be available when added to
                              catalog
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                      title="Remove item"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Only show quantity controls for items in catalog */}
                    {item.found ? (
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => decreaseQuantity(index)}
                          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={
                            item.unit === "pieces"
                              ? item.quantity <= 1
                              : item.quantity <= 0.25
                          }
                        >
                          <svg
                            className="w-5 h-5 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>

                        <div className="bg-white border border-gray-300 rounded-lg px-4 py-3 min-w-[100px] text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(index, e.target.value)
                            }
                            onBlur={() => handleQuantityBlur(index)}
                            className="w-full text-center font-semibold text-gray-800 text-lg bg-transparent border-none outline-none"
                            min={
                              item.unit === "pieces" || item.unit === "piece"
                                ? "1"
                                : "0.25"
                            }
                            step={
                              item.unit === "pieces" || item.unit === "piece"
                                ? "1"
                                : "0.25"
                            }
                          />
                        </div>

                        <button
                          onClick={() => increaseQuantity(index)}
                          className="w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        Item detected but not available in catalog
                      </div>
                    )}

                    <div className="text-right">
                      {item.found ? (
                        <>
                          <div className="text-sm text-gray-500">Total</div>
                          <div className="font-semibold text-primary text-lg">
                            {item.quantity} {item.unit}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 italic">
                          Not available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-6">
            {/* Show notification if there are items not in catalog */}
            {localItems.some((item) => !item.found) && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-sm text-orange-700">
                    {localItems.filter((item) => !item.found).length} item(s)
                    detected but not available in our catalog. Only items in
                    catalog can be added to cart.
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleBrowseMore}
                className="flex-1 bg-gradient-to-r from-neutral to-neutral/90 hover:from-neutral/90 hover:to-neutral text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>Browse More</span>
              </button>

              <button
                onClick={handleCheckout}
                disabled={
                  localItems.filter((item) => item.found).length === 0 ||
                  isAddingToCart
                }
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M9 19.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zM20.5 19.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"
                      />
                    </svg>
                    <span>
                      {localItems.filter((item) => item.found).length === 0
                        ? "No Items to Checkout"
                        : "Proceed to Checkout"}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Total Items</div>
                  <div className="text-xl font-semibold text-gray-800">
                    {localItems.length}
                  </div>
                  <div className="text-xs text-gray-500">
                    ({localItems.filter((item) => item.found).length} in
                    catalog)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">
                    Available Quantity
                  </div>
                  <div className="text-xl font-semibold text-gray-800">
                    {localItems
                      .filter((item) => item.found)
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Points</div>
                  <div className="text-xl font-semibold text-success flex items-center justify-center space-x-1">
                    <span>
                      {localItems
                        .filter((item) => item.found)
                        .reduce(
                          (sum, item) =>
                            sum +
                            Math.floor(item.quantity * (item.points || 0)),
                          0
                        )}
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Price</div>
                  <div className="text-xl font-semibold text-blue-600 flex items-center justify-center space-x-1">
                    <span>
                      {localItems
                        .filter((item) => item.found)
                        .reduce(
                          (sum, item) =>
                            sum + item.quantity * (item.price || 0),
                          0
                        )
                        .toFixed(2)}{" "}
                      EGP
                    </span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsDisplayCard;
