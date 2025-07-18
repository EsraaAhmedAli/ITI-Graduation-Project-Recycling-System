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
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

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

  // NEW: track if user is logged in or not for UI
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const { user } = useContext(UserAuthContext) ?? {};
  const { cart, clearCart } = useCart();

  // Redirect immediately if no user
  useEffect(() => {
    if (!user) {
      setNotLoggedIn(true);
      setLoading(false); // stop loading spinner if any
      // Optional: you can also redirect automatically here
      // router.push("/auth");
    } else {
      setNotLoggedIn(false);
    }
  }, [user]);

  // Only fetch addresses if user exists
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/addresses");
      const fetchedAddresses = res.data;
      setAddresses(fetchedAddresses);

      // Set first address as selected by default (if any)
      if (fetchedAddresses.length > 0) {
        setSelectedAddress(fetchedAddresses[0]);
        setFormData(fetchedAddresses[0]);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
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

    setLoadingBtn(true);
    api
      .post("orders", {
        address: selectedAddress,
        items: cart,
        phoneNumber: user?.phoneNumber,
        userName: user?.name,
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
            <div className="grid gap-4">
              {addresses.length === 0 && (
                <p className="text-gray-600">No addresses saved yet.</p>
              )}
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`border p-4 rounded shadow ${
                    selectedAddress?._id === addr._id
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  <h3 className="font-semibold text-lg">
                    {addr.city} - {addr.area}
                  </h3>
                  <p className="text-sm">
                    {addr.street}, Bldg {addr.building}, Floor {addr.floor}, Apt{" "}
                    {addr.apartment}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <input
                      id={`addressRadio-${addr._id}`}
                      type="radio"
                      name="address"
                      checked={selectedAddress?._id === addr._id}
                      onChange={() => handleSelectAddress(addr)}
                      className="text-green-700"
                    />
                    <label
                      htmlFor={`addressRadio-${addr._id}`}
                      className="sr-only"
                    >
                      Select address {addr._id}
                    </label>
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className="text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between">
                <Button
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
                  className="mt-4 border border-primary text-primary p-2 rounded-lg "
                >
                  Add New Address
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="mt-4  bg-primary text-white p-3 rounded-lg"
                >
                  Next
                </Button>
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
              <div className="flex items-center gap-2">
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
