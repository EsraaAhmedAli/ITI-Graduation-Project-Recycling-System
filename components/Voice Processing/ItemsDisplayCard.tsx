"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CartItem, useCart } from "@/context/CartContext";
import api from "@/lib/axios";
import Image from "next/image";
import { toast } from "react-toastify";
import { useCategories } from "@/hooks/useGetCategories";

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
}

interface EnrichedItem extends ValidatedItem {
  _id?: string;
  image?: string;
  points?: number;
  price?: number;
  measurement_unit?: 1 | 2;
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
  const { addToCart } = useCart();
  const { getCategoryIdByItemName } = useCategories();
  const router = useRouter();

  // Function to fetch item details from database
  const fetchItemDetails = async (
    itemName: string
  ): Promise<DatabaseItem | null> => {
    try {
      // First, try to get all categories to find which one contains our item
      const categoriesResponse = await api.get("/categories");
      const categories = categoriesResponse.data;

      for (const category of categories) {
        try {
          const itemsResponse = await api.get(
            `/categories/get-items/${category.name}`
          );
          const categoryItems = itemsResponse.data;

          // Look for exact match or close match
          const foundItem = categoryItems.find(
            (item: DatabaseItem) =>
              item.name.toLowerCase() === itemName.toLowerCase() ||
              item.name.toLowerCase().includes(itemName.toLowerCase()) ||
              itemName.toLowerCase().includes(item.name.toLowerCase())
          );

          if (foundItem) {
            return foundItem;
          }
        } catch (error) {
          console.error(
            `Error fetching items for category ${category.name}:`,
            error
          );
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching item details:", error);
      return null;
    }
  };

  // Function to enrich items with database details
  const enrichItems = useCallback(async () => {
    setIsLoading(true);
    const enrichedItems: EnrichedItem[] = [];

    for (const item of items) {
      const dbItem = await fetchItemDetails(item.material);

      if (dbItem) {
        enrichedItems.push({
          ...item,
          _id: dbItem._id,
          image: dbItem.image,
          points: dbItem.points,
          price: dbItem.price,
          measurement_unit: dbItem.measurement_unit,
          found: true,
        });
      } else {
        // If not found in database, create with default values
        enrichedItems.push({
          ...item,
          points: item.unit === "KG" ? 5 : 2, // Default points
          price: item.unit === "KG" ? 1.5 : 0.5, // Default price
          measurement_unit: item.unit === "KG" ? 1 : 2,
          image: "/placeholder-item.jpg", // Default image
          found: false,
        });
      }
    }

    setLocalItems(enrichedItems);
    setIsLoading(false);
  }, [items]);

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

  // const addAllToCart = async () => {
  //   for (const item of localItems) {
  //     // Validate quantity before adding
  //     if (!validateQuantityForCart(item.quantity, item.unit)) {
  //       const message = item.unit === "KG"
  //         ? `${item.material}: For KG items, quantity must be in 0.25 increments`
  //         : `${item.material}: For Piece items, quantity must be whole numbers ≥ 1`;
  //       toast.error(message);
  //       return;
  //     }

  //     if (item.found && item._id) {
  //       // For items found in database, use their actual data
  //       const cartItem:CartItem = {
  //         categoryId: item._id,
  //         itemName: item.material,
  //         image: item.image || "/placeholder-item.jpg",
  //         points: item.points || 0,
  //         price: item.price || 0,
  //         measurement_unit: item.measurement_unit || (item.unit === "KG" ? 1 : 2),
  //         quantity: item.quantity,
  //         _id:item._id,
  //         categoryName:item.material,
  //         originalCategoryId:getCategoryIdByItemName(item.)

  //       };
  //       await addToCart(cartItem);
  //     } else {
  //       // For items not found in database, use default values but still add to cart
  //       const cartItem = {
  //         categoryId: `voice-order-${item.material.toLowerCase().replace(/\s+/g, '-')}`,
  //         itemName: item.material,
  //         image: "/placeholder-item.jpg",
  //         points: item.points || (item.unit === "KG" ? 5 : 2),
  //         price: item.price || (item.unit === "KG" ? 1.5 : 0.5),
  //         measurement_unit: item.unit === "KG" ? 1 : 2,
  //         quantity: item.quantity,
  //       };
  //       await addToCart(cartItem);
  //     }
  //   }
  //   setShowSuccess(true);
  //   setTimeout(() => setShowSuccess(false), 3000);
  // };
  const addAllToCart = async () => {
    for (const item of localItems) {
      // Validate quantity before adding
      if (!validateQuantityForCart(item.quantity, item.unit)) {
        const message =
          item.unit === "KG"
            ? `${item.material}: For KG items, quantity must be in 0.25 increments`
            : `${item.material}: For Piece items, quantity must be whole numbers ≥ 1`;
        toast.error(message);
        return;
      }

      const measurement_unit = item.unit === "KG" ? 1 : 2;

      const baseCartItem = {
        itemName: item.material,
        image: item.image || "/placeholder-item.jpg",
        points: item.points ?? (measurement_unit === 1 ? 5 : 2),
        price: item.price ?? (measurement_unit === 1 ? 1.5 : 0.5),
        measurement_unit,
        quantity: item.quantity,
        categoryName: item.material,
      };

      if (item.found && item._id) {
        const categoryId = getCategoryIdByItemName(item.material);

        const cartItem: CartItem = {
          ...baseCartItem,
          _id: item._id,
          categoryId,
          name: baseCartItem.itemName,
        };

        await addToCart(cartItem);
      } else {
        // fallback for unknown items
        const fallbackId = `voice-order-${item.material
          .toLowerCase()
          .replace(/\s+/g, "-")}`;
        const cartItem: CartItem = {
          ...baseCartItem,
          _id: fallbackId,
          categoryId: fallbackId,
          name: baseCartItem.itemName,
        };

        await addToCart(cartItem);
      }
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCheckout = () => {
    addAllToCart();
    router.push("/cart");
    onClose();
  };

  const handleBrowseMore = () => {
    addAllToCart();
    router.push("/category");
    onClose();
  };

  const handleCloseWithoutSaving = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseWithoutSaving();
    }
  };

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
              const calculatedPoints = Math.floor(
                item.quantity * (item.points || (item.unit === "KG" ? 5 : 2))
              );
              const calculatedPrice = (
                item.quantity * (item.price || (item.unit === "KG" ? 1.5 : 0.5))
              ).toFixed(2);

              return (
                <div
                  key={index}
                  className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image &&
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
                            item.image && item.image !== "/placeholder-item.jpg"
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
                          </h4>
                        </div>
                        <div className="flex items-center space-x-6 mb-2">
                          <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <span>Unit:</span>
                            <span className="font-medium">
                              {item.unit === "KG" ? "Kilograms" : "Pieces"}
                            </span>
                          </p>
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

                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="font-semibold text-primary text-lg">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-6">
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
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M9 19.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zM20.5 19.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"
                  />
                </svg>
                <span>Proceed to Checkout</span>
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Total Items</div>
                  <div className="text-xl font-semibold text-gray-800">
                    {localItems.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Quantity</div>
                  <div className="text-xl font-semibold text-gray-800">
                    {localItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Points</div>
                  <div className="text-xl font-semibold text-success flex items-center justify-center space-x-1">
                    <span>
                      {localItems.reduce(
                        (sum, item) =>
                          sum +
                          Math.floor(
                            item.quantity *
                              (item.points || (item.unit === "KG" ? 5 : 2))
                          ),
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
                        .reduce(
                          (sum, item) =>
                            sum +
                            item.quantity *
                              (item.price || (item.unit === "KG" ? 1.5 : 0.5)),
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
