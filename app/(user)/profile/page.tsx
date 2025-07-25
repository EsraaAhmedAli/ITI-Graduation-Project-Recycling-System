"use client";

import { useEffect, useState } from "react";
import { useUserAuth } from "@/context/AuthFormContext";
import { Avatar } from "flowbite-react";
import { Order, OrdersResponse } from "@/components/Types/orders.type";
import Loader from "@/components/common/loader";
import api from "@/lib/axios";
import { ProtectedRoute } from "@/lib/userProtectedRoute";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import { Pencil, RefreshCcw } from "lucide-react";
import RecyclingModal from "@/components/eWalletModal/ewalletModal";
import { useUserPoints } from "@/hooks/useGetUserPoints";

// Add interface for user points
interface UserPointsData {
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  pointsHistory: Array<{
    orderId?: string;
    points: number;
    type: 'earned' | 'deducted' | 'adjusted';
    reason: string;
    timestamp: string;
  }>;
  pagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface UserPointsResponse {
  success: boolean;
  data: UserPointsData;
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, token } = useUserAuth();
  console.log(user);
    const { userPoints, pointsLoading, getUserPoints } = useUserPoints({
    userId: user?._id,
    name: user?.name,
    email: user?.email,
  });
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("incoming");

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
const closeModal=()=>{
  setModalOpen(false)
}

  const refreshPoints = async () => {
  await getUserPoints();
};

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      return res.data;
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
              order._id === orderId ? { ...order, status: "cancelled" } : order
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
    if (user && token) {
      getAllOrders();
      getUserPoints(); // Fetch user points
    }
  }, [user, token]);

  const filteredOrders = allOrders.filter((order) => {
    const status = order.status

    if (activeTab === "incoming") {
      return ["Pending", "assigntocourier"].includes(status);
    }
    if (activeTab === "completed") {
      return status === "completed";
    }
    if (activeTab === "cancelled") {
      return status === "cancelled";
    }
    return true;
  });

  // Updated stats to use stored points instead of calculated points
  const stats = {
    totalRecycles: allOrders.filter((or) => or.status == "completed").length,
    points: userPoints?.totalPoints || 0, // Use stored points
    categories: 4,
    tier: 50,
  };

  const tabs = ["incoming", "completed", "cancelled"];
  const [modalOpen, setModalOpen] = useState(false);

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

   <div className="flex gap-4 items-center mt-4">
      {/* Return & Earn Button */}
      <button
       onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
      >
        <RefreshCcw size={18} />
        Return & Earn
      </button>

      {/* Edit Profile Link */}
      <Link
        href="/editprofile"
        className="flex items-center gap-2 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-colors duration-200"
      >
        <Pencil size={16} />
        Edit Profile
      </Link>
    </div>
        </div>
        <RecyclingModal   onPointsUpdated={refreshPoints}
 modalOpen={modalOpen} closeModal={closeModal} totalPoints={userPoints?.totalPoints}/>

        {/* Stats - Updated to show loading state for points */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox label="Total Recycles" value={stats.totalRecycles} />
          <StatBox 
            label="Points Collected" 
            value={stats.points} 
            loading={pointsLoading}
          />
          <StatBox label="Membership Tier" value={stats.tier} />
        </div>

        {/* Points History Section - New addition */}
        {userPoints && userPoints.pointsHistory.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Recent Points Activity</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userPoints.pointsHistory.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{entry.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-bold text-sm ${
                    entry.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.points > 0 ? '+' : ''}{entry.points} pts
                  </div>
                </div>
              ))}
            </div>
            {userPoints.pointsHistory.length > 3 && (
              <button className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium">
                View all activity →
              </button>
            )}
          </div>
        )}

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
                
                {/* Show points earned for completed orders */}
                {order.status === 'completed' && (
                  <div className="bg-green-100 p-2 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold">
                      ✅ Points Earned: {order.items.reduce((sum, item) => sum + (item.points || 0), 0)} pts
                    </p>
                  </div>
                )}
                
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
                {activeTab === "incoming" && order.status !=='assigntocourier' && (
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

// Updated StatBox to handle loading state
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