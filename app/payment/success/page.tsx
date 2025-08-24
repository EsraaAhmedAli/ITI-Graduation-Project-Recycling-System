'use client';
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderId = sessionStorage.getItem('orderId');
  const paidAmount = searchParams.get("amount");
 
  console.log(orderId);
  
  return (
    <main className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-8 py-8 sm:py-10 text-center text-white">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg 
                className="w-8 h-8 sm:w-10 sm:h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Payment Successful!</h1>
            <p className="text-green-100 text-base sm:text-lg">
              Thank you for choosing sustainable recycling
            </p>
          </div>

          {/* Content Section */}
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            {/* Payment Amount */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-xl sm:rounded-2xl px-4 sm:px-8 py-3 sm:py-4">
                <span className="text-green-600 text-xs sm:text-sm font-medium mr-2">Amount Paid:</span>
                <span className="text-green-800 text-2xl sm:text-3xl font-bold">
                  {paidAmount} EGP
                </span>
              </div>
              {/* {baseAmount && (
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Original price before markup: <strong>{baseAmount} EGP</strong>
                </p>
              )} */}
            </div>

            {/* Environmental Impact Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-green-100">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
                  🌍 Your Environmental Impact
                </h2>
                <p className="text-green-700 text-xs sm:text-sm">
                  Every payment helps create a cleaner, greener planet
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center mb-6">
                <div className="bg-white/60 rounded-lg p-3 sm:p-4 border border-green-200">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌱</div>
                  <div className="text-green-800 font-semibold text-sm">Supports</div>
                  <div className="text-green-600 text-xs">Eco-friendly initiatives</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3 sm:p-4 border border-green-200">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">♻️</div>
                  <div className="text-green-800 font-semibold text-sm">Enables</div>
                  <div className="text-green-600 text-xs">Waste recycling</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3 sm:p-4 border border-green-200">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌿</div>
                  <div className="text-green-800 font-semibold text-sm">Reduces</div>
                  <div className="text-green-600 text-xs">Carbon footprint</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-4">
                <Link
                  className="w-full sm:flex-1 text-center block bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg py-3 px-4 transition-colors duration-200 text-sm sm:text-base"
                  href="/profile"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                    <span>View Your Orders</span>
                  </div>
                </Link>
                
                {orderId && (
                  <Link
                    className="w-full sm:flex-1 text-center block bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg py-3 px-4 transition-colors duration-200 text-sm sm:text-base"
                    href={`/pickup/tracking/${orderId}`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg 
                        className="w-4 h-4 sm:w-5 sm:h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                        />
                      </svg>
                      <span>Track Your Order</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="text-center">
              <div className="inline-flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg px-3 sm:px-4 py-2">
                <svg 
                  className="w-4 h-4 mr-2 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>You'll receive a confirmation email shortly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}