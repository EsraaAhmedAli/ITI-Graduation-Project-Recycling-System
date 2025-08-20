"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";
import { User } from "@/components/Types/Auser.type";
import EditUserRoleModal from "./EditUserRoleModal";
import Image from "next/image";
import { useUsers } from "@/hooks/useGetUsers";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/common/loader";
import { useLanguage } from "@/context/LanguageContext";


const AdminUsersPage = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useUsers();
  const [ setIsFilterOpen] = useState(false);
  const [userFilters, setUserFilters] = useState([
    {
      name: "role",
      title: "Role",
      type: "multi-select" as const,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Customer", value: "customer" },
        { label: "Buyer", value: "buyer" },
        { label: "Delivery", value: "delivery" },
      ],
      active: [],
    },
    {
      name: "status",
      title: "Status",
      type: "multi-select" as const,
      options: [
        { label: "Online", value: "online" },
        { label: "Offline", value: "offline" },
      ],
      active: [],
    },
    {
      name: "prefix",
      title: "Phone Prefix",
      type: "multi-select" as const,
      options: [
        { label: "010", value: "010" },
        { label: "011", value: "011" },
        { label: "012", value: "012" },
        { label: "015", value: "015" },
      ],
      active: [],
    },
  ]);



  const filteredUsers = users?.filter((user) => {
    // === Role Filter ===
    const roleFilterActive =
      userFilters.find((f) => f.name === "role")?.active || [];
    const roleFilter =
      roleFilterActive.length === 0 || roleFilterActive.includes(user.role);

    // === Status Filter ===
    const statusFilterActive =
      userFilters.find((f) => f.name === "status")?.active || [];

    const lastActive = new Date(user.lastActiveAt);
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isOnline = Date.now() - lastActive.getTime() < FIVE_MINUTES;
    const status = isOnline ? "online" : "offline";

    const statusFilter =
      statusFilterActive.length === 0 || statusFilterActive.includes(status);

    // === Phone Prefix Filter ===
    const prefixFilterActive =
      userFilters.find((f) => f.name === "prefix")?.active || [];
    const userPrefix = user.phoneNumber?.slice(0, 3);
    const prefixFilter =
      prefixFilterActive.length === 0 ||
      prefixFilterActive.includes(userPrefix);

    return roleFilter && statusFilter && prefixFilter;
  });

  // const fetchUsers = async () => {
  //   try {
  //     const res = await api.get("/users"); // Your admin-protected endpoint
  //     console.log(res.data.data);

  //     setUsers(res.data.data || res.data); // Adjust if paginated
  //   } catch (err: any) {
  //     setError(err?.response?.data?.message || "Failed to load users");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchUsers();
  // }, []);
  // useEffect(() => {
  // }, [users]);

  const handleDelete = async (user: User) => {
    try {
      await api.delete(`/users/${user._id}`);
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch {
      toast.error("Delete failed");
    }
  };
const{t}=useLanguage()
  // const handleChangeRole = async (user: User) => {
  //   const newRole = prompt(
  //     `Enter new role for ${user.name} (admin, customer, buyer, delivery):`,
  //     user.role
  //   );
  //   if (
  //     !newRole ||
  //     !["admin", "customer", "buyer", "delivery"].includes(newRole)
  //   ) {
  //     return toast.error("Invalid role");
  //   }

  //   try {
  //     await api.put(`/users/${user._id}`, { role: newRole });
  //     toast.success(`Role updated to ${newRole}`);
  //     fetchUsers();
  //   } catch {
  //     toast.error("Failed to update role");
  //   }
  // };

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

      // 🔁 Refetch the users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to update role ${error}`);
    }
  };
  // Inside return:

  const columns = [
    {
      key: "imgUrl",
      label: "",
      render: (user: User) => {
        if (user.imgUrl) {
          return (
            <Image
              width={50}
              height={50}
              src={user.imgUrl}
              alt={user.name}
              className=" rounded-full object-fit"
            />
          );
        } else if (user.role == "delivery") {
          return (
            <Image
              width={30}
              height={30}
              src={user.attachments.deliveryImage}
              alt={user.name}
              className=" rounded-full object-cover"
            />
          );
        }
        {
          return (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold uppercase">
              {user.name?.charAt(0) || "?"}
            </div>
          );
        }
      },
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
        <button onClick={() => handleChangeRole(user)}>{user.role}</button>
      ),
    },

    {
      key: "status",
      label: "Status",
      type: "status",
      render: (user: User) => {
        const lastActive = new Date(user?.lastActiveAt || 0);
        const FIVE_MINUTES = 5 * 60 * 1000;

        const isOnline = Date.now() - lastActive.getTime() < FIVE_MINUTES;

        return (
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              isOnline
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}>
            {isOnline ? "Online" : "Offline"}
          </span>
        );
      },
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loader title={t('loaders.users')}/>
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : users?.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No users found.</p>
      ) : (
        <DynamicTable
          data={filteredUsers}
          columns={columns}
          title="Users"
          itemsPerPage={5}
          addButtonText="Add User"
          showFilter={true} // ✅ add this!
          showAddButton={false}
          onDelete={handleDelete}
          onEdit={handleChangeRole}
          filtersConfig={userFilters} // ✅ pass filtersConfig
          externalFilters={Object.fromEntries(
            userFilters.map((f) => [f.name, f.active])
          )} // ✅ convert your filter shape
          onExternalFiltersChange={(updated) => {
            setUserFilters((prev) =>
              prev.map((f) => ({
                ...f,
                active: updated[f.name] || [],
              }))
            );
          }}
          setShowFilters={setIsFilterOpen}
          activeFiltersCount={userFilters.reduce(
            (count, f) => count + (f.active?.length || 0),
            0
          )}
          
        />
      )}

      <EditUserRoleModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
    </>
  );
};

export default AdminUsersPage;
