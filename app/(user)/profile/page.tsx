"use client";

import { useEffect, useState } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { Avatar } from "flowbite-react";
import { Order, OrdersResponse } from "@/components/Types/orders.type";
import Loader from "@/components/common/loader";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, token } = useUserAuth();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("incoming");
  const router = useRouter();

  const getAllOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await api.get<OrdersResponse>("/orders");
      setAllOrders(res.data.data);
      console.log(res.data.data);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }


  };

  const cancelOrder = async (orderId: string) => {
  try {
    const res = await api.patch(`/orders/${orderId}/cancel`);
    return res.data;  // { success, message, data }
  } catch (error) {
    throw error;
  }
};
const handleCancelOrder = (orderId: string) => {
  Swal.fire({
    title: "Are you sure you want to cancel this order?",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    icon: "warning",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await cancelOrder(orderId);
        setAllOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "Cancelled" } : order
          )
        );
        Swal.fire("Order cancelled", "", "success");
      } catch (error) {
        console.error("Failed to cancel order:", error);
        Swal.fire("Failed to cancel order", "", "error");
      }
    } else {
      Swal.fire("Your order is safe", "", "info");
    }
  });
};

  useEffect(() => {
    if (user && token) getAllOrders();
  }, [user, token]);

const filteredOrders = allOrders.filter((order) => {
  const status = order.status

  if (activeTab === "incoming") {
    return ["Pending", "accepted"].includes(status);
  }
  if (activeTab === "completed") {
    return status === "completed";
  }
  if (activeTab === "Cancelled") {
    return status === "Cancelled";
  }
  return true;
});

const totalPoints = allOrders
  .filter(order => {
    const status = order.status
    return status !== "Cancelled" && status !== "Pending";
  })
  .reduce(
    (acc, order) =>
      acc + order.items.reduce((sum, item) => sum + (item.points || 0), 0),
    0
  );

const stats = {
  totalRecycles: allOrders.filter((or) => or.status !== "Cancelled").length,
  points: totalPoints,
  categories: 4,
  tier: 50,
};

  const tabs = ["incoming", "completed", "cancelled"];

  return (
    <div className="h-auto bg-green-50 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-4">
            <Avatar
              img={
                user?.imgUrl ||
                "https://api.dicebear.com/7.x/bottts/svg?seed=user123"
              }
              rounded
              size="lg"
            />
            <div>
              <h2 className="text-xl font-semibold text-green-800">
                {user?.name || "John Doe"}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">
                {user?.phoneNumber.padStart(11, "0")}
              </p>
              <p className="text-xs text-gray-400">Cairo, July 2025</p>
            </div>
          </div>

          <Link
            href="/editprofile"
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          >
            Edit Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox label="Total Recycles" value={stats.totalRecycles} />
          <StatBox label="Points Collected" value={stats.points} />
          <StatBox label="Membership Tier" value={stats.tier} />
        </div>

        {/* Tabs */}
        <div className="flex border-b gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-2 capitalize font-semibold text-sm border-b-2 transition-colors duration-200 ${
                activeTab === tab
                  ? "border-green-600 text-green-800"
                  : "border-transparent text-gray-500 hover:text-green-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <Loader title=" orders..." />
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders in this tab yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="border rounded-xl p-4 bg-green-50 shadow-sm space-y-2"
              >
                <p className="text-sm text-gray-500">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-green-700 font-semibold">
                  Status: {order.status}
                </p>
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm"
                  >
                    <Image
                    width={64}
                    height={64}
                      src={item.image}
                      alt={item.itemName}
                      className="rounded object-cover border"
                    />
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-green-800">
                        {item.itemName}
                      </span>
                      <span className="text-gray-600">
                        Quantity: {item.quantity} {item.measurement_unit === 1 ? "kg" : "pcs"}
                      </span>
                      <span className="text-gray-600">Points: {item.points}</span>
                      <span className="text-gray-600">Price: {item.price} EGP</span>
                    </div>
                  </div>
                ))}

                <div className="text-xs text-gray-500">
                  {order.address.street}, Bldg {order.address.building}, Floor {order.address.floor}, {order.address.area}, {order.address.city}
                </div>

                {/* Cancel Button */}
                {activeTab === "incoming" && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="mt-2 px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow-sm">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
