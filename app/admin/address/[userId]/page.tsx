"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/shared/adminLayout";
import api from "@/lib/axios";

interface Address {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | null;
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

const AdminAddressDetailsPage = () => {
  const { addressId } = useParams();
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAddress = async () => {
    try {
      const res = await api.get(`/addresses`);
      setAddress(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [addressId]);

  return (
    <AdminLayout>
      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : !address ? (
        <p className="text-center py-10 text-gray-400">Address not found.</p>
      ) : (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
          <h2 className="text-2xl font-bold mb-4">Address Details</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div>
              <strong>User:</strong>{" "}
              {address.userId
                ? `${address.userId.name} (${address.userId.email})`
                : "Unknown"}
            </div>
            <div>
              <strong>City:</strong> {address.city}
            </div>
            <div>
              <strong>Area:</strong> {address.area}
            </div>
            <div>
              <strong>Street:</strong> {address.street}
            </div>
            <div>
              <strong>Building:</strong> {address.building}
            </div>
            <div>
              <strong>Floor:</strong> {address.floor}
            </div>
            <div>
              <strong>Apartment:</strong> {address.apartment}
            </div>
            <div>
              <strong>Landmark:</strong> {address.landmark}
            </div>
            <div>
              <strong>Notes:</strong> {address.notes}
            </div>
            <div>
              <strong>Created At:</strong>{" "}
              {new Date(address.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Updated At:</strong>{" "}
              {new Date(address.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAddressDetailsPage;
