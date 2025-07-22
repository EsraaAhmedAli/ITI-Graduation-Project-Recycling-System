"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";

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
      console.log(res.data);
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
      await api.post("/cart", item, { withCredentials: true });
      toast.success("Item added to your cart");
      await loadCart();
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const increaseQty = async (item: CartItem) => {
    try {
      await api.put(
        "/cart",
        { categoryId: item.categoryId, quantity: item.quantity + 1 },
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
      await api.put(
        "/cart",
        { categoryId: item.categoryId, quantity: item.quantity - 1 },
        { withCredentials: true }
      );
      await loadCart();
    } catch (err) {
      console.error("Failed to decrease quantity", err);
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
