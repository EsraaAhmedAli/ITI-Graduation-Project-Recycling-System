"use client";
import ReceiptCard from "../../../components/RecipetCard";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader } from '@/components/common'
import { useLanguage } from "@/context/LanguageContext";

const ReceiptPage = () => {
  const {t}= useLanguage()
  const params = useParams();
  const orderId = params?.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["receipt", orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then((res) => res?.data),
    enabled: !!orderId,
  });

  if (isLoading) return <Loader title={t('loaders-recipet')} />;
  if (isError || !data) return <p>Error loading receipt.</p>;

  const order = data.data;

  const totalPoints = order?.items?.reduce(
    (sum, item) => sum + (item.points || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <ReceiptCard
        orderId={order?._id}
        date={new Date(order?.createdAt).toLocaleDateString()}
        address={order?.address.street}
        deliveryFee={order?.deliveryFee || 0}
        points={totalPoints}
        items={order?.items?.map((item) => ({
          name: item.itemName,
          quantity: item.quantity,
        }))}
        userName={order?.user?.userName || "Customer"}
      />
    </div>
  );
};

export default ReceiptPage;
