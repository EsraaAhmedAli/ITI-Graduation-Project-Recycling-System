"use client";

import { createContext, useContext, useState, ReactNode } from "react";


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
  addToCart: (item: CartItem) => void;
  increaseQty: (item: CartItem) => void;
  decreaseQty: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
  clearCart: () => void;
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

 
const addToCart = (item: CartItem) => {
  setCart((prevCart) => {
    const exists = prevCart.find(
      (i) =>
        i.itemName === item.itemName &&
        i.categoryId === item.categoryId
    );
    if (exists) {
      return prevCart.map((i) =>
        i.itemName === item.itemName && i.categoryId === item.categoryId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      return [...prevCart, item];
    }
  });
};


 
  const increaseQty = (item: CartItem) => {
    setCart((prev) =>
      prev.map((i) =>
        i === item ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  
  const decreaseQty = (item: CartItem) => {
    setCart((prev) =>
      prev.map((i) =>
        i === item ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i
      )
    );
  };

 
  const removeFromCart = (item: CartItem) => {
    setCart((prev) => prev.filter((i) => i !== item));
  };

  
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, increaseQty, decreaseQty, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
