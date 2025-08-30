// components/profile/PaymentsHistory.tsx
import React, { memo, useState, useEffect } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/axios";
import PaymentCard from "./paymentCard";
import { CreditCard } from "lucide-react";

// Payment skeleton component matching the review/order pattern
const PaymentSkeleton = () => (
  <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 bg-green-50 shadow-sm border border-green-100">
    <div className="animate-pulse">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-2">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex-shrink-0 text-right sm:text-left space-y-1">
          <div className="h-6 bg-gray-200 rounded w-20 ml-auto sm:ml-0"></div>
          <div className="h-3 bg-gray-200 rounded w-16 ml-auto sm:ml-0"></div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-green-200">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

// Loading skeleton grid matching ReviewsTab pattern
const PaymentsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard size={20} />
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <PaymentSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

const PaymentsHistory = memo(function PaymentsHistory() {
  const { t } = useLanguage();
  const { user } = useUserAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      api
        .get(`/users/${user._id}/payments`)
        .then((res) => {
          setPayments(res.data);
        })
        .catch((err) => {
          console.error("Failed to load payment history", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user?._id]);

  if (loading) {
    return <PaymentsLoadingSkeleton />;
  }

  if (!payments.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CreditCard size={48} className="mx-auto mb-3 text-gray-300" />
        <p>No payments found.</p>
        <p className="text-sm">Your payment history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          Payment History ({payments.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(payments) &&
            payments.map((payment, index) => (
              <PaymentCard key={payment._id || index} payment={payment} />
            ))}
        </div>
      </div>
    </div>
  );
});

export default PaymentsHistory;