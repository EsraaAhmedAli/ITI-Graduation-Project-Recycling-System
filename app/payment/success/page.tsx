'use client';

import Button from "@/components/common/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const paidAmount = searchParams.get("amount"); 
  const baseAmount = searchParams.get("total"); 

  return (
    <main className="mx-auto px-6 py-8 w-1/2">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-center text-white">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
          <p className="text-green-100 text-lg">
            Thank you for choosing sustainable recycling
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8">
          {/* Payment Amount */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-2xl px-8 py-4">
              <span className="text-green-600 text-sm font-medium mr-2">Amount Paid:</span>
              <span className="text-green-800 text-3xl font-bold">
                {paidAmount} EGP
              </span>
            </div>

            {baseAmount && (
              <p className="text-sm text-gray-500 mt-2">
                Base price before markup: <strong>{baseAmount} EGP</strong>
              </p>
            )}
          </div>

          {/* Environmental Impact Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-100">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-green-800 mb-2">🌍 Your Environmental Impact</h2>
              <p className="text-green-700 text-sm">Every payment helps create a cleaner, greener planet</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-green-800 font-semibold text-sm">Supports</div>
                <div className="text-green-600 text-xs">Eco-friendly initiatives</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                <div className="text-2xl mb-1">♻️</div>
                <div className="text-green-800 font-semibold text-sm">Enables</div>
                <div className="text-green-600 text-xs">Waste recycling</div>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                <div className="text-2xl mb-1">🌿</div>
                <div className="text-green-800 font-semibold text-sm">Reduces</div>
                <div className="text-green-600 text-xs">Carbon footprint</div>
              </div>
            </div>

            <div className="mx-auto w-1/4 my-2">
              <Link
                className="text-center block bg-green-500 text-white rounded-md py-1"
                href="/buyer/orders"
              >
                See your orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
