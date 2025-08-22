// components/profile/PaymentCard.tsx
import React, { memo } from "react";

interface PaymentCardProps {
  payment: any;
}

const PaymentCard = memo(function PaymentCard({
  payment,
}: PaymentCardProps) {
  return (
    <div className="rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <span>
          Date:{" "}
          {payment.created
            ? new Date(payment.created * 1000).toLocaleDateString()
            : "Unknown Date"}
        </span>
        <div className="text-right">
          <div className="font-bold text-green-600">
            {(payment.amount / 100).toFixed(2)} EGP
          </div>
        </div>
      </div>

      <div className="mt-1 text-sm text-gray-600">
        Status:{" "}
        <span className="capitalize text-green-700 font-medium">
          {payment.status}
        </span>
      </div>

      {payment.receipt_url && (
        <a
          href={payment.receipt_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-green-600 hover:underline"
        >
          View Receipt
        </a>
      )}
    </div>
  );
});

export default PaymentCard;