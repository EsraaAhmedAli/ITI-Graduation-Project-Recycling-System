"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";
import { FilterConfig } from "@/components/Types/filter.type";

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
  user?: {
    // Add optional user object
    name: string;
    imgUrl?: string;
  };
}

const AdminAddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const fetchAddresses = async () => {
    try {
      const [addressesRes, usersRes] = await Promise.all([
        api.get("/adminAllAdresses"),
        api.get("/users"), // Assuming this endpoint returns all users
      ]);

      // Map users to addresses
      const usersMap = new Map(usersRes.data.map((user) => [user._id, user]));
      const enhancedAddresses = addressesRes.data.map((address) => ({
        ...address,
        user: usersMap.get(address.userId),
      }));

      setAddresses(enhancedAddresses);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    fetchAddresses();
  }, []);
  useEffect(() => {
    console.log("adresssssssssssssssssssssssssssssss");
    console.log(addresses);
  }, [addresses]);
  const getRenderedValue = (address: Address, key: string): string => {
    switch (key) {
      case "city":
        return address.city.toLowerCase();
      case "area":
        return address.area.toLowerCase();
      case "user":
        return address.user?.name.toLowerCase() || "unknown";
      default:
        return address[key as keyof Address]?.toString()?.toLowerCase() || "";
    }
  };

  // Filter configuration
  const filtersConfig: FilterConfig[] = [
    {
      name: "city",
      title: "City",
      type: "checkbox",
      options: [
        // You might want to dynamically generate these from your data
        { label: "Cairo", value: "cairo" },
        { label: "Alexandria", value: "alexandria" },
        // Add more cities as needed
      ],
    },
    {
      name: "area",
      title: "Area",
      type: "checkbox",
      options: [
        { label: "Downtown", value: "downtown" },
        { label: "Suburb", value: "suburb" },
        // Add more areas as needed
      ],
    },
    {
      name: "user",
      title: "User Status",
      type: "checkbox",
      options: [
        { label: "Has User", value: "has_user" },
        { label: "Unknown User", value: "unknown" },
      ],
    },
  ];

  // Apply filters
  const filteredData = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return addresses;

    return addresses.filter((address) => {
      return Object.entries(filters).every(([filterKey, filterValues]) => {
        if (!filterValues || filterValues.length === 0) return true;

        const renderedValue = getRenderedValue(address, filterKey);
        const normalizedFilterValues = filterValues.map((v) => v.toLowerCase());

        // Special handling for user filter
        if (filterKey === "user") {
          if (filterValues.includes("has_user")) {
            return !!address.user;
          }
          if (filterValues.includes("unknown")) {
            return !address.user;
          }
        }

        return normalizedFilterValues.includes(renderedValue);
      });
    });
  }, [addresses, filters]);

  // Columns definition
  const columns = [
    {
      key: "user",
      label: "User",
      render: (address: Address) => {
        if (!address.user) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">?</span>
              </div>
              <span>Unknown</span>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {address.user.imgUrl ? (
              <Image
                width={32}
                height={32}
                src={address.user.imgUrl}
                alt={address.user.name}
                className="rounded-full object-cover w-8 h-8"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {address.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span>{address.user.name}</span>
          </div>
        );
      },
    },
    { key: "city", label: "City", sortable: true },
    { key: "area", label: "Area", sortable: true },
    { key: "street", label: "Street" },
    { key: "building", label: "Building" },
    { key: "floor", label: "Floor" },
    { key: "apartment", label: "Apartment" },
    { key: "landmark", label: "Landmark" },
    {
      key: "notes",
      label: "Notes",
      render: (address: Address) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            address.notes?.trim()
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {address.notes?.trim() || "No notes"}
        </span>
      ),
    },
  ];

  return (
    <>
      {loading ? (
        <p className="text-center py-10 text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : addresses.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No addresses found.</p>
      ) : (
        <DynamicTable
          data={filteredData}
          columns={columns}
          title="Addresses"
          itemsPerPage={5}
          showAddButton={false}
          onExternalFiltersChange={setFilters}
          filtersConfig={filtersConfig}
          externalFilters={filters}
          getRenderedValue={getRenderedValue}
          // onViewDetails={handleDetails}
        />
      )}
    </>
  );
};

export default AdminAddressesPage;
