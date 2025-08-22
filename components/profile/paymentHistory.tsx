// components/profile/PaymentsHistory.tsx
import React, { memo, useState, useEffect } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/axios";
import PaymentCard from "./paymentCard";
import Loader from "../common/Loader";

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

  if (loading) return <Loader title={t("loaders.payments")} />;

  if (!payments.length)
    return <p className="text-center text-gray-500">No payments found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.isArray(payments) &&
        payments.map((payment, index) => (
          <PaymentCard key={payment._id || index} payment={payment} />
        ))}
    </div>
  );
});

export default PaymentsHistory;
