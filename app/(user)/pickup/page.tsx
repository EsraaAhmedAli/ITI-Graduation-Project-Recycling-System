"use client";

import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { City, FormInputs } from "@/components/Types/address.type";
import Review from "./ReviewForm";
import Step from "./Step";
import Button from "@/components/common/Button";
import AddressStep from "./AddressStep";

export default function PickupConfirmation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState<City | "">("");
  const [formData, setFormData] = useState<FormInputs | null>(null);
  const [savedAddress, setSavedAddress] = useState<FormInputs | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Load saved address from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("userAddress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedAddress(parsed);
      setFormData(parsed);
      setSelectedCity(parsed.city);
      reset(parsed); // prefill form if needed
    }
  }, [reset]);

  const handleStep1Submit: SubmitHandler<FormInputs> = (data) => {
    setFormData(data);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = () => {
    if (!formData) return;

    console.log("Sending order to server:", formData);
    setCurrentStep(3);
  };

  // Save new or edited address to localStorage & state
  const handleSaveAddress = (data: FormInputs) => {
    localStorage.setItem("userAddress", JSON.stringify(data));
    setSavedAddress(data);
    setFormData(data);
    setSelectedCity(data.city);
    setIsEditing(false);
    setCurrentStep(1);
    reset(data);
  };

  // Delete saved address
  const handleDeleteAddress = () => {
    localStorage.removeItem("userAddress");
    setSavedAddress(null);
    setFormData(null);
    setSelectedCity("");
    setIsEditing(true);
    reset();
  };

  // Start editing (show form prefilled)
  const handleEditAddress = () => {
    if (!savedAddress) return;
    setIsEditing(true);
    reset(savedAddress);
    setSelectedCity(savedAddress.city);
    setFormData(savedAddress);
  };

  // If editing or no saved address → show form,
  // otherwise show saved address summary with edit/delete icons
  return (
    <div className="lg:w-3xl w-full mx-auto md:p-8 p-5 bg-white rounded-2xl shadow-lg border border-green-100">
      <div className="flex my-3 flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
        <Step label="Address" active={currentStep >= 1} />
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
        <Step label="Review" active={currentStep >= 2} />
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
        <Step label="Finish" active={currentStep >= 3} />
      </div>

 
{currentStep === 1 && (
  <>
    {!savedAddress || isEditing ? (
      <AddressStep
        register={register}
        errors={errors}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        setValue={setValue}
        isValid={isValid}
        onSubmit={handleSubmit(handleSaveAddress)}
      />
    ) : (
<>
      <div className="border border-gray-300 rounded-lg p-6 shadow-md flex flex-col md:flex-row justify-between items-center bg-green-50">
        <div className="space-y-1 text-gray-800 text-sm">
          <h3 className="font-semibold text-green-700 mb-2">Saved Address</h3>
          <p>
            <span className="font-medium">City:</span> {savedAddress.city}
          </p>
          <p>
            <span className="font-medium">Area:</span> {savedAddress.area}
          </p>
          <p>
            <span className="font-medium">Street:</span> {savedAddress.street}
          </p>
          <p>
            <span className="font-medium">Building:</span> {savedAddress.building}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button
            aria-label="Edit Address"
            onClick={handleEditAddress}
            className="p-2 rounded-full hover:bg-gray-100 transition text-green-700"
            title="Edit Address"
          >
            edit
          </button>
          <button
            aria-label="Delete Address"
            onClick={handleDeleteAddress}
            className="p-2 rounded-full hover:bg-gray-100 transition text-red-600"
            title="Delete Address"
          >
            delete
          </button>
 
        </div>
        
      </div>
               <Button
            onClick={() => setCurrentStep(2)}
            className="bg-green-600 mt-3 ms-auto hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Next
          </Button>
</>
    )}
  </>
)}
      {currentStep === 2 && (
        <Review
          formData={formData}
          onBack={() => setCurrentStep(1)}
          onConfirm={handleConfirm}
        />
      )}

      {currentStep === 3 && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-700">Pickup Request Confirmed!</h2>
          <p className="text-green-900">
            Your request has been sent. We will contact you soon for pickup scheduling.
          </p>
          <Button
            onClick={() => {
              setCurrentStep(1);
              setIsEditing(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Make Another Request
          </Button>
        </div>
      )}
    </div>
  );
}
