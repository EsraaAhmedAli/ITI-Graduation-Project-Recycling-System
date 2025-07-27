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
import { CheckCircle, Pencil, RefreshCcw, Truck, XCircle } from "lucide-react";
import RecyclingModal from "@/components/eWalletModal/ewalletModal";
import { useUserPoints } from "@/hooks/useGetUserPoints";
import ItemsModal from "@/components/shared/itemsModal";
import PointsActivity from "@/components/accordion/accordion";
import MembershipTier from "@/components/memberTireShip/memberTireShip";
import { SocketTester } from "@/lib/socketTester";
import { TokenDebugger } from "@/components/tokenDebugger";




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
const [isRecyclingModalOpen, setIsRecyclingModalOpen] = useState(false);
const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);

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
const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);

const openItemsModal = (items: any[]) => {
  setSelectedOrderItems(items);
  setIsItemsModalOpen(true);
};

const closeItemsModal = () => {
  setSelectedOrderItems([]);
  setIsItemsModalOpen(false);
};


  const filteredOrders = allOrders.filter((order) => {
    const status = order.status

    if ( user?.role === "buyer" && status === "cancelled") {
      return false;
    }
    if (activeTab === "incoming") {
     return ["pending", "assigntocourier"].includes(status);
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
    totalRecycles: allOrders.filter((or) => or.status == "completed")?.length,
    points: userPoints?.totalPoints || 0, // Use stored points
    categories: 4,
    tier: 50,
  };

  const tabs = ["incoming", "completed", "cancelled"];
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="h-auto bg-green-50 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">
        <SocketTester/>
        <TokenDebugger/>
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
      {user?.role !== "buyer" && (
      <button
onClick={() => setIsRecyclingModalOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
      >
        <RefreshCcw size={18} />
        Return & Earn
      </button>
      )}
      
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
 <RecyclingModal
  onPointsUpdated={refreshPoints}
  modalOpen={isRecyclingModalOpen}
  closeModal={() => setIsRecyclingModalOpen(false)}
  totalPoints={userPoints?.totalPoints}
/>


        {/* Stats - Updated to show loading state for points */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox label="Total Recycles" value={stats.totalRecycles} />
          <StatBox 
            label="Points Collected" 
            value={stats.points} 
            loading={pointsLoading}
          />
<MembershipTier totalPoints={userPoints?.totalPoints} />
        </div>

        {/* Points History Section - New addition */}
       <PointsActivity userPoints={userPoints} />


        {/* Tabs */}
        <div className="flex border-b gap-6">
          {tabs.filter((tab)=>!(tab === "cancelled"&& user?.role === "buyer"))
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
    className=" rounded-xl p-4 bg-green-50 shadow-sm flex flex-col justify-between"
  >
    <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
      <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
      <span className="flex items-center gap-1 font-semibold">
        {["pending", "assigntocourier"].includes(order.status) && (
          <>
            <Truck size={16} className="text-yellow-600" />
            <span className="text-yellow-700">In Transit</span>
          </>
        )}
        {order.status === "completed" && (
          <>
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-700">Completed</span>
          </>
        )}
        {order.status === "cancelled" && (
          <>
            <XCircle size={16} className="text-red-600" />
            <span className="text-red-700 capitalize">{order.status}</span>
          </>
        )}
      </span>
    </div>

    {/* Address summary */}
    <div className="text-xs text-gray-500 mb-4">
      {order.address.street}, Bldg {order.address.building}, Floor {order.address.floor}, {order.address.area}, {order.address.city}
    </div>

    <button
      onClick={() => openItemsModal(order.items)}
      className="self-start text-sm  text-green-500 rounded-md transition"
    >
      View Details
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