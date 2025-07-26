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

const CheckoutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUserAuth();

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
      }
    }
    async function getUserPayment() {
      await api
        .get(`/users/${user?._id}/payments`)
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }

    preparePayment();
    getUserPayment()
  }, [amount, user?._id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `http://www.localhost:3000/payment-success?amount=${amount}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  };

  if (!clientSecret) {
    return (
      <div className=" flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8">
        <div className="relative">
          {/* Recycling icon animation */}
          <div className=" h-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24">
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
    <div className="w-1/2 mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2v6.09c3.45.49 6 3.44 6 6.91 0 .79-.13 1.56-.37 2.27l1.85 1.07c.52-1.01.82-2.16.82-3.34 0-4.97-4.03-9-9-9-1.18 0-2.33.3-3.34.82l1.07 1.85c.71-.24 1.48-.37 2.27-.37V2h.7z" />
              <path d="M12 22c-3.47 0-6.42-2.55-6.91-6H2.09c.59 5.47 5.27 9.82 10.91 9.82V22h-.1z" />
              <path d="M7.64 4.64l1.41 1.41C10.74 4.41 12.33 4 14 4V2c-2.39 0-4.68.67-6.64 1.93l.28.71z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">EcoPayment</h2>
            <p className="text-green-100 text-sm">Secure & Sustainable</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-green-100">Total Amount:</span>
            <span className="text-2xl font-bold">${amount}</span>
          </div>
          <div className="text-xs text-green-100 mt-1">
            🌱 This payment supports sustainable recycling initiatives
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-b-2xl shadow-lg border-x border-b border-green-100">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Payment Details
            </h3>
            <p className="text-sm text-gray-600">
              Complete your secure payment to schedule your recycling pickup
            </p>
          </div>

          {/* Payment Element Container */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <PaymentElement
              options={{
                layout: "tabs",
                wallets: {
                  applePay: "auto",
                  googlePay: "auto",
                },
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="current Color"
                  viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-red-700 text-sm font-medium">
                  {errorMessage}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={!stripe || loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span>Complete Payment ${amount}</span>
              </div>
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
            </svg>
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-green-50 px-6 py-4 rounded-b-2xl border-t border-green-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-green-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
              </svg>
              <span>Eco-friendly processing</span>
            </div>
            <div className="text-green-600 text-xs">
              Questions? Contact support
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
