'use client';

import { useContext, useEffect, useState } from 'react';
import { UserAuthContext } from '@/context/AuthFormContext';
import { Avatar } from 'flowbite-react';
import api from '@/services/api';
import { Order } from '@/components/Types/orders.type';

export default function ProfilePage() {
  const { user } = useContext(UserAuthContext);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  // const address = JSON.parse(localStorage.getItem('userAddress'))
  
  const getAllOrders = async (): Promise<Order[]> => {
    try {
      const res = await api.get<Order[]>('/orders');
      setAllOrders(res.data);
      console.log(res);
      
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  const stats = {
    totalRecycles: allOrders?.length,
    points: 620,
    categories: 4,
    tier: 50,
  };

  const categories = ['Plastic', 'Paper', 'Glass', 'Metal'];

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-4">
            <Avatar img='https://api.dicebear.com/7.x/bottts/svg?seed=user123' rounded size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-green-800">{user?.name || 'John Doe'}</h2>
              <p className="text-sm text-gray-500">{user?.email} — Eco-Warrior</p>
              <p className="text-xs text-gray-400">Cairo, July 2025</p>
            </div>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700">
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <StatBox label="Total Recycles" value={stats.totalRecycles} />
          <StatBox label="Points Collected" value={stats.points} />
          <StatBox label="Categories Followed" value={stats.categories} />
          <StatBox label="Membership Tier" value={stats.tier} />
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-3">Recent Recycling Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allOrders.map((order, index) => (
  <div key={order._id || index} className="border rounded-xl p-4 bg-green-50 shadow-sm mb-4">
    <p className="text-sm text-gray-500 mb-1">
      Date: {new Date(order.createdAt).toLocaleDateString()}
    </p>
    <p className="text-sm text-green-700 font-semibold mb-2">Status: {order.status}</p>

    {/* Map over items */}
    {order.items.map((item, i) => (
      <div key={i} className="text-sm text-gray-700 ml-4 mb-1">
        • {item.name} — {item.quantity}kg — +{item.totalPoints} pts
      </div>
    ))}

    {/* Display Address */}
    <div className="text-xs text-gray-500 mt-2 ml-1">
      {order.address.street}, Bldg {order.address.building}, Floor {order.address.floor}, {order.address.area}, {order.address.city}
    </div>
  </div>
))}

          </div>
        </div>

  

        {/* Drop-off & Settings */}
        <div className="grid md:grid-cols-2 gap-6">
    

          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Goals and Badges</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full w-[60%]"></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Recycle 15 kg plastic — 60% completed</p>
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
