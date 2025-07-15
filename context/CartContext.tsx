"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// نوع العنصر داخل السلة
export interface CartItem {
  categoryId: string;
  subcategoryName: string;
  points: number;
  unit: string;
  quantity: number;
}

// شكل السياق (context)
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  increaseQty: (item: CartItem) => void;
  decreaseQty: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
  clearCart: () => void;
}

// إنشاء السياق
const CartContext = createContext<CartContextType | undefined>(undefined);

// hook لاستخدام السياق
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// مزود السياق
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // إضافة للسلة
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const exists = prevCart.find(
        (i) =>
          i.subcategoryName === item.subcategoryName &&
          i.categoryId === item.categoryId
      );
      if (exists) {
        return prevCart.map((i) =>
          i === exists ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prevCart, item];
      }
    });
  };

  // زيادة الكمية
  const increaseQty = (item: CartItem) => {
    setCart((prev) =>
      prev.map((i) =>
        i === item ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  // تقليل الكمية
  const decreaseQty = (item: CartItem) => {
    setCart((prev) =>
      prev.map((i) =>
        i === item ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i
      )
    );
  };

  // حذف عنصر من السلة
  const removeFromCart = (item: CartItem) => {
    setCart((prev) => prev.filter((i) => i !== item));
  };

  // حذف كل السلة
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, increaseQty, decreaseQty, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
