"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/converToSubCurrency";
import api from "@/lib/axios";
import { useUserAuth } from "@/context/AuthFormContext";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";
import Button from "../common/Button";

// Define the checkout data interface
interface CheckoutData {
  cart: any[];
  selectedAddress: {
    _id: string;
    city: string;
    area: string;
    street: string;
    building: string;
    floor: number;
    apartment: string;
    landmark?: string;
    notes?: string;
  };
  totalPrice: number;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
}

interface CheckoutPageProps {
  amount: number;
  checkoutData?: CheckoutData;
}

const CheckoutPage = ({ amount, checkoutData }: CheckoutPageProps) => {
  
  const { clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const { user } = useUserAuth();
  const [paymentMethod] = useState<"card" | "cash">("card");

  // Get checkout data from sessionStorage if not passed as prop
  const [localCheckoutData, setLocalCheckoutData] =
    useState<CheckoutData | null>(checkoutData || null);

  useEffect(() => {
    if (!checkoutData) {
      // Try to get checkout data from sessionStorage
      try {
        const storedData = sessionStorage.getItem("checkoutData");
        if (storedData) {
          const parsedData: CheckoutData = JSON.parse(storedData);
          setLocalCheckoutData(parsedData);
        }
      } catch (error) {
        console.error("Error parsing checkout data:", error);
      }
    }
  }, [checkoutData]);

  const role = localCheckoutData?.user?.role || "buyer";

  const { createOrder, isLoading: isCreatingOrder } = useCreateOrder({
    clearCart: () => {
      sessionStorage.removeItem("checkoutData");

      try {
        clearCart();
        console.log("✅ Cart cleared from state");
      } catch (error) {
        console.error("❌ Failed to clear cart from state:", error);
      }

      // If your cart is stored in localStorage, also clear it
      try {
        localStorage.removeItem("cart");
        localStorage.removeItem("cartItems");
        console.log("✅ Cart cleared from localStorage");
      } catch (error) {
        console.error("❌ Failed to clear cart from localStorage:", error);
      }
    },
    setCurrentStep: (step: number) => {
      if (step === 3) {
        router.push("/payment/success");
      }
    },
    setCreatedOrderId: (id: string) => {
      sessionStorage.setItem("orderId", id);
    },
  });

  useEffect(() => {
    async function preparePayment() {
      if (!user?._id) return;

      try {
        // Step 1: Ensure Stripe customer exists
        await api.post(`/users/${user._id}/stripe-customer`);

        // Step 2: Create payment intent
        const { data } = await api.post(
          `/users/${user._id}/create-payment-intent`,
          {
            amount: convertToSubcurrency(amount),
          }
        );

        // Step 3: Set client secret for Stripe payment
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Payment preparation error:", error);
        setErrorMessage("Failed to prepare payment. Please try again.");
      }
    }

    async function getUserPayment() {
      try {
        const res = await api.get(`/users/${user?._id}/payments`);
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    }

    preparePayment();
    getUserPayment();
  }, [amount, user?._id]);

  const handlePaymentSuccess = async () => {
    if (!localCheckoutData) {
      toast.error("Checkout data not found");
      return;
    }

    setPaymentSuccessful(true);

    try {
      const transformedCart = localCheckoutData.cart.map((item) => ({
        ...item,
        id: item.id || item.categoryId || item.itemId,
        categoryId: item.categoryId,
        itemName: item.itemName,
        price: item.price,
        quantity: item.quantity,
        points: item.points,
        image: item.image,
        categoryName: item.categoryName,
        measurement_unit: item.measurement_unit,
      }));

      console.log("Transformed cart for order creation:", transformedCart);

      const result = await createOrder(
        localCheckoutData.selectedAddress,
        transformedCart,
        {
          phoneNumber: localCheckoutData.user.phoneNumber,
          name: localCheckoutData.user.name,
          email: localCheckoutData.user.email,
          imgUrl: user?.imgUrl || "",
        },
        checkoutData.deliveryFee,
        "credit-card" // Payment method
      );

      if (result.success) {
        toast.success("Payment successful! Order created.");

        sessionStorage.removeItem("checkoutData");

        router.push(
          `/payment/success?payment=completed&amount=${amount}&base=${localCheckoutData.totalPrice}`
        );
      } else {
        toast.error(
          "Payment successful but failed to create order. Please contact support."
        );
        router.push("/payment/success?payment=completed");
      }
    } catch (error) {
      console.error("Error creating order after payment:", error);
      toast.error(
        "Payment successful but failed to create order. Please contact support."
      );
      router.push("/payment/success?payment=completed");
    }
  };

  const handleCashPayment = async () => {
    if (!localCheckoutData) {
      toast.error("Checkout data not found");
      return;
    }

    setLoading(true);

    try {
      const transformedCart = localCheckoutData.cart.map((item) => ({
        ...item,
        id: item.id || item.categoryId || item.itemId,
        categoryId: item.categoryId,
        itemName: item.itemName,
        price: item.price,
        quantity: item.quantity,
        points: item.points,
        image: item.image,
        categoryName: item.categoryName,
        measurement_unit: item.measurement_unit,
      }));

      const result = await createOrder(
        localCheckoutData.selectedAddress,
        transformedCart,
        {
          phoneNumber: localCheckoutData.user.phoneNumber,
          name: localCheckoutData.user.name,
          email: localCheckoutData.user.email,
          imgUrl: user?.imgUrl || "",
        },
        "cash" // Payment method
      );

      if (result.success) {
        toast.success("Order created successfully with Cash on Delivery!");
        sessionStorage.removeItem("checkoutData");
        router.push(
          `/payment/success?payment=cash&amount=${amount}&base=${localCheckoutData.totalPrice}`
        );
      } else {
        toast.error("Failed to create order. Please contact support.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!stripe || !elements) {
      setErrorMessage("Payment system not ready. Please try again.");
      setLoading(false);
      return;
    }

    if (!localCheckoutData) {
      setErrorMessage(
        "Order information missing. Please restart the checkout process."
      );
      setLoading(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setErrorMessage(submitError.message);
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        await handlePaymentSuccess();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setErrorMessage(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8">
        <div className="relative">
          <div className="h-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                <path d="M17 14.5L18.04 18.72L22 19.5L18.04 20.28L17 24.5L15.96 20.28L12 19.5L15.96 18.72L17 14.5Z" />
                <path d="M7 14.5L8.04 18.72L12 19.5L8.04 20.28L7 24.5L5.96 20.28L2 19.5L5.96 18.72L7 14.5Z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Preparing Your Green Checkout
          </h3>
          <p className="text-green-600 text-sm">
            Setting up secure payment for your recycling service...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden min-h-[600px]">
      {/* Left Side - Static Illustration */}
      <div className="w-1/2 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-100 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-teal-200 rounded-full opacity-20"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-emerald-200 rounded-full opacity-25"></div>

        <div className="max-w-md relative z-10">
          <div className="relative mb-8">
            <div className="bg-slate-800 rounded-[2.5rem] p-3 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-[2rem] p-6 h-[400px] relative overflow-hidden">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
                </div>

                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-gray-600 font-medium">
                    Payment Data
                  </span>
                </div>

                <div className="mb-6">
                  <div className="text-gray-600 text-sm mb-1">Total price</div>
                  <div className="text-3xl font-bold text-teal-600">
                    EGP {typeof localCheckoutData?.totalPrice === "number"
                      ? localCheckoutData.totalPrice.toFixed(2)
                      : "0.00"}
                  </div>
                  {role !== "buyer" && typeof localCheckoutData?.totalPrice === "number" && (
                    <div className="text-xs text-gray-500 mt-1">
                      (Base price: EGP {localCheckoutData.totalPrice.toFixed(2)})
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-gray-600 text-sm mb-3">
                    {paymentMethod === "card" ? "Payment method" : "Payment on Delivery"}
                  </div>
                  <div className="bg-slate-700 rounded-xl p-4 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 w-8 h-8 border-2 border-white rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="relative z-10">
                      {paymentMethod === "card" ? (
                        <>
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-8 h-6 bg-teal-400 rounded"></div>
                            <div className="w-10 h-6 bg-white bg-opacity-20 rounded"></div>
                          </div>
                          <div className="text-lg tracking-wider">
                            1234 5678 9012 3456
                          </div>
                          <div className="absolute bottom-4 right-4 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center animate-bounce">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19 13H5v-2h14v2z" />
                                <path d="M21 17H3v-2h18v2z" />
                                <path d="M21 21H3v-2h18v2z" />
                                <path d="M11 7H5V5h6v2zm7 0h-6V5h6v2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Cash on Delivery</div>
                              <div className="text-sm opacity-80">Pay when you receive your order</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-sm">
                      Save card number
                    </span>
                    <div className="w-12 h-6 bg-teal-500 rounded-full relative cursor-pointer hover:bg-teal-600 transition-colors">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                    </div>
                  </div>
                )}

                <button className="w-full bg-teal-500 text-white py-3 rounded-xl font-medium hover:bg-teal-600 transition-colors shadow-lg">
                  {paymentMethod === "card" ? "Proceed to confirm" : "Place Order"}
                </button>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-8 w-24 h-24 bg-blue-600 rounded-t-full"></div>
            <div className="absolute -bottom-16 -right-4 w-8 h-12 bg-blue-400 rounded-full"></div>
            <div className="absolute -top-8 -right-6 w-12 h-8 bg-pink-300 rounded-full"></div>
          </div>

          <div className="absolute top-20 left-0 w-16 h-16 bg-teal-300 rounded-lg transform rotate-12 opacity-60"></div>
          <div className="absolute bottom-40 right-0 w-12 h-12 bg-green-400 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Right Side - Payment Form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="text-lg lg:text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                <h1>Karakeeb</h1>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800 mb-2">Payment</h1>
            </div> */}

            {/* Payment Method Selector */}
            {/* <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  paymentMethod === "card"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                Credit/Debit Card
              </button>
              {role === "buyer" && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    paymentMethod === "cash"
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  Cash on Delivery
                </button>
              )}
            </div> */}

            {paymentMethod === "card" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      defaultValue={localCheckoutData?.user.name || ""}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country or region
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                      <option>Egypt</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address line 1
                    </label>
                    <input
                      type="text"
                      defaultValue={
                        localCheckoutData
                          ? `${localCheckoutData.selectedAddress.street}, ${localCheckoutData.selectedAddress.building}`
                          : ""
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your address"
                    />
                  </div>

<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
  <PaymentElement
    options={{
      layout: "tabs",
      wallets: {
        applePay: "auto",
        googlePay: "auto",
      },
      defaultValues: {
        billingDetails: {
          email: localCheckoutData?.user.email || user?.email || "",
          name: localCheckoutData?.user.name || user?.name || "",
          // You can also prefill address if available
          address: {
            line1: localCheckoutData ? `${localCheckoutData.selectedAddress.street}, ${localCheckoutData.selectedAddress.building}` : "",
            city: localCheckoutData?.selectedAddress.city || "",
            // Add more address fields as needed
          }
        }
      }
    }}
  />
</div>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      <span className="text-red-700 text-sm font-medium">
                        {errorMessage}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  
                  disabled={
                    !stripe ||
                    loading ||
                    isCreatingOrder ||
                    paymentSuccessful ||
                    !localCheckoutData
                  }
                  
                  className="w-full disabled:opacity-50 bg-green-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : isCreatingOrder ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Order...</span>
                    </div>
                  ) : paymentSuccessful ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      <span>Payment Successful!</span>
                    </div>
                  ) : !localCheckoutData ? (
                    <span>Missing Order Information</span>
                  ) : (
                    <span>Next</span>
                  )}
                </Button>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
                    </svg>
                    <span>
                      Your payment is secured with 256-bit SSL encryption
                    </span>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <svg
                        className="w-6 h-6 text-teal-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 13H5v-2h14v2z" />
                        <path d="M21 17H3v-2h18v2z" />
                        <path d="M21 21H3v-2h18v2z" />
                        <path d="M11 7H5V5h6v2zm7 0h-6V5h6v2z" />
                      </svg>
                    </div>
                    {/* <div>
                      <h3 className="font-medium text-gray-800">
                        Cash on Delivery
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay with cash when your order is delivered.
                      </p>
                    </div> */}
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Order Total:</span>
                      <span className="font-semibold text-gray-800">
                        EGP{" "}
                        {typeof localCheckoutData?.totalPrice === "number"
                          ? localCheckoutData.totalPrice.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    {role !== "buyer" &&
                      typeof localCheckoutData?.totalPrice === "number" && (
                        <div className="text-xs text-gray-500 text-right">
                          (Base price: EGP{" "}
                          {localCheckoutData.totalPrice.toFixed(2)})
                        </div>
                      )}
                  </div>
                </div>

                <Button
                  onClick={handleCashPayment}
                  disabled={
                    loading ||
                    isCreatingOrder ||
                    paymentSuccessful ||
                    !localCheckoutData
                  }
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Order...</span>
                    </div>
                  ) : paymentSuccessful ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      <span>Order Placed!</span>
                    </div>
                  ) : !localCheckoutData ? (
                    <span>Missing Order Information</span>
                  ) : (
                    <span>Place Order</span>
                  )}
                </Button>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
                    </svg>
                    <span>Your order is secured with our privacy policy</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

