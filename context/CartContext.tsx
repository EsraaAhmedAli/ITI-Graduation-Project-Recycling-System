"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";

interface CartItem {
  categoryId: string;
  categoryName: string; 
  itemName: string;
  image?: string;
  points: number;
  price: number;
  measurement_unit: number;
  quantity: number;
}


interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  increaseQty: (item: CartItem) => Promise<void>;
  decreaseQty: (item: CartItem) => Promise<void>;
  removeFromCart: (item: CartItem) => Promise<void>;
  clearCart: () => Promise<void>;
    loadCart: () => Promise<void>; 
  loadingItemId: string | null;

}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      const res = await api.get("/cart", {
        withCredentials: true,
      });
      setCart(res.data.items || []);
      console.log(res);
      
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

const addToCart = async (item: CartItem) => {
  setLoadingItemId(item.categoryId);
  try {
    // Validate quantity based on measurement unit
    const isValidQuantity = validateQuantity(item.quantity, item.measurement_unit);
    if (!isValidQuantity) {
      const message = item.measurement_unit === 1 
        ? "For KG items, quantity must be in 0.25 increments"
        : "For Piece items, quantity must be whole numbers ≥ 1";
      toast.error(message);
      return;
    }

    await api.post("/cart", item, { withCredentials: true });
    toast.success("Item added to your cart");
    await loadCart();
  } catch (err) {
    console.error("Failed to add to cart", err);
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response: { data: { message: string } } };
      if (axiosError.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else {
        toast.error("Failed to add item to cart");
      }
    } else {
      toast.error("Failed to add item to cart");
    }
  } finally {
    setLoadingItemId(null);
  }
};

  // Function to validate quantities based on measurement unit
  const validateQuantity = (quantity: number, measurementUnit: number): boolean => {
    if (measurementUnit === 1) { // KG items
      // Check for 0.25 increments
      const multiplied = Math.round(quantity * 4);
      return multiplied >= 1 && Math.abs(quantity * 4 - multiplied) < 0.0001;
    } else { // Piece items
      return Number.isInteger(quantity) && quantity >= 1;
    }
  };

  const increaseQty = async (item: CartItem) => {
    try {
      const increment = item.measurement_unit === 1 ? 0.25 : 1; // KG = 0.25, Piece = 1
      const newQuantity = item.quantity + increment;
      
      await api.put(
        "/cart",
        { categoryId: item.categoryId, quantity: newQuantity },
        { withCredentials: true }
      );
      await loadCart();
    } catch (err) {
      console.error("Failed to increase quantity", err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message: string } } };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        }
      }
    } 
  };

  const decreaseQty = async (item: CartItem) => {
    const decrement = item.measurement_unit === 1 ? 0.25 : 1; // KG = 0.25, Piece = 1
    const minValue = item.measurement_unit === 1 ? 0.25 : 1;
    
    if (item.quantity <= minValue) return;
    
    try {
      const newQuantity = item.quantity - decrement;
      
      await api.put(
        "/cart",
        { categoryId: item.categoryId, quantity: newQuantity },
        { withCredentials: true }
      );
      await loadCart();
    } catch (err) {
      console.error("Failed to decrease quantity", err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message: string } } };
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        }
      }
    }
  };

const removeFromCart = async (item: CartItem) => {
  setLoadingItemId(item.categoryId);
  try {
    await api.delete(`/cart/${item.categoryId}`, {
      withCredentials: true,
    });
    toast.success("Item removed from your cart");
    await loadCart();
  } catch (err) {
    console.error("Failed to remove from cart", err);
    toast.error("Failed to remove item from cart");
  } finally {
    setLoadingItemId(null);
  }
};


  const clearCart = async () => {
    try {
      await api.delete("cart", {
        withCredentials: true,
      });
      setCart([]);
    } catch (err) {
      console.error("Failed to clear cart", err);
    } 
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loadingItemId,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
