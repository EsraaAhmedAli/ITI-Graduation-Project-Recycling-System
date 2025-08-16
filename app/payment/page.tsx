'use client'

import React, { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import convertToSubcurrency from '@/lib/converToSubCurrency'
import CheckoutPage from '@/components/buyer/checkoutpage'
import { useSearchParams } from 'next/navigation'


if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY == undefined) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is undefined')
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

// Define the checkout data interface
interface CheckoutData {
  cart: any[];
  selectedAddress: {
    _id: string;
    city: string;
    area: string;
    street: string;
    building: string;
    floor: string;
    apartment: string;
    landmark?: string;
    notes?: string;
  };
  totalPrice: number;
  deliveryFee: number;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}


export default function RecyclingPaymentPage() {


const searchParams = useSearchParams()
  const rawAmount = searchParams.get("total")
  const basePrice = rawAmount ? parseFloat(rawAmount) : 0

  
  const finalAmount = basePrice
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card')


  // استرجاع بيانات الدفع من sessionStorage
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('checkoutData')
      if (storedData) {
        const parsedData: CheckoutData = JSON.parse(storedData)
        setCheckoutData(parsedData)
        console.log('Retrieved checkout data:', parsedData)
      } else {
        console.warn('No checkout data found in sessionStorage')
      }
    } catch (error) {
      console.error('Error parsing checkout data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-green-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  // Show error if no data found
  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Data Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to retrieve checkout information. Please try again.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br" style={{ 
    background: "linear-gradient(to bottom right, var(--section-gradient-start), var(--section-gradient-middle), var(--section-gradient-end))" 
  }}>
      {/* Header with Order Summary */}
    

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-1 gap-12 items-start">
         

        
          {/* <main className="max-w-6xl mx-auto px-6 py-12">
  <div className="grid lg:grid-cols-1 gap-12 items-start">

  
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      <div className="flex justify-between mb-2">
        <span>Subtotal:</span>
        <span>{checkoutData.totalPrice} EGP</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Delivery Fee:</span>
        <span>{checkoutData.deliveryFee} EGP</span>
      </div>
      <div className="flex justify-between font-bold text-green-700">
        <span>Total:</span>
        <span>{finalAmount} EGP</span>
      </div>
    </div> 

 

  </div>
</main> */}

          <div className="lg:col-span-2 order-1 lg:order-2">
          <Elements
  stripe={stripePromise}
  options={{
    mode: "payment",
   amount: convertToSubcurrency(finalAmount),
    currency: "egp",
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#059669',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
      }
    }
  }}
>
  <CheckoutPage 
    amount={finalAmount} 
    checkoutData={checkoutData}
  />
</Elements>

          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 text-center mb-8">Why Choose EcoRecycle?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Secure & Trusted</h4>
              <p className="text-gray-600 text-sm">Bank-level security with SSL encryption for all transactions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">24/7 Support</h4>
              <p className="text-gray-600 text-sm">Round-the-clock customer support for all your needs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18,11H15V8.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 12,8.5A1.5,1.5 0 0,0 10.5,7A1.5,1.5 0 0,0 9,8.5V11H6V19H18V11Z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Certified Process</h4>
              <p className="text-gray-600 text-sm">EPA certified recycling with full compliance tracking</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}