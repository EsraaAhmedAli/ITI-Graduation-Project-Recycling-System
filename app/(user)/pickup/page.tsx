"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { City, FormInputs } from "@/components/Types/address.type";
import Review from "./ReviewForm";
import Step from "./Step";
import Button from "@/components/common/Button";
import AddressStep from "./AddressStep";
import api from "@/services/api";
import { toast } from "react-toastify";

export default function PickupConfirmation() {
  const [currentStep, setCurrentStep] = useState(1);
const [loading, setLoading] = useState<boolean>(true);
const [copied, setCopied] = useState(false);
const[loadingBtn , setLoadingBtn] = useState<boolean>(false)
const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const [selectedCity, setSelectedCity] = useState<City | "">("");
  const [formData, setFormData] = useState<FormInputs | null>(null);
  const [savedAddress, setSavedAddress] = useState<FormInputs | null>(null);
  const [isEditing, setIsEditing] = useState(false);
const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

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
  const saved = localStorage.getItem("userAddress");
  if (saved) {
    const parsed: FormInputs = JSON.parse(saved);
    setSavedAddress(parsed);
    setFormData(parsed);
    setSelectedCity(parsed.city as City);
    reset(parsed);
    setIsEditing(false); // show summary by default
  } else {
    setIsEditing(true);
  }
  setLoading(false);
}, [reset]);


const goToStep = (step: number) => {
  if (step > currentStep) {
    setDirection('forward');
  } else if (step < currentStep) {
    setDirection('backward');
  }
  setCurrentStep(step);
};
  const handleConfirm = () => {
    setLoadingBtn(true)
    api.post('orders',{
      userId:123,
      address:formData,
      items:[{ "name": "Cans", "quantity": 10 ,"totalPoints" :500 },
],

    }).then(res=> {
      setLoadingBtn(false)
      setCreatedOrderId(res.data.order._id)
      console.log(res.data);
      setCurrentStep(3)
      
    }
    ).catch(err=>{
      toast.error(err?.message)
      console.log(err);
            setLoadingBtn(false)
            

      
    }
    )
    if (!formData) return;

    console.log("Sending order to server:", formData);
  };

  // Save new or edited address to localStorage & state
  const handleSaveAddress = (data: FormInputs) => {
    localStorage.setItem("userAddress", JSON.stringify(data));
    setSavedAddress(data);
    setFormData(data);
    setSelectedCity(data.city as City);
    setIsEditing(false);
    setCurrentStep(1);
    reset(data);
  };

  const handleDeleteAddress = () => {
    localStorage.removeItem("userAddress");
    setSavedAddress(null);
 
    setIsEditing(true);
   reset({street:'',floor:null,apartment:'',area:'',building:'',city:'',landmark:'',notes:''})
  };

  const handleEditAddress = () => {
    if (!savedAddress) return;
    setIsEditing(true);
    reset(savedAddress);
    setSelectedCity(savedAddress.city as City);
    setFormData(savedAddress);
  };

  if(loading) return null
  return (
    <div className="lg:w-3xl w-full mx-auto md:p-8 p-5 bg-white rounded-2xl shadow-lg border border-green-100">
      <div className="flex my-3 flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
<Step label="Address" direction={direction} isCurrent={currentStep === 1} active={currentStep >= 1} stepNumber={1} />
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
<Step label="Review" direction={direction} isCurrent={currentStep === 2} active={currentStep >= 2} stepNumber={2} />
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
<Step label="Finish" direction={direction} isCurrent={currentStep === 3} active={currentStep >= 3} stepNumber={3} />
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
            onClick={() => goToStep(currentStep+1)}
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
    <h2 className="text-3xl font-bold text-green-700">Pickup Request Confirmed!</h2>
    <p className="text-green-900 text-lg">
      Thank you for your request. We will contact you soon to schedule your pickup.
    </p>
    {createdOrderId && (
      <div className="bg-white border border-green-300 rounded-lg p-4 shadow-sm inline-block">
        <p className="text-sm text-green-800 mb-2 font-medium">Your Tracking Number:</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-green-900 text-lg break-all">{createdOrderId}</span>
            <button
        onClick={() => {
          navigator.clipboard.writeText(createdOrderId);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
        }}
        className={`text-sm border px-2 py-1 rounded
          ${copied
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
    <Button
      onClick={() => {
        setCurrentStep(1);
        setIsEditing(false);
        setCreatedOrderId(null);
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
