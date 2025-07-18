'use client';

import { useEffect, useState } from 'react';
import { useUserAuth } from '@/context/AuthFormContext';
import { Avatar } from 'flowbite-react';
import { Order, OrdersResponse } from '@/components/Types/orders.type';
import Loader from '@/components/common/loader';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ProtectedRoute } from '@/lib/userProtectedRoute';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState<'incoming' | 'past'>('incoming');

  const incomingOrders = allOrders.filter(
    (order) => order.status !== 'Completed' && order.status !== 'Cancelled'
  );
  const pastOrders = allOrders.filter(
    (order) => order.status === 'Completed' || order.status === 'Cancelled'
  );

  const getAllOrders = async (): Promise<Order[]> => {
    try {
      setLoading(true);
      const res = await api.get<OrdersResponse>('/orders');
      setAllOrders(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirm = await Swal.fire({
      title: 'Cancel this order?',
      text: 'You will not be able to undo this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
    });

    if (confirm.isConfirmed) {
      try {
        await api.patch(`/orders/${orderId}/cancel`);
        await getAllOrders();
        Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
      } catch (error) {
        console.error('Cancel failed', error);
        Swal.fire('Error', 'Could not cancel the order.', 'error');
      }
    }
  };

  useEffect(() => {
    if (user && token) {
      getAllOrders();
    }
  }, [user, token]);

  const totalPoints = allOrders.reduce((acc, order) => {
    return (
      acc +
      order.items.reduce((itemAcc, item) => itemAcc + (item.points ?? 0), 0)
    );
  }, 0);

  const stats = {
    totalRecycles: allOrders?.length,
    points: totalPoints,
    categories: 4,
    tier: 50,
  };

  const tabOrders = activeTab === 'incoming' ? incomingOrders : pastOrders;

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-4">
            <Avatar img="https://api.dicebear.com/7.x/bottts/svg?seed=user123" rounded size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-green-800">{user?.fullName || 'John Doe'}</h2>
              <p className="text-sm text-gray-500">{user?.email} — Eco-Warrior</p>
              <p className="text-xs text-gray-400">Cairo, July 2025</p>
            </div>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700">
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <StatBox label="Total Recycles" value={stats.totalRecycles} />
          <StatBox label="Points Collected" value={stats.points} />
          <StatBox label="Membership Tier" value={stats.tier} />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-4 space-x-4">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-full font-medium ${
              activeTab === 'incoming'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700'
            }`}
          >
            Incoming Orders
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-full font-medium ${
              activeTab === 'past'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700'
            }`}
          >
            Past Orders
          </button>
        </div>

        {/* Orders */}
        {loading ? (
          <Loader title="your orders" />
        ) : tabOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No {activeTab === 'incoming' ? 'incoming' : 'past'} orders found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tabOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border rounded-2xl p-4 bg-white shadow hover:shadow-md"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-700 font-semibold">Status: {order.status}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-2 border-b last:border-none">
                    <img
                      src={item.image}
                      alt={item.itemName}
                      className="w-14 h-14 rounded object-cover"
                    />
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-green-800">{item.itemName}</span>
                      <span className="text-gray-600">
                        Qty: {item.quantity} {item.measurement_unit === 1 ? 'kg' : 'pcs'}
                      </span>
                      <span className="text-gray-600">Points: {item.points}</span>
                      <span className="text-gray-600">Price: {item.price} EGP</span>
                    </div>
                  </div>
                ))}

                <div className="text-xs text-gray-500 mt-2">
                  {order.address.street}, Bldg {order.address.building}, Floor {order.address.floor},{' '}
                  {order.address.area}, {order.address.city}
                </div>

                {/* Cancel button only for incoming + not InProgress */}
                {activeTab === 'incoming' && order.status !== 'InProgress' && order.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleCancelOrder(order._id!)}
                    className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm"
                  >
                    Cancel Order
                  </button>
                )}
              </motion.div>
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
