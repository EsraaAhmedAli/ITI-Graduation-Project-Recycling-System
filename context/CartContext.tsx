"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export interface CartItem {
  categoryId: string;
  itemName: string;
  image: string;
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

  const loadCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/cart", {
        withCredentials: true
      });
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (item: CartItem) => {
    try {
      await axios.post(
        "http://localhost:5000/cart",
        { categoryName: item.categoryId, quantity: item.quantity },
        { withCredentials: true }
      );
      await loadCart();
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  const increaseQty = async (item: CartItem) => {
    try {
      await axios.put(
        "http://localhost:5000/cart",
        { categoryName: item.categoryId, quantity: item.quantity + 1 },
        { withCredentials: true }
      );
      await loadCart();
    } catch (err) {
      console.error("Failed to increase quantity", err);
    }
  };

  const decreaseQty = async (item: CartItem) => {
    if (item.quantity <= 1) return;
    try {
      await axios.put(
        "http://localhost:5000/cart",
        { categoryName: item.categoryId, quantity: item.quantity - 1 },
        { withCredentials: true }
      );
      await loadCart();
    } catch (err) {
      console.error("Failed to decrease quantity", err);
    }
  };

  const removeFromCart = async (item: CartItem) => {
    try {
      await axios.delete(`http://localhost:5000/cart/${item.categoryId}`, {
        withCredentials: true
      });
      await loadCart();
    } catch (err) {
      console.error("Failed to remove from cart", err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete("http://localhost:5000/cart", {
        withCredentials: true
      });
      setCart([]);
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, increaseQty, decreaseQty, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
