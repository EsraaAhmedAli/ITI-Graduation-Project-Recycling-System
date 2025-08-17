"use client";

import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { City, FormInputs } from "@/components/Types/address.type";
import Review from "./ReviewForm";
import Step from "./Step";
import Button from "@/components/common/Button";
import AddressStep from "./AddressStep";
import { toast } from "react-toastify";
import { UserAuthContext } from "@/context/AuthFormContext";
import Loader from "@/components/common/Loader";
import { CartItem, useCart } from "@/context/CartContext";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Building2,
  ChevronRight,
  Edit3,
  Home,
  MapPin,
  Plus,
  Trash2,
  CreditCard,
  Wallet,
  Banknote,
  Check,
} from "lucide-react";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { deliveryFees } from "@/constants/deliveryFees";

enum Steps {
  ADDRESS = 1,
  PAYMENT,
  REVIEW,
}

type PaymentMethod = "cash" | "credit_card" | "wallet";

export default function PickupConfirmation() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ADDRESS);
  const [loading, setLoading] = useState<boolean>(true);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<City | "">("");
  const [formData, setFormData] = useState<FormInputs | null>(null);
  const [addresses, setAddresses] = useState<FormInputs[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<FormInputs | null>(
    null
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [notLoggedIn] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState<boolean>(false);

  const { user } = useContext(UserAuthContext) ?? {};

  const getTotalCartPrice = (cart: CartItem[]) => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const { cart, clearCart } = useCart();
  const totalPrice = getTotalCartPrice(cart);
  const deliveryFee = selectedAddress?.city
    ? deliveryFees[selectedAddress.city] || 0
    : 0;
  const totalAmount = totalPrice + deliveryFee;

  const { createOrder } = useCreateOrder({
    clearCart,
    onOrderSuccess: (orderId: string) => {
      console.log("Order created with ID:", orderId);
    }
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/addresses");
      const fetchedAddresses = res.data;
      setAddresses(fetchedAddresses);

      if (fetchedAddresses.length > 0) {
        setSelectedAddress(fetchedAddresses[0]);
        setFormData(fetchedAddresses[0]);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<FormInputs>({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
      setIsEditing(false);
      // Set default payment method for customers (since they skip payment step)
      if (user.role === "customer") {
        setSelectedPaymentMethod("cash");
      }
    }
  }, [reset, user]);

  const handleNextStep = () => {
    if (!selectedAddress) {
      toast.error("please select address");
    } else {
      // Only buyers go to payment step, customers skip directly to review
      if (user?.role === "buyer") {
        goToStep(Steps.PAYMENT);
      } else {
        goToStep(Steps.REVIEW);
      }
    }
  };

  const goToStep = (step: Steps) => {
    if (step > currentStep) {
      setDirection("forward");
    } else if (step < currentStep) {
      setDirection("backward");
    }
    setCurrentStep(step);
  };

  const handlePaymentNext = () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
    } else {
      goToStep(Steps.REVIEW);
    }
  };

  const handleConfirm = async () => {
    setLoadingBtn(true);
    try {
      if (user?.role === "buyer") {
        const deliveryFee = selectedAddress?.city
          ? deliveryFees[selectedAddress.city] || 0
          : 0;

        const finalTotal = totalPrice + deliveryFee;

        sessionStorage.setItem(
          "checkoutData",
          JSON.stringify({
            cart,
            selectedAddress,
            deliveryFee,
            totalPrice: totalAmount,
            paymentMethod: selectedPaymentMethod,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
            },
          })
        );

        if (selectedPaymentMethod === "credit_card") {
          router.push(`/payment?total=${finalTotal}&deliveryFee=${deliveryFee}`);
          return;
        } else {
          const result = await createOrder(
            selectedAddress,
            cart,
            user,
            deliveryFee,
            selectedPaymentMethod,
          );
          if (result.success) {
            console.log("Order created successfully:", result.orderId);
            toast.success("Order placed successfully!");
            router.push("/profile");
            return;
          }
        }
      } else {
        // Handle customer orders
        const result = await createOrder(
          selectedAddress,
          cart,
          user,
        );
        if (result.success) {
          console.log("Order created successfully:", result.orderId);
          toast.success("Order placed successfully!");
          router.push("/profile");
          return;
        }
      }
    } catch (error) {
      console.error("Error during order confirmation:", error);
      toast.error("Failed to confirm order. Please try again.");
    } finally {
      setLoadingBtn(false);
    }
  };

  const handleSaveAddress = async (data: FormInputs) => {
    try {
      const res = await api.post("/addresses", data);
      setAddresses((prev) => [...prev, res.data]);
      setIsEditing(false);
      setSelectedAddress(res.data);
      setCurrentStep(Steps.ADDRESS);
      reset();
      toast.success("Address saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      if (selectedAddress?._id === id) setSelectedAddress(null);
      toast.success("Address deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address");
    }
  };

  const handleSelectAddress = (address: FormInputs) => {
    setSelectedAddress(address);
    setFormData(address);
  };

  const handleEditAddress = (address: FormInputs) => {
    setIsEditing(true);
    setEditingAddressId(address._id);
    reset(address);
    setSelectedCity(address.city as City);
  };

  const handleUpdateAddress = async (data: FormInputs) => {
    try {
      const res = await api.put(`/addresses/${editingAddressId}`, data);
      setAddresses((prev) =>
        prev.map((addr) => (addr._id === editingAddressId ? res.data : addr))
      );
      setIsEditing(false);
      setEditingAddressId(null);
      setSelectedAddress(res.data);
      toast.success("Address updated!");
      setCurrentStep(Steps.ADDRESS);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update address");
    }
  };

  // Payment method options
  const paymentMethods = [
    {
      id: "cash" as PaymentMethod,
      name: "Cash on Delivery",
      description: "Pay when your order arrives",
      icon: Banknote,
    },
    {
      id: "credit_card" as PaymentMethod,
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: CreditCard,
    },
  ];

  if (loading) {
    return <Loader title="your info" />;
  }

  // Show message if user is not logged in instead of app UI
  if (notLoggedIn) {
    return (
      <div className="text-center p-10">
        <p className="mb-4 text-lg font-semibold text-red-600">
          You must be logged in to access this page.
        </p>
        <Link
          href="/auth"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:w-3xl w-full mx-auto md:p-8 p-5 bg-white rounded-2xl shadow-lg border border-green-100">
      <div className="flex my-3 flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
        <Step
          label={t("pickup.steps.address")}
          direction={direction}
          isCurrent={currentStep === Steps.ADDRESS}
          active={currentStep >= Steps.ADDRESS}
        />

        {/* Only show payment step and connectors for buyers */}
        {user?.role === "buyer" && (
          <>
            <div
              className={`hidden md:flex flex-grow h-0.5 mx-2 ${
                currentStep >= Steps.PAYMENT ? "bg-green-700" : "bg-gray-300"
              }`}
            />
            <div
              className={`flex md:hidden w-0.5 h-6 ${
                currentStep >= Steps.PAYMENT ? "bg-green-700" : "bg-gray-300"
              }`}
            />
            <Step
              label="Payment"
              direction={direction}
              isCurrent={currentStep === Steps.PAYMENT}
              active={currentStep >= Steps.PAYMENT}
            />
          </>
        )}

        <div
          className={`hidden md:flex flex-grow h-0.5 mx-2 ${
            currentStep >= Steps.REVIEW ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <div
          className={`flex md:hidden w-0.5 h-6 ${
            currentStep >= Steps.REVIEW ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <Step
          label={t("pickup.steps.review")}
          direction={direction}
          isCurrent={currentStep === Steps.REVIEW}
          active={currentStep >= Steps.REVIEW}
        />
      </div>

      {currentStep === Steps.ADDRESS && (
        <>
          {isEditing ? (
            <AddressStep
              register={register}
              errors={errors}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              setValue={setValue}
              isValid={isValid}
              onSubmit={handleSubmit(
                editingAddressId ? handleUpdateAddress : handleSaveAddress
              )}
              onCancel={() => {
                setIsEditing(false);
                setEditingAddressId(null);
              }}
            />
          ) : (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Choose Your Address
                </h2>
                <p className="text-gray-600">
                  Select or add a delivery address
                </p>
              </div>

              {/* Address Grid */}
              <div className="grid gap-6">
                {addresses.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No addresses yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add your first delivery address to get started
                    </p>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
                        selectedAddress?._id === addr._id
                          ? "border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 shadow-emerald-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-blue-100"
                      }`}
                      onClick={() => handleSelectAddress(addr)}>
                      {/* Selection Indicator */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                          selectedAddress?._id === addr._id
                            ? "bg-gradient-to-r from-emerald-400 to-green-500"
                            : "bg-transparent"
                        }`}
                      />

                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          {/* Main Content */}
                          <div className="flex items-center gap-4 flex-1">
                            {/* Icon */}
                            <div
                              className={`relative p-3 rounded-xl transition-all duration-300 ${
                                selectedAddress?._id === addr._id
                                  ? "bg-emerald-100 text-emerald-600 scale-110"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                              }`}>
                              <Home className="w-5 h-5" />
                              {selectedAddress?._id === addr._id && (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Address Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-800 truncate">
                                  {addr.city} • {addr.area}
                                </h3>
                                {selectedAddress?._id === addr._id && (
                                  <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                                    Selected
                                  </span>
                                )}
                              </div>

                              {addr.landmark && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {addr.landmark}
                                  </span>
                                </p>
                              )}

                              {/* Compact Address Details */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                <span>{addr.street}</span>
                                <span>•</span>
                                <span>{addr.building}</span>
                                <span>•</span>
                                <span>{addr.floor}</span>
                                <span>•</span>
                                <span>{addr.apartment}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                              title="Edit Address">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr._id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                              title="Delete Address">
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Radio Button */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedAddress?._id === addr._id
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-gray-300 group-hover:border-blue-400"
                              }`}>
                              {selectedAddress?._id === addr._id && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Enhanced Bottom Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditingAddressId(null);
                    reset({
                      city: "",
                      area: "",
                      street: "",
                      landmark: "",
                      building: "",
                      floor: null,
                      apartment: "",
                      notes: "",
                    });
                    setSelectedCity("");
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 group hover:shadow-md">
                  <div className="p-1 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  Add New Address
                </button>

                <Button
                  onClick={handleNextStep}
                  disabled={!selectedAddress}
                  className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform ${
                    selectedAddress
                      ? " text-white  "
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Updated Progress Indicator - Only 3 steps */}
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="w-8 h-1 bg-green-500 rounded-full"></div>
                  <div className={`w-2 h-2 rounded-full ${user?.role === "buyer" ? "bg-gray-300" : "bg-green-500"}`}></div>
                  {user?.role === "buyer" && (
                    <>
                      <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                    </>
                  )}
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === Steps.PAYMENT && (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Payment Method
            </h2>
            <p className="text-gray-600">
              Choose your preferred payment method
            </p>
          </div>

          {/* Payment Methods */}
          <div className="grid gap-4 md:grid-cols-2">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              const isSelected = selectedPaymentMethod === method.id;

              return (
                <div
                  key={method.id}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        method.id === "cash"
                          ? "bg-green-100 text-green-600"
                          : method.id === "credit_card"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{method.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {method.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {user?.walletBalance && user.walletBalance > 0 && (
              <div
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPaymentMethod === "wallet"
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedPaymentMethod("wallet")}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Wallet Balance</h3>
                    <p className="text-gray-600 text-sm">
                      Use your wallet balance (${user.walletBalance.toFixed(2)}{" "}
                      available)
                    </p>
                  </div>
                  {selectedPaymentMethod === "wallet" && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-600">EGP{totalPrice.toFixed(2)}</span>
            </div>
            {selectedAddress?.city && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium text-gray-600">
                  EGP{(deliveryFees[selectedAddress.city] || 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-semibold text-lg text-gray-600">
              <span>Total</span>
              <span className="text-gray-600">
                EGP
                {(
                  totalPrice +
                  (selectedAddress?.city
                    ? deliveryFees[selectedAddress.city] || 0
                    : 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <Button
              onClick={() => goToStep(Steps.ADDRESS)}
              className="px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300">
              Back
            </Button>
            <Button
              onClick={handlePaymentNext}
              disabled={!selectedPaymentMethod}
              className={`px-6 py-3 flex items-center gap-2 ${
                selectedPaymentMethod
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}>
              Continue
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === Steps.REVIEW && (
        <Review
          cartItems={cart}
          formData={formData}
          paymentMethod={selectedPaymentMethod}
          onBack={() => {
            if (user?.role === "customer") {
              setCurrentStep(Steps.ADDRESS);
            } else {
              setCurrentStep(Steps.PAYMENT);
            }
          }}
          onConfirm={handleConfirm}
          loading={loadingBtn}
          userRole={user?.role}
        />
      )}
    </div>
  );
}