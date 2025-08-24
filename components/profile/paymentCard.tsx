// components/profile/PaymentCard.tsx
import React, { memo } from "react";

interface PaymentCardProps {
  payment: any;
}

const PaymentCard = memo(function PaymentCard({
  payment,
}: PaymentCardProps) {
  return (
    <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 bg-green-50 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-2">
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">
            <span className="font-medium">Date:</span>{" "}
            <span className="ml-1">
              {payment.created
                ? new Date(payment.created * 1000).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Unknown Date"}
            </span>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Status:</span>{" "}
            <span className="capitalize text-green-700 font-medium ml-1 inline-flex items-center">
              {payment.status === "succeeded" && (
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {payment.status}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0 text-right sm:text-left">
          <div className="text-lg sm:text-xl font-bold text-green-600">
            {(payment.amount / 100).toFixed(2)} EGP
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Payment #{payment.id?.slice(-8) || "N/A"}
          </div>
        </div>
      </div>

      {payment.receipt_url && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <a
            href={payment.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium hover:underline transition-colors duration-200"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View Receipt
          </a>
        </div>
      )}
    </div>
  );
});

export default PaymentCard;