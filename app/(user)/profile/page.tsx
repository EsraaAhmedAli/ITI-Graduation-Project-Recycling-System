'use client';

import { useEffect, useState } from 'react';
import { useUserAuth } from '@/context/AuthFormContext'; // Use the hook instead of useContext
import { Avatar } from 'flowbite-react';
import { Order, OrdersResponse } from '@/components/Types/orders.type';
import Loader from '@/components/common/loader';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ProtectedRoute } from '@/lib/userProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, token, isLoading: authLoading } = useUserAuth(); // Use the hook and check both user and token
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

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

  const totalPoints = allOrders.reduce((acc, order) => {
    return (
      acc +
      order.items.reduce((itemAcc, item) => itemAcc + (item.points ?? 0), 0)
    );
  }, 0);

  useEffect(() => {
    // Only fetch orders if both user and token exist
    if (user && token) {
      getAllOrders();
    }
  }, [user, token]);

  // The ProtectedRoute will handle the loading and redirect logic
  // So we don't need to check authLoading or !user here anymore
  
  const stats = {
    totalRecycles: allOrders?.length,
    points: totalPoints,
    categories: 4,
    tier: 50,
  };

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

        {/* Recent Activity */}
        {loading ? (
          <Loader title={'your activity'} />
        ) : allOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            You don't have any recycling activity yet. Start your first recycle today!
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-3">Recent Recycling Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allOrders.map((order, index) => (
                <div
                  key={order._id || index}
                  className="border rounded-xl p-4 bg-green-50 shadow-sm mb-4 space-y-2"
                >
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-green-700 font-semibold">Status: {order.status}</p>

                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.itemName}
                        className="w-14 h-14 rounded object-cover border"
                      />
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold text-green-800">{item.itemName}</span>
                        <span className="text-gray-600">
                          Quantity: {item.quantity}{' '}
                          {item.measurement_unit === 1 ? 'kg' : 'pcs'}
                        </span>
                        <span className="text-gray-600">Points: {item.points}</span>
                        <span className="text-gray-600">Price: {item.price} EGP</span>
                      </div>
                    </div>
                  ))}

                  <div className="text-xs text-gray-500 mt-2 ml-1">
                    {order.address.street}, Bldg {order.address.building}, Floor{' '}
                    {order.address.floor}, {order.address.area}, {order.address.city}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals & Settings */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-3">Goals and Badges</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full w-[60%]"></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Recycle 15 kg plastic — 60% completed
            </p>
          </div>
        </div>
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