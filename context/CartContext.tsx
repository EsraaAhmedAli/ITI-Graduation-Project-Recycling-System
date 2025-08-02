

"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { ICartItem } from "@/models/cart";
import { useUserAuth } from "@/context/AuthFormContext";

type CartContextType = {
  cart: ICartItem[];
  addToCart: (item: ICartItem) => Promise<void>;
  increaseQty: (item: ICartItem) => Promise<void>;
  decreaseQty: (item: ICartItem) => Promise<void>;
  removeFromCart: (item: ICartItem) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  loadingItemId: string | null;
  checkInventory: (itemId: string, quantity: number) => Promise<boolean>;
  checkInventoryEnhanced: (item: ICartItem, quantity: number) => Promise<boolean>;
  isItemInStock: (item: ICartItem) => boolean;
  userRole: 'customer' | 'buyer';
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { user } = useUserAuth();
  const userRole = user?.role === 'buyer' ? 'buyer' : 'customer';

  const loadCart = useCallback(async () => {
    try {
      const res = await api.get("/cart", { withCredentials: true });
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Failed to load cart", err);
      toast.error("Failed to load cart items");
    }
  }, []);

  const checkInventoryEnhanced = useCallback(async (item: ICartItem, quantity: number): Promise<boolean> => {
    try {
      const res = await api.get("/categories/get-items?limit=10000&role=buyer");
      const allItems = res.data?.data || [];

      const foundItem = allItems.find((apiItem: any) => 
        apiItem._id === item._id ||
        apiItem._id === item.categoryId ||
        apiItem.name?.toLowerCase() === item.itemName?.toLowerCase()
      );

      if (!foundItem) {
        console.warn("Item not found in inventory:", item);
        return false;
      }

      const availableQuantity = foundItem.quantity ?? foundItem.availableQty ?? foundItem.stock ?? 0;
      return availableQuantity >= quantity;
    } catch (err) {
      console.error("Failed to check inventory:", err);
      return false;
    }
  }, []);

  const validateQuantity = useCallback((quantity: number, measurementUnit: number): boolean => {
    if (measurementUnit === 1) {
      if (quantity < 1) return false;
      const multiplied = Math.round(quantity * 4);
      return Math.abs(quantity * 4 - multiplied) < 0.0001;
    }
    return Number.isInteger(quantity) && quantity >= 1;
  }, []);

  const addToCart = useCallback(async (item: ICartItem) => {
    setLoadingItemId(item._id);
    try {
      const validatedItem = { ...item };
      if (validatedItem.measurement_unit === 1 && validatedItem.quantity < 1) {
        validatedItem.quantity = 1;
      }

      if (!validateQuantity(validatedItem.quantity, validatedItem.measurement_unit)) {
        const message = validatedItem.measurement_unit === 1
          ? "For KG items, minimum quantity is 1 KG and must be in 0.25 increments"
          : "For Piece items, quantity must be whole numbers ≥ 1";
        toast.error(message);
        return;
      }

      if (userRole === 'buyer') {
        const isAvailable = await checkInventoryEnhanced(validatedItem, validatedItem.quantity);
        if (!isAvailable) {
          toast.error("Sorry, the requested quantity is not available in stock.");
          return;
        }
      }

      await api.post("/cart", validatedItem, { withCredentials: true });
      await loadCart();
      toast.success(`${validatedItem.itemName} added to cart successfully!`);
    } catch (err) {
      console.error("Failed to add to cart", err);
      toast.error("Failed to add item to cart");
    } finally {
      setLoadingItemId(null);
    }
  }, [checkInventoryEnhanced, loadCart, userRole, validateQuantity]);

const increaseQty = async (item: ICartItem) => {
  try {
    const increment = item.measurement_unit === 1 ? 0.25 : 1;
    const newQuantity = item.quantity + increment;

    if (userRole === 'buyer') {
      const isAvailable = await checkInventoryEnhanced(item, newQuantity);
      if (!isAvailable) {
        toast.error("Sorry, the requested quantity is not available in stock.");
        return; // هذا قد يسبب مشكلة إذا لم يتم التعامل معه بشكل صحيح
      }
    }

    await api.put("/cart", { 
      categoryId: item.categoryId, 
      quantity: newQuantity 
    }, { 
      withCredentials: true 
    });
    
    await loadCart(); // تأكد أن هذه الوظيفة لا تسبب إعادة تحميل
  } catch (err) {
    console.error("Failed to increase quantity", err);
    toast.error("Failed to increase item quantity");
  }
};
  const decreaseQty = useCallback(async (item: ICartItem) => {
    const decrement = item.measurement_unit === 1 ? 0.25 : 1;
    const minValue = item.measurement_unit === 1 ? 1 : 1;

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
      toast.error("Failed to decrease item quantity");
    }
  }, [loadCart]);

  const removeFromCart = useCallback(async (item: ICartItem) => {
    setLoadingItemId(item.categoryId);
    try {
      await api.delete(`/cart/${item.categoryId}`, { withCredentials: true });
      toast.success("Item removed from cart");
      await loadCart();
    } catch (err) {
      console.error("Failed to remove from cart", err);
      toast.error("Failed to remove item from cart");
    } finally {
      setLoadingItemId(null);
    }
  }, [loadCart]);

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart", { withCredentials: true });
      setCart([]);
      toast.success("Cart cleared successfully");
    } catch (err) {
      console.error("Failed to clear cart", err);
      toast.error("Failed to clear cart");
    }
  }, []);

  const contextValue = {
    cart,
    loadingItemId,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    loadCart,
    checkInventory: checkInventoryEnhanced,
    checkInventoryEnhanced,
    isItemInStock: (item: ICartItem) => (item.availableQty ?? 0) > 0,
    userRole
  };

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}