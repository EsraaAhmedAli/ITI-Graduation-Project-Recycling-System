"use client";
import { rewardLevels } from "@/constants/rewardsTiers"; // your file path
import { Avatar } from "flowbite-react"; // assuming you're using Flowbite
import { RefreshCcw, Pencil } from "lucide-react";
import Link from "next/link";

const Header = ({ user, t, setIsRecyclingModalOpen }) => {
  // 1️⃣ Find the user’s reward tier based on points
  const userTier = rewardLevels.find(
    (tier) => user?.points >= tier.minPoints && user?.points <= tier.maxPoints
  );

  return (
    <div className="flex items-center justify-between flex-wrap">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <Avatar
          img={
            user?.imgUrl ||
            "https://api.dicebear.com/7.x/bottts/svg?seed=user123"
          }
          rounded
          size="lg"
        />

        {/* User Info */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-green-800">
              {user?.name || "John Doe"}
            </h2>

            {/* Tier Badge */}
            {userTier && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${userTier.color}`}
              >
                <userTier.icon size={14} />
                {userTier.name}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500">
            {user?.phoneNumber?.padStart(11, "0")}
          </p>
          <p className="text-xs text-gray-400">Cairo, July 2025</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center mt-4">
        {user?.role !== "buyer" && (
          <button
            onClick={() => setIsRecyclingModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
          >
            <RefreshCcw size={18} />
            {t("profile.returnEarn")}
          </button>
        )}

        <Link
          href="/editprofile"
          className="flex items-center gap-2 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-colors duration-200"
        >
          <Pencil size={16} />
          {t("profile.editProfile")}
        </Link>
      </div>
    </div>
  );
};

export default Header;
