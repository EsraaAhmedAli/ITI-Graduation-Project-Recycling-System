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
import Loader from "@/components/common/loader";
import { CartItem, useCart } from "@/context/CartContext";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Building2,
  ChevronRight,
  CreditCard,
  Edit3,
  Home,
  MapPin,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useRouter } from "next/navigation";
import { deliveryFees } from "@/constants/deliveryFees";

type PaymentMethod = 'cash' | 'credit_card' | 'wallet';

export default function PickupConfirmation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState<boolean>(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<City | "">("");
  const [formData, setFormData] = useState<FormInputs | null>(null);
  const [addresses, setAddresses] = useState<FormInputs[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<FormInputs | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const { user } = useContext(UserAuthContext) ?? {};
  
  const getTotalCartPrice = (cart: CartItem[]) => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const { cart, clearCart } = useCart();
  const totalPrice = getTotalCartPrice(cart);

  const { createOrder } = useCreateOrder({
    clearCart,
    setCurrentStep,
    setCreatedOrderId,
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
    }
  }, [reset, user]);

  const handleNextStep = () => {
    if (!selectedAddress) {
      toast.error("Please select address");
    } else {
      goToStep(2);
    }
  };

  const goToStep = (step: number) => {
    if (step > currentStep) {
      setDirection("forward");
    } else if (step < currentStep) {
      setDirection("backward");
    }
    setCurrentStep(step);
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
            totalPrice: finalTotal,
            paymentMethod: selectedPaymentMethod,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
            },
          })
        );

        if (selectedPaymentMethod === 'credit_card') {
          router.push(`/payment?total=${finalTotal}`);
        } else {
          const result = await createOrder(selectedAddress, cart, user, selectedPaymentMethod);
          if (result.success) {
            console.log("Order created successfully:", result.orderId);
            goToStep(4);
          }
        }
      } else {
        const result = await createOrder(selectedAddress, cart, user, selectedPaymentMethod);
        if (result.success) {
          console.log("Order created successfully:", result.orderId);
          goToStep(4);
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
      setCurrentStep(1);
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
      setCurrentStep(1);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update address");
    }
  };

  if (loading) {
    return <Loader title="your info" />;
  }

  if (notLoggedIn) {
    return (
      <div className="text-center p-10">
        <p className="mb-4 text-lg font-semibold text-red-600">
          You must be logged in to access this page.
        </p>
        <Link
          href="/auth"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:w-3xl w-full mx-auto md:p-8 p-5 bg-white rounded-2xl shadow-lg border border-green-100">
      <div className="flex my-3 flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
        <Step
          label="Address"
          direction={direction}
          isCurrent={currentStep === 1}
          active={currentStep >= 1}
          stepNumber={1}
        />
        <div
          className={`hidden md:flex flex-grow h-0.5 mx-2 ${
            currentStep >= 2 ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <div
          className={`flex md:hidden w-0.5 h-6 ${
            currentStep >= 2 ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <Step
          label="Payment"
          direction={direction}
          isCurrent={currentStep === 2}
          active={currentStep >= 2}
          stepNumber={2}
        />
        <div
          className={`hidden md:flex flex-grow h-0.5 mx-2 ${
            currentStep >= 3 ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <div
          className={`flex md:hidden w-0.5 h-6 ${
            currentStep >= 3 ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <Step
          label="Review"
          direction={direction}
          isCurrent={currentStep === 3}
          active={currentStep >= 3}
          stepNumber={3}
        />
        <div
          className={`hidden md:flex flex-grow h-0.5 mx-2 ${
            currentStep >= 4 ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <div
          className={`flex md:hidden w-0.5 h-6 ${
            currentStep >= 4 ? "bg-green-700" : "bg-gray-300"
          }`}
        />
        <Step
          label="Finish"
          direction={direction}
          isCurrent={currentStep === 4}
          active={currentStep >= 4}
          stepNumber={4}
        />
      </div>

      {currentStep === 1 && (
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
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                          selectedAddress?._id === addr._id
                            ? "bg-gradient-to-r from-emerald-400 to-green-500"
                            : "bg-transparent"
                        }`}
                      />

                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`relative p-3 rounded-xl transition-all duration-300 ${
                                selectedAddress?._id === addr._id
                                  ? "bg-emerald-100 text-emerald-600 scale-110"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                              }`}
                            >
                              <Home className="w-5 h-5" />
                              {selectedAddress?._id === addr._id && (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                                  <svg
                                    className="w-3 h-3 text-white"
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
                              )}
                            </div>

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

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                              title="Edit Address"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr._id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                              title="Delete Address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedAddress?._id === addr._id
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-gray-300 group-hover:border-blue-400"
                              }`}
                            >
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
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 group hover:shadow-md"
                >
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
                  }`}
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="w-8 h-1 bg-green-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedPaymentMethod === 'credit_card'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedPaymentMethod('credit_card')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Credit/Debit Card</h3>
                  <p className="text-gray-600 text-sm">Pay securely with your card</p>
                </div>
                {selectedPaymentMethod === 'credit_card' && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedPaymentMethod === 'cash'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedPaymentMethod('cash')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Cash on Delivery</h3>
                  <p className="text-gray-600 text-sm">Pay when you receive your order</p>
                </div>
                {selectedPaymentMethod === 'cash' && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {user?.walletBalance && (
              <div
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPaymentMethod === 'wallet'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedPaymentMethod('wallet')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Wallet Balance</h3>
                    <p className="text-gray-600 text-sm">
                      Use your wallet balance (${user.walletBalance.toFixed(2)} available)
                    </p>
                  </div>
                  {selectedPaymentMethod === 'wallet' && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-8 border-t border-gray-200">
            <Button
              onClick={() => goToStep(1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (!selectedPaymentMethod) {
                  toast.error("Please select a payment method");
                } else {
                  goToStep(3);
                }
              }}
              disabled={!selectedPaymentMethod}
              className={`px-6 py-3 ${
                selectedPaymentMethod
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <Review
          cartItems={cart}
          formData={formData}
          paymentMethod={selectedPaymentMethod}
          onBack={() => goToStep(2)}
          onConfirm={handleConfirm}
          loading={loadingBtn}
          userRole={user?.role}
        />
      )}

      {currentStep === 4 && (
        <div className="text-center max-w-lg mx-auto space-y-6 bg-green-50 p-8 rounded-xl shadow border border-green-100">
          <div className="flex justify-center">
            <svg
              className="w-16 h-16 text-green-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-700">
            {selectedPaymentMethod === 'credit_card' 
              ? "Payment Successful!" 
              : "Order Confirmed!"}
          </h2>
          <p className="text-green-900 text-lg">
            {selectedPaymentMethod === 'credit_card'
              ? "Thank you for your payment. Your order is being processed."
              : "Thank you for your order. We will contact you soon."}
          </p>
          {createdOrderId && (
            <div className="bg-white border border-green-300 rounded-lg p-4 shadow-sm ">
              <p className="text-sm text-green-800 mb-2 font-medium">
                Your Tracking Number:
              </p>
              <div className="block   text-center">
                <span className="font-mono text-green-900 text-lg break-all">
                  {createdOrderId}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdOrderId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`text-sm border px-2 py-1 rounded
          ${
            copied
              ? "bg-green-600 text-white border-green-600"
              : "text-green-600 border-green-300 hover:text-green-800 hover:border-green-800"
          }`}
                  title="Copy to clipboard"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
          <Link
            href={"/profile"}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            See your orders
          </Link>
        </div>
      )}
    </div>
  );
}