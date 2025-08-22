"use client";
import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import DynamicTable from "@/components/shared/dashboardTable";
import api from "@/lib/axios";
import { User } from "@/components/Types/Auser.type";
import EditUserRoleModal from "./EditUserRoleModal";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useValueDebounce } from "@/hooks/useValueDebounce";
import { Loader } from '@/components/common'

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const debouncedSearchTerm = useValueDebounce(searchTerm, 500); // 500ms delay


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

  const fetchUsers = async (page = 1, limit = 5, filters = {}, search = '') => {
    const params: any = { page, limit };
    
    // Add filter params
    if (filters.role?.length) params.role = filters.role.join(',');
    if (filters.status?.length) params.status = filters.status.join(',');
    if (filters.prefix?.length) params.prefix = filters.prefix.join(',');
    
    // Add search param - make sure this matches what your backend expects
    if (search && search.trim()) {
      params.search = search.trim();
    }
    
    const { data } = await api.get('/users', { params });
    return data;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const activeFilters = useMemo(() => ({
    role: userFilters.find(f => f.name === 'role')?.active || [],
    status: userFilters.find(f => f.name === 'status')?.active || [],
    prefix: userFilters.find(f => f.name === 'prefix')?.active || []
  }), [userFilters]);

  const { data, isLoading, error } = useQuery({
queryKey: ['users', currentPage, itemsPerPage, activeFilters, debouncedSearchTerm],

    queryFn: () => fetchUsers(currentPage, itemsPerPage, activeFilters, debouncedSearchTerm)
  });

  const users = data?.data || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleDelete = async (user: User) => {
    try {
      await api.delete(`/users/${user._id}`);
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to update role ${error}`);
    }
  };

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
  src={user.attachments.deliveryImage || '/default-avatar.png'}
  alt={user.name}
  className="rounded-full object-cover"
/>
          );
        }
        return (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold uppercase">
            {user.name?.charAt(0) || "?"}
          </div>
        );
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
        <Loader />
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error.message}</p>
      ) : users?.length === 0 ? (
        <p className="text-center py-10 text-gray-400">No users found.</p>
      ) : (
        <DynamicTable
          data={users}
          columns={columns}
          title="Users"
          itemsPerPage={itemsPerPage}
          searchTerm={searchTerm} // Make sure this is passed
          onSearchChange={handleSearchChange}
          addButtonText="Add User"
          showFilter={true}
          showAddButton={false}
          showPagination={true}
          onDelete={handleDelete}
          onEdit={handleChangeRole}
          filtersConfig={userFilters}
          externalFilters={activeFilters}
          onExternalFiltersChange={(updated: any) => {
            setUserFilters((prev) =>
              prev.map((f) => ({
                ...f,
                active: updated[f.name] || [],
              }))
            );
            setCurrentPage(1);
          }}
          activeFiltersCount={userFilters.reduce(
            (count, f) => count + (f.active?.length || 0),
            0
          )}
          paginationInfo={{
            currentPage: data?.pagination?.currentPage || currentPage,
            totalPages: data?.pagination?.totalPages || 1,
            totalItems: data?.pagination?.totalUsers || 0,
            itemsPerPage: itemsPerPage,
            hasNextPage: data?.pagination?.hasNextPage || false,
            hasPrevPage: data?.pagination?.hasPrevPage || false,
          }}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          disableClientSideSearch={true} // This should be true since you're handling search server-side
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