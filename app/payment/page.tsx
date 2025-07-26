'use client'

import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import convertToSubcurrency from '@/lib/converToSubCurrency'
import CheckoutPage from '@/components/buyer/checkoutpage'

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY == undefined) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is undefined')
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

export default function RecyclingPaymentPage() {
  const amount = 49

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
 

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-1 gap-12 items-start">
              {/* Payment Section */}
          <div className="lg:sticky lg:top-8">
            <Elements
              stripe={stripePromise}
              options={{
                mode: "payment",
                amount: convertToSubcurrency(amount),
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
              <CheckoutPage amount={amount} />
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