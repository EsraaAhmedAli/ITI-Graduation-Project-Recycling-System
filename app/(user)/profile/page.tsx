"use client";
import { Order } from "@/components/Types/orders.type";
import api from "@/services/api";
import { Avatar } from "flowbite-react";
import { useEffect, useState } from "react";

export default function RecyclingHistory() {
  const[allOrders,setAllOrders]=useState<Order[]>([])

const getAllOrders = async (): Promise<Order[]> => {
  try {
    const res = await api.get<Order[]>('/orders');
    setAllOrders(res.data);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
  useEffect(()=>{
    getAllOrders()
  },[])
  const orders = [
    { date: "June 15, 2024", points: 500, status: "Completed", address: "123 Oak Street, Anytown" },
    { date: "May 20, 2024", points: 450, status: "Completed", address: "123 Oak Street, Anytown" },
    { date: "April 25, 2024", points: 400, status: "Completed", address: "123 Oak Street, Anytown" },
  ];

  return (
    <div className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-6 grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1 flex flex-col items-center text-center">
          <Avatar img="/user.jpg" rounded size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold text-green-800">user Name</h2>
          <p className="text-sm text-gray-500 mb-4">user@email.com</p>

          <div className="bg-green-100 rounded-xl p-4 w-full shadow-sm">
            <p className="text-xs text-gray-600">E-Wallet Balance</p>
            <p className="text-xl font-bold text-green-700">$125.50</p>
            <button className="mt-3 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
              Withdraw
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="md:col-span-3">
          <h2 className="text-2xl font-bold mb-4 text-green-800">Recycling History</h2>
          <div className="overflow-auto rounded-lg shadow border border-green-100">
            <table className="min-w-full text-sm">
              <thead className="bg-green-100 text-green-800">
                <tr>
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Points</th>
                  <th className="py-3 px-6 text-left">Pickup Address</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-3 px-6">{item.date}</td>
                    <td className="py-3 px-6">
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">{item.points}</td>
                    <td className="py-3 px-6">{item.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
