// hooks/useCreateOrder.ts - Version that saves debug info to localStorage
import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import { CartItem } from "@/context/CartContext";

// Save debug info that persists through redirects
const saveDebugInfo = (info: any) => {
  try {
    const existingDebug = JSON.parse(
      localStorage.getItem("orderDebug") || "[]"
    );
    existingDebug.push({
      timestamp: new Date().toISOString(),
      ...info,
    });
    localStorage.setItem("orderDebug", JSON.stringify(existingDebug));
  } catch (error) {
    console.error("Failed to save debug info:", error);
  }
};

export const getDebugInfo = () => {
  try {
    const debug = localStorage.getItem("orderDebug");
    if (debug) {
      console.log("🔍 ORDER DEBUG HISTORY:", JSON.parse(debug));
      return JSON.parse(debug);
    }
  } catch (error) {
    console.error("Failed to get debug info:", error);
  }
  return [];
};

// Clear debug info
export const clearDebugInfo = () => {
  localStorage.removeItem("orderDebug");
};

interface User {
  phoneNumber?: string;
  name?: string;
  email?: string;
  imgUrl?: string;
}

// interface CartItem {
//   id: string;
//   quantity: number;
//   price: number;
//   categoryId: string;
//   itemName: string;
//   image: string;
//   points: number;
//   categoryName: string;
//   measurement_unit: number;
// }

interface Address {
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
  setCurrentStep: (step: number) => void;
  setCreatedOrderId: (id: string) => void;
}

interface UseCreateOrderReturn {
  createOrder: (
    selectedAddress: Address | null,
    cart: CartItem[],
    user: User | null
  ) => Promise<CreateOrderResult>;
  isLoading: boolean;
}

export const useCreateOrder = ({
  clearCart,
  setCurrentStep,
  setCreatedOrderId,
}: UseCreateOrderParams): UseCreateOrderReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createOrder = async (
    selectedAddress: Address | null,
    cart: CartItem[],
    user: User | null
  ): Promise<CreateOrderResult> => {
    saveDebugInfo({
      action: "ORDER_START",
      cartLength: cart?.length || 0,
      cartItems: cart,
      hasAddress: !!selectedAddress,
      hasUser: !!user,
    });

    // Validation
    if (!selectedAddress) {
      saveDebugInfo({ action: "VALIDATION_FAILED", reason: "No address" });
      toast.error("Please select an address");
      return { success: false };
    }

    if (!cart || cart.length === 0) {
      saveDebugInfo({ action: "VALIDATION_FAILED", reason: "Empty cart" });
      toast.error("Your cart is empty");
      return { success: false };
    }

    setIsLoading(true);
    saveDebugInfo({ action: "API_CALL_START" });

    try {
      const response = await api.post<OrderResponse>("orders", {
        address: selectedAddress,
        items: cart,
        phoneNumber: user?.phoneNumber,
        userName: user?.name,
        email: user?.email,
        imageUrl: user?.imgUrl,
      });

      const orderId = response.data.data._id;

      saveDebugInfo({
        action: "ORDER_SUCCESS",
        orderId: orderId,
        responseStatus: response.status,
      });

      // Success side effects
      setCreatedOrderId(orderId);

      // Debug cart clearing
      saveDebugInfo({
        action: "CART_CLEAR_START",
        cartBeforeClear: cart.length,
      });

      try {
        clearCart();
        saveDebugInfo({ action: "CART_CLEAR_SUCCESS" });
      } catch (clearError) {
        saveDebugInfo({
          action: "CART_CLEAR_FAILED",
          error: clearError.message,
        });
      }

      setCurrentStep(3);
      saveDebugInfo({ action: "STEP_SET_TO_3" });

      toast.success("Order created successfully!");

      return {
        success: true,
        orderId,
        data: response.data,
      };
    } catch (err: any) {
      saveDebugInfo({
        action: "ORDER_FAILED",
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
      saveDebugInfo({ action: "ORDER_COMPLETE" });
    }
  };

  return {
    createOrder,
    isLoading,
  };
};
