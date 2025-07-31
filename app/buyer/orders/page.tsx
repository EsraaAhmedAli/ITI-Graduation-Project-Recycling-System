"use client";

import { useEffect, useState } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { Order, OrdersResponse } from "@/components/Types/orders.type";
import Loader from "@/components/common/loader";
import api from "@/lib/axios";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import { CheckCircle, Clock1, Truck, XCircle } from "lucide-react";
import { useUserPoints } from "@/hooks/useGetUserPoints";
import ItemsModal from "@/components/shared/itemsModal";
import PointsActivity from "@/components/accordion/accordion";
import MembershipTier from "@/components/memberTireShip/memberTireShip";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, token } = useUserAuth();
  const { userPoints, pointsLoading, getUserPoints } = useUserPoints({
    userId: user?._id,
    name: user?.name,
    email: user?.email,
  });
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming");
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const { t } = useLanguage();

  const getAllOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get<OrdersResponse>("/orders");
      setAllOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      getAllOrders();
      getUserPoints();
    }
  }, [user, token]);

  const filteredOrders = allOrders.filter((order) => {
    const status = order.status;
    if (user?.role === "buyer" && status === "cancelled") return false;
    if (activeTab === "incoming") return ["pending", "assigntocourier"].includes(status);
    if (activeTab === "completed") return status === "completed";
    if (activeTab === "cancelled") return status === "cancelled";
    return true;
  });

  const openItemsModal = (items: any[]) => {
    setSelectedOrderItems(items);
    setIsItemsModalOpen(true);
  };

  const closeItemsModal = () => {
    setSelectedOrderItems([]);
    setIsItemsModalOpen(false);
  };

  const stats = {
    totalRecycles: allOrders.filter((or) => or.status === "completed")?.length,
    points: userPoints?.totalPoints || 0,
  };

  


  const tabs = ["incoming", "completed", "cancelled", "payments"];

  return (
    <div className="h-auto bg-green-50 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox label={t("profile.stats.recycles")} value={stats.totalRecycles} />
          <StatBox label={t("profile.stats.points")} value={stats.points} loading={pointsLoading} />
          <MembershipTier totalPoints={userPoints?.totalPoints} />
        </div>

        {/* Points Activity */}
        <PointsActivity userPoints={userPoints} />

        {/* Tabs */}
        <div className="flex border-b gap-6">
          {tabs
            .filter((tab) => !(tab === "cancelled" && user?.role === "buyer"))
            .map((tab) => (
              <button
                key={tab}
                className={`pb-2 capitalize font-semibold text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === tab
                    ? "border-green-600 text-green-800"
                    : "border-transparent text-gray-500 hover:text-green-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`profile.tabs.${tab}`)}
              </button>
            ))}
        </div>

        {/* Orders or Payments */}
        {activeTab === "payments" ? (
          <PaymentsHistory />
        ) : loading ? (
          <Loader title=" orders..." />
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders in this tab yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>
                    {t("profile.orders.date")}: {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    {["assigntocourier"].includes(order.status) && (
                      <>
                        <Truck size={16} className="text-yellow-600" />
                        <span className="text-yellow-700">{t("profile.orders.status.inTransit")}</span>
                      </>
                    )}
                    {["pending"].includes(order.status) && (
                      <>
                        <Clock1 size={16} className="text-yellow-400" />
                        <span className="text-yellow-400">{t("profile.orders.status.pending")}</span>
                      </>
                    )}
                    {order.status === "completed" && (
                      <>
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-green-700">{t("profile.orders.status.completed")}</span>
                      </>
                    )}
                    {order.status === "cancelled" && (
                      <>
                        <XCircle size={16} className="text-red-600" />
                        <span className="text-red-700 capitalize">{t("profile.orders.status.cancelled")}</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  {order.address.street}, Bldg {order.address.building}, Floor {order.address.floor},{" "}
                  {order.address.area}, {order.address.city}
                </div>

                <button
                  onClick={() => openItemsModal(order.items)}
                  className="self-start text-sm text-green-500 rounded-md transition"
                >
                  {t("profile.orders.viewDetails")}
                </button>
              </div>
            ))}
            <ItemsModal
              show={isItemsModalOpen}
              onclose={closeItemsModal}
              selectedOrderItems={selectedOrderItems}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, loading = false }: { label: string; value: number; loading?: boolean }) {
  return (
    <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow-sm">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-green-200 rounded mb-1"></div>
          <div className="h-4 bg-green-200 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm">{label}</p>
        </>
      )}
    </div>
  );
}

function isValidDate(date: any) {
  return !isNaN(new Date(date).getTime());
}

  function getPaymentMethodLabel(type: string | undefined) {
  if (!type) return "Unknown";
  switch (type) {
    case "card":
      return "Visa"; 
    case "link":
      return "Visa"; 
    case "paypal":
      return "PayPal";
    case "cash":
      return "Cash";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}





function PaymentsHistory() {
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
  }, [user]);

  if (loading) return <Loader title="Loading payments..." />;

  if (!payments.length)
    return <p className="text-center text-gray-500">No payments found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.isArray(payments) &&
        payments.map((payment, index) => (
          <div
            key={payment._id || index}
            className="rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between"
          >
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

            {/* <div className="text-sm text-gray-600">
              Paid with:{" "}
              <span className="text-green-700 font-medium">
              {(payment.amount / 100).toFixed(2)} EGP

              </span>
            </div> */}

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
        ))}
    </div>
  );
}

