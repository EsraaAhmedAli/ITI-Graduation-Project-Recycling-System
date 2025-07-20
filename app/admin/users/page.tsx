"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AdminLayout from "@/components/shared/adminLayout";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";
import { User } from "@/components/Types/Auser.type";
import EditUserRoleModal from "./EditUserRoleModal";
import Image from "next/image";
import Loader from "@/components/common/loader";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users"); // Your admin-protected endpoint
      setUsers(res.data.results || res.data); // Adjust if paginated
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
    console.log(users);
  }, [users]);

  const handleDelete = async (user: User) => {
    try {
      await api.delete(`/users/${user._id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    }
  };

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

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update role");
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
        width={30}
        height={30}
          src={user.imgUrl}
          alt={user.name}
          className=" rounded-full object-cover"
        />
      );
    } else {
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
        const isOnline = Math.random() < 0.5; // Mock for now
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
        <Loader title="users"/>
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No users found.</p>
      ) : (
        <DynamicTable
          data={users}
          columns={columns}
          title="Users"
          itemsPerPage={8}
          addButtonText="Add User"
          showAddButton={false}
          onDelete={handleDelete}
          onEdit={handleChangeRole}
        />
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
