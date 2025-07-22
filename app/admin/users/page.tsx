"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AdminLayout from "@/components/shared/adminLayout";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";
import { User } from "@/components/Types/Auser.type";
import EditUserRoleModal from "./EditUserRoleModal";
import FilterDrawer, {
  FilterConfig,
  FilterOption,
} from "@/components/shared/FilterSection";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const router = useRouter();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.results || res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkk");
    console.log(users);
  }, [users]);

  // Function to get the rendered value for any column
  const getRenderedValue = (user: User, key: string): string => {
    console.log("inside render Value");
    console.log(user);
    switch (key) {
      case "role":
        // Capitalize the first letter to match rendering
        return user.role.toLowerCase(); // ✅ match raw filter values

      case "status":
        // Replicate the status rendering logic
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const isOnline =
          !!user.lastActiveAt && new Date(user.lastActiveAt) > fiveMinutesAgo;
        return isOnline ? "online" : "offline";

      case "phoneNumber":
        // Replicate the phone number rendering
        return user.phoneNumber.padStart(11, "0").substring(0, 3);

      default:
        // For other fields, use the raw value
        return user[key as keyof User]?.toString() || "";
    }
  };

  // Filter configuration matching rendered values
  const filtersConfig: FilterConfig[] = [
    {
      name: "role",
      title: "Role",
      type: "checkbox",
      options: ["admin", "buyer", "customer", "celivery"].map((value) => ({
        label: value,
        value,
      })),
    },
    {
      name: "status",
      title: "Status",
      type: "checkbox",
      options: [
        { label: "Online", value: "online" },
        { label: "Offline", value: "offline" },
      ],
    },
    {
      name: "phoneNumber",
      title: "Phone Prefix",
      type: "checkbox",
      options: ["010", "011", "012", "015"].map((prefix) => ({
        label: prefix,
        value: prefix,
      })),
    },
  ];

  const filteredData = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return users;

    return users.filter((user) => {
      return Object.entries(filters).every(([filterKey, filterValues]) => {
        if (!filterValues || filterValues.length === 0) return true;

        const renderedValue = getRenderedValue(user, filterKey).toLowerCase();
        const normalizedFilterValues = filterValues.map((v) => v.toLowerCase());
        console.log(`render value = ${renderedValue}`);
        console.log(`rnormalizedFilterValues = ${normalizedFilterValues}`);

        if (filterKey === "phoneNumber") {
          return normalizedFilterValues.some((prefix) =>
            renderedValue.startsWith(prefix)
          );
        }

        return normalizedFilterValues.includes(renderedValue);
      });
    });
  }, [users, filters]);

  // User actions
  const handleDelete = async (user: User) => {
    try {
      await api.delete(`/users/${user._id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (id: string, newRole: User["role"]) => {
    try {
      await api.patch(`/users/${id}`, { role: newRole });
      toast.success("Role updated!");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleViewDetails = (user: User) => {
    router.push(`/admin/users/${user._id}`);
  };

  // Columns definition
  const columns = [
    {
      key: "imgUrl",
      label: "",
      type: "image",
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (user: User) => <span>{user.phoneNumber.padStart(11, "0")}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (user: User) => (
        <button
          onClick={() => handleChangeRole(user)}
          className="hover:underline text-green-600"
        >
          {user.role}
        </button>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,

      render: (user: User) => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const isOnline =
          !!user.lastActiveAt && new Date(user.lastActiveAt) > fiveMinutesAgo;
        return (
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              isOnline
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
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
      ) : users.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No users found.</p>
      ) : (
        <>
          <div className="mb-4">
            <FilterDrawer
              filtersConfig={filtersConfig}
              activeFilters={filters}
              onChangeFilters={(updated) => {
                setFilters(updated);
              }}
            />
          </div>

          <DynamicTable
            data={filteredData}
            columns={columns}
            title="Users"
            itemsPerPage={5}
            showSearch={true} // Using FilterDrawer for search instead
            showFilter={true} // Using FilterDrawer instead
            addButtonText="Add User"
            showAddButton={false}
            onDelete={handleDelete}
            onEdit={handleChangeRole}
            onView={handleViewDetails}
            onExternalFiltersChange={(updated) => setFilters(updated)} // ✅ Needed
            filtersConfig={filtersConfig} // ✅ Needed
            externalFilters={filters}
            getRenderedValue={getRenderedValue}
          />
          <div className="p-4 bg-gray-100 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div>Active Filters: {JSON.stringify(filters)}</div>
            <div>Filtered Count: {filteredData.length}</div>
            {filteredData.slice(0, 3).map((user) => (
              <div key={user._id}>
                {user.name} - Role: {getRenderedValue(user, "role")}, Status:{" "}
                {getRenderedValue(user, "status")}, Phone:{" "}
                {getRenderedValue(user, "phoneNumber")}
              </div>
            ))}
          </div>
        </>
      )}

      <EditUserRoleModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
    </AdminLayout>
  );
};

export default AdminUsersPage;
