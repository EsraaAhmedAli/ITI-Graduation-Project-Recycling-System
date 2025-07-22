// /pages/admin/address/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/shared/adminLayout";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";
import Image from "next/image";

interface Address {
  _id: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  imgUrl: string;
}

const AddressDetailPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserAndAddresses = async () => {
      try {
        const [userRes, addressRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/addresses/${id}`),
        ]);
        setUser(userRes.data);
        setAddresses(addressRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserAndAddresses();
  }, [id]);

  const columns = [
    { key: "city", label: "City" },
    { key: "area", label: "Area" },
    { key: "street", label: "Street" },
    { key: "building", label: "Building" },
    { key: "floor", label: "Floor" },
    { key: "apartment", label: "Apartment" },
    { key: "landmark", label: "Landmark" },
    {
      key: "notes",
      label: "Notes",
      render: (address: Address) => {
        return (
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold bg-primary}`}
          >
            {address.notes && "Not Exist"}
          </span>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : (
        <>
          {/* User Header */}
          {user && (
            <div className="flex items-center gap-4 p-6 border-b border-gray-200 bg-white rounded shadow-sm">
              <Image
                src={user.imgUrl}
                alt={user.name}
                width={64}
                height={64}
                className="rounded-full object-cover border border-gray-300"
              />
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          )}

          {/* Address Table */}
          <DynamicTable
            data={addresses}
            columns={columns}
            title="User Addresses"
            itemsPerPage={5}
            showAddButton={false}
            showActions={false}
          />
        </>
      )}
    </AdminLayout>
  );
};

export default AddressDetailPage;
