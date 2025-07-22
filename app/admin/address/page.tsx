"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/shared/adminLayout";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";

interface Address {
  _id: string;
  userId: string;
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

const AdminAddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/adminAllAdresses");
      setAddresses(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);
  useEffect(() => {
    console.log("adresssssssssssssssssssssssssssssss");
    console.log(addresses);
  }, [addresses]);

  const columns = [
    { key: "userId", label: "User ID" },
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
            {address.notes?.trim().length > 0 ? address.notes : "Not Exist"}
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
      ) : addresses.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No addresses found.</p>
      ) : (
        <DynamicTable
          data={addresses}
          columns={columns}
          title="Addresses"
          itemsPerPage={5}
          showAddButton={false}
        />
      )}
    </AdminLayout>
  );
};

export default AdminAddressesPage;
