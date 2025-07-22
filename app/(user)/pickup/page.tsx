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
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import api from "@/lib/axios";
import { ChevronRight, Edit3, Home, MapPin, Plus, Trash2 } from "lucide-react";

export default function PickupConfirmation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState<boolean>(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const [selectedCity, setSelectedCity] = useState<City | "">("");
  const [formData, setFormData] = useState<FormInputs | null>(null);
  const [addresses, setAddresses] = useState<FormInputs[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<FormInputs | null>(
    null
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const { user } = useContext(UserAuthContext) ?? {};
  
  const { cart, clearCart } = useCart();
  console.log(cart);
  

console.log("🔍 user in PickupConfirmation:", user);
  // Only fetch addresses if user exists
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
      toast.error("please select address");
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

  const handleConfirm = () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

  if (!cart || cart.length === 0) {
    toast.error("Your cart is empty");
    return;
  }
    setLoadingBtn(true);
    api
      .post("orders", {
        address: selectedAddress,
        items: cart,
        phoneNumber: user?.phoneNumber,
        userName: user?.name,
        email:user?.email,
        imageUrl:user?.imgUrl

      })
      .then((res) => {
        setCreatedOrderId(res.data.data._id);
        clearCart(); // ✅ clear cart after successful order
        setCurrentStep(3);
      })
      .catch((err) => {
        toast.error(err?.message ?? "Failed to create order");
      })
      .finally(() => {
        setLoadingBtn(false);
      });
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

  // Show message if user is not logged in instead of app UI
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
          label="Review"
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
          label="Finish"
          direction={direction}
          isCurrent={currentStep === 3}
          active={currentStep >= 3}
          stepNumber={3}
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
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Choose Your Address
        </h2>
        <p className="text-gray-600">Select or add a delivery address</p>
      </div>

      {/* Address Grid */}
      <div className="grid gap-6">
        {addresses.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses yet</h3>
            <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-xl ${
                selectedAddress?._id === addr._id
                  ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-100"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
              onClick={() => handleSelectAddress(addr)}
            >
              {/* Selection Indicator */}
              {selectedAddress?._id === addr._id && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl transition-colors duration-300 ${
                        selectedAddress?._id === addr._id 
                          ? "bg-green-100 text-green-600" 
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}>
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {addr.city} • {addr.area}
                        </h3>
                        {addr.landmark && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {addr.landmark}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        <span className="flex items-center gap-2">
                          <span className="font-medium">Street:</span>
                          {addr.street}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">Building:</span>
                          {addr.building}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">Floor:</span>
                          {addr.floor}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">Apt:</span>
                          {addr.apartment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Radio Button */}
                  <div className="ml-4">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?._id === addr._id}
                      onChange={() => handleSelectAddress(addr)}
                      className="w-5 h-5 text-green-600 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(addr);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(addr._id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
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
                  }}          className="w-full cursor-pointer sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 group"
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
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 shadow-green-200"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Indicator */}
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
        <Review
          cartItems={cart}
          formData={formData}
          onBack={() => setCurrentStep(1)}
          onConfirm={handleConfirm}
          loading={loadingBtn}
        />
      )}

      {currentStep === 3 && (
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
            Pickup Request Confirmed!
          </h2>
          <p className="text-green-900 text-lg">
            Thank you for your request. We will contact you soon to schedule
            your pickup.
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
