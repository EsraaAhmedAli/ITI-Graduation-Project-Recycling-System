// hooks/useCreateOrder.ts - Modified version for profile navigation
import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import { CartItem } from "@/context/CartContext";

interface User {
  _id?: string;
  phoneNumber?: string;
  name?: string;
  email?: string;
  imgUrl?: string;
  role?: string;
}

export interface Address {
  _id: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: number | null;
  apartment: string;
  landmark?: string;
  notes?: string;
}

interface OrderResponse {
  data: {
    _id: string;
  };
}

interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  data?: OrderResponse;
  error?: any;
}

interface UseCreateOrderParams {
  clearCart: () => void;
  // Removed setCurrentStep and setCreatedOrderId since we're navigating to profile
  onOrderSuccess?: (orderId: string) => void; // Optional callback for additional actions
}

interface UseCreateOrderReturn {
  createOrder: (
    selectedAddress: Address | null,
    cart: CartItem[],
    user: User | null,
    deliveryFee?: number,
    paymentMethod?: string
  ) => Promise<CreateOrderResult>;
  isLoading: boolean;
}

export const useCreateOrder = ({
  clearCart,
  onOrderSuccess,
}: UseCreateOrderParams): UseCreateOrderReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createOrder = async (
    selectedAddress: Address | null,
    cart: CartItem[],
    user: User | null,
    deliveryFee: number = 0,
    paymentMethod: string = "cash"
  ): Promise<CreateOrderResult> => {
    console.log("🚀 Creating order with:", {
      cartLength: cart?.length || 0,
      hasAddress: !!selectedAddress,
      hasUser: !!user,
      deliveryFee,
      paymentMethod,
    });

    // Validation
    if (!selectedAddress) {
      console.error("❌ Validation failed: No address");
      toast.error("Please select an address");
      return { success: false };
    }

    if (!cart || cart.length === 0) {
      console.error("❌ Validation failed: Empty cart");
      toast.error("Your cart is empty");
      return { success: false };
    }

    setIsLoading(true);
    console.log("📡 Starting API call...");

    try {
      // Calculate total amount
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalAmount = subtotal + deliveryFee;

      const orderData = {
        address: selectedAddress,
        items: cart,
        phoneNumber: user?.phoneNumber,
        userName: user?.name,
        email: user?.email,
        imageUrl: user?.imgUrl,
        deliveryFee,
        paymentMethod,
        subtotal,
        totalAmount,
        userId: user?._id,
      };

      console.log("📝 Order data:", orderData);

      const response = await api.post<OrderResponse>("orders", orderData);
      const orderId = response.data.data._id;

      console.log("✅ Order created successfully:", {
        orderId,
        status: response.status,
      });

      // Clear cart
      try {
        clearCart();
        console.log("🛒 Cart cleared successfully");
      } catch (clearError) {
        console.error("❌ Failed to clear cart:", clearError);
      }

      // Call optional success callback
      if (onOrderSuccess) {
        onOrderSuccess(orderId);
      }

      toast.success("Order created successfully!");

      return {
        success: true,
        orderId,
        data: response.data,
      };
    } catch (err: any) {
      console.error("❌ Order creation failed:", {
        error: err?.message,
        status: err?.response?.status,
        responseData: err?.response?.data,
      });

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create order";
      toast.error(errorMessage);

      return {
        success: false,
        error: err,
      };
    } finally {
      setIsLoading(false);
      console.log("🏁 Order creation process complete");
    }
  };

  return {
    createOrder,
    isLoading,
  };
};
