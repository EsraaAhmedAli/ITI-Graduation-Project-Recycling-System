import React, { useEffect, useState } from "react";
import { User } from "@/components/Types/Auser.type";

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newRole: User["role"]) => void;
}

const roles: User["role"][] = ["admin", "customer", "buyer", "delivery"];

const EditUserRoleModal: React.FC<Props> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedRole, setSelectedRole] = useState<User["role"]>("customer");

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  const handleSave = () => {
    if (user && selectedRole !== user.role) {
      onSave(user._id, selectedRole);
    }
  };

  if (!user) return null;

  return (
    <div
      id="edit-role-modal"
      tabIndex={-1}
      aria-hidden={!isOpen}
      className={`${
        isOpen ? "fixed" : "hidden"
      } inset-0 z-50 flex items-center justify-center  bg-opacity-50`}
    >
      <div className="relative w-full max-w-md p-4">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 rounded-t dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Role for {user.name}
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Modal body */}
          <div className="p-4">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
            >
              Select Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as User["role"])}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Modal footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              disabled={selectedRole === user.role}
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                selectedRole !== user.role
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-300 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserRoleModal;
