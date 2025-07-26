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
import { Building2, ChevronRight, Edit3, Home, MapPin, Plus, Trash2 } from "lucide-react";
import StatusTimeline from "./orders/StatusTimeline";
import { TrackingMap } from "./orders/TrackingMap";
import { CancelOrderDialog } from "./orders/CancelOrderDialog";
import { SafetyDialog, SafetyReportData } from "./orders/SafetyDialog";
import DriverInfoCard from "@/components/driver/DriverInfoCard";
import { useRouter } from "next/navigation";
import OrderTracker from "@/components/order/OrderTracker";

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
  
  // Tracking states
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<{id: string; message: string; timestamp?: string}[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    name: "Ahmed Hassan",
    phoneNumber: "+20 123 456 7890",
    licenseNumber: "DL-2024-001",
    avatarUrl: "/images/driver1.jpg"
  });
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [cancellationReason, setCancellationReason] = useState<string | null>(null);

  const { user } = useContext(UserAuthContext) ?? {};
  const router = useRouter();
  
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
    } catch (err: any) {
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

  // Tracking functionality
  useEffect(() => {
    if (createdOrderId && currentStep === 3) {
      // Set initial status and driver info immediately
      // Check order status to see if admin has approved and assigned driver
      const checkOrderStatus = async () => {
        try {
          const res = await api.get(`/orders/${createdOrderId}`);
          const orderData = res.data.data;
          
          // Only show tracking if order is confirmed and has a driver assigned
          if (orderData.isConfirmed && orderData.driverId && orderData.status === "assigned") {
            setOrderStatus(orderData.status);
            // Move to step 4 (Pickup Track) when order is approved and driver assigned
            setCurrentStep(4);
          } else {
            // Order is still pending admin approval
            setOrderStatus("pending");
          }
        } catch (error) {
          console.error("Error checking order status:", error);
          setOrderStatus("pending");
        }
      };
      
      checkOrderStatus();
      const iv = setInterval(checkOrderStatus, 30000); // Check every 30 seconds
      return () => clearInterval(iv);
    }
  }, [createdOrderId, currentStep, orderStatus]);

  // Handle tracking on step 4 (Pickup Track)
  useEffect(() => {
    if (createdOrderId && currentStep === 4) {
      const fetchTracking = async () => {
        try {
          const trackRes = await fetch(`/api/pickups/track?orderId=${createdOrderId}`);
          const trackData = await trackRes.json();
          const { status, updates } = trackData.data;
          setOrderStatus(status);
          setStatusUpdates(updates);
        } catch { console.error("track error"); }
      };
      fetchTracking();
      const iv = setInterval(fetchTracking, 10000);
      return () => clearInterval(iv);
    }
  }, [createdOrderId, currentStep]);

  // Hide cancel button after 2 minutes (only on waiting step)
  useEffect(() => {
    if (currentStep === 3 && showCancelButton) {
      const timer = setTimeout(() => {
        setShowCancelButton(false);
      }, 120000); // 2 minutes = 120,000 ms
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, showCancelButton]);

  // Complete order only when status is actually completed (not automatic)
  useEffect(() => {
    if (currentStep === 4 && orderStatus === "completed" && !orderCompleted) {
      setOrderCompleted(true);
      toast.success("Order completed successfully!");
      // Navigate to home page after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [currentStep, orderStatus, orderCompleted, router]);

  const handleCancelConfirm = async (reason: string) => {
    setCancelLoading(true);
    try {
      console.log("Cancelling order:", { orderId: createdOrderId, reason });
      const response = await api.patch('/orders/cancel', { 
        orderId: createdOrderId, 
        reason 
      });
      console.log("Cancel response:", response.data);
      
      if (response.data.success) {
        setOrderStatus("cancelled");
        setCancellationReason(reason);
        toast.success("Order cancelled successfully");
        setCancelOpen(false);
        // Navigate to home page after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to cancel order");
      }
    } catch (error: any) { 
      console.error("Cancel error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Cancel failed - please try again";
      toast.error(errorMessage);
    }
    finally { setCancelLoading(false); }
  };

  const handleSafetyReport = async (report: SafetyReportData) => {
    setSafetyLoading(true);
    try {
      // Add orderId to the report data and set default severity
      const reportData = {
        ...report,
        orderId: createdOrderId,
        severity: "medium" // Default severity since we removed it from frontend
      };
      
      console.log("Submitting safety report:", reportData);
      const response = await api.post('/orders/safety-report', reportData);
      
      if (response.data.success) {
        toast.success("Safety report submitted successfully");
        setSafetyOpen(false);
        // Navigate to home page after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to submit safety report");
      }
    } catch (error: any) { 
      console.error("Safety report error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit safety report";
      toast.error(errorMessage);
    }
    finally { setSafetyLoading(false); }
  };

  const handleEmergency = async () => {
    try {
      const response = await api.post('/orders/emergency', { 
        orderId: createdOrderId 
      });
      
      if (response.data.success) {
        toast.success("Emergency services contacted");
        // Navigate to home page after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to contact emergency services");
      }
    } catch (error: any) { 
      console.error("Emergency error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to contact emergency services";
      toast.error(errorMessage);
    }
  };

  const handleSupportRequest = () => {
    setSupportOpen(false);
    toast.success(`We will call you shortly at ${user?.phoneNumber || 'your registered number'}`);
  };

  // Function to get random driver info
  const getRandomDriverInfo = () => {
    const drivers = [
      {
        name: "Ahmed Hassan",
        phoneNumber: "+20 123 456 7890",
        licenseNumber: "DL-2024-001",
        avatarUrl: "/images/driver1.jpg"
      },
      {
        name: "Mohammed Ali",
        phoneNumber: "+20 987 654 3210",
        licenseNumber: "DL-2024-002",
        avatarUrl: "/images/driver2.jpg"
      },
      {
        name: "Omar Khalil",
        phoneNumber: "+20 555 123 4567",
        licenseNumber: "DL-2024-003",
        avatarUrl: "/images/driver3.jpg"
      },
      {
        name: "Youssef Ahmed",
        phoneNumber: "+20 777 888 9999",
        licenseNumber: "DL-2024-004",
        avatarUrl: "/images/driver4.jpg"
      }
    ];
    
    return drivers[Math.floor(Math.random() * drivers.length)];
  };

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
        // Redirect to success page instead of staying on pickup page
        router.push(`/order-success?orderId=${res.data.data._id}`);
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
          label="Waiting"
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
          label="Pickup Track"
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

              {currentStep === 3 && orderStatus && (
          <div className="space-y-6">
            <TrackingMap orderStatus={orderStatus} />
            <StatusTimeline status={orderStatus} updates={statusUpdates} />
            
            {/* Driver Information */}
            {orderStatus !== "completed" && orderStatus !== "cancelled" && (
              <DriverInfoCard 
                name={driverInfo.name}
                phoneNumber={driverInfo.phoneNumber}
                licenseNumber={driverInfo.licenseNumber}
                avatarUrl={driverInfo.avatarUrl}
              />
            )}

            {/* Cancellation Reason */}
            {orderStatus === "cancelled" && cancellationReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800">Order Cancelled</h3>
                </div>
                <p className="text-red-700">
                  <span className="font-medium">Reason:</span> {cancellationReason}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setSafetyOpen(true)} 
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Report Safety Issue
              </Button>
              <Button 
                onClick={() => setSupportOpen(true)} 
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
                Need Support
              </Button>
              {showCancelButton && (
                <Button 
                  onClick={() => setCancelOpen(true)} 
                  disabled={["completed", "cancelled"].includes(orderStatus)}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Show waiting page when order is pending admin approval */}
        {currentStep === 3 && createdOrderId && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Status Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Under Review</h2>
                <p className="text-gray-600 text-lg">Your recycling request is being processed by our team</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">Step 1 of 3</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium text-green-600">Submitted</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full w-full"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium text-orange-600">Under Review</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gray-200 rounded-full w-0"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">3</span>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-500">Approved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Details and Next Steps */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Request Details Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">Request Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request ID:</span>
                    <span className="font-medium text-gray-800">ECO-{createdOrderId?.slice(-4) || '2024'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material Type:</span>
                    <span className="font-medium text-gray-800">Mixed Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-800">{cart.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium text-gray-800">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">Next Steps</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-orange-600">Review in Progress</p>
                      <p className="text-sm text-gray-600">Our team is evaluating your request</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Email Notification</p>
                      <p className="text-sm text-gray-600">You&apos;ll receive approval status via email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Schedule Pickup</p>
                      <p className="text-sm text-gray-600">Book your convenient pickup time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </Button>
              <Button 
                onClick={() => router.push("/")} 
                className="flex-1 sm:flex-none bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                ← Back to Dashboard
              </Button>
            </div>

            {/* Need Help Section */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-8 text-center text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-blue-100 mb-6">Our support team is here to assist you with any questions about your request.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">support@ecorecyclehub.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">(123) 456-7890</span>
                </div>
              </div>
            </div>

            {/* Safety and Cancel Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setSafetyOpen(true)} 
                className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Report Safety Issue
              </Button>
              <Button 
                onClick={() => setSupportOpen(true)} 
                className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
                Need Support
              </Button>
              {showCancelButton && (
                <Button 
                  onClick={() => setCancelOpen(true)} 
                  className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}

                {/* Real-time Order Tracking */}
        {currentStep === 4 && createdOrderId && (
          <div className="space-y-6">
            <OrderTracker 
              orderId={createdOrderId}
              showDetails={true}
              onStatusChange={(oldStatus, newStatus) => {
                console.log(`Order status changed from ${oldStatus} to ${newStatus}`);
                setOrderStatus(newStatus);
              }}
            />
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setSafetyOpen(true)} 
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Report Safety Issue
              </Button>
              <Button 
                onClick={() => setSupportOpen(true)} 
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
                Need Support
              </Button>
              {showCancelButton && (
                <Button 
                  onClick={() => setCancelOpen(true)} 
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}

      {currentStep === 3 && !orderStatus && (
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

      {cancelOpen && (
        <CancelOrderDialog
          open={cancelOpen}
          onClose={()=>setCancelOpen(false)}
          onConfirm={handleCancelConfirm}
          isLoading={cancelLoading}
        />
      )}

      {safetyOpen && (
        <SafetyDialog
          open={safetyOpen}
          onClose={() => setSafetyOpen(false)}
          onReport={handleSafetyReport}
          onEmergency={handleEmergency}
          isLoading={safetyLoading}
          orderNumber={createdOrderId || ""}
          driverName="Driver Name"
        />
      )}

      {supportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-blue-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
                <h3 className="text-lg font-semibold">Need Support?</h3>
              </div>
              <button 
                onClick={() => setSupportOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">We'll Call You Back</h4>
              <p className="text-gray-600">
                Our support team will contact you shortly at your registered phone number.
              </p>
              {user?.phoneNumber && (
                <p className="text-sm text-gray-500 mt-2">
                  Phone: {user.phoneNumber}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setSupportOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                onClick={handleSupportRequest}
              >
                Request Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
