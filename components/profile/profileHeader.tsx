// components/profile/ProfileHeader.tsx
import React, { memo } from "react";
import { Avatar } from "flowbite-react";
import { RefreshCcw, Pencil } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import LocationDate from "./locationDate";

interface ProfileHeaderProps {
  user: any;
  tier: any;
  onOpenRecyclingModal: () => void;
  t: (key: string) => string;
}

const ProfileHeader = memo(function ProfileHeader({
  user,
  tier,
  onOpenRecyclingModal,
  t
}: ProfileHeaderProps) {
  const { convertNumber } = useLanguage();

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center space-x-4">
        <div className="relative inline-block">
          <Avatar
            img={user?.imgUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=user123"}
            rounded
            size="lg"
          />
          
          {user.role === "customer" && tier && (
            <div className={`absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4
              size-10 rounded-full flex items-center justify-center
              text-2xl font-bold shadow-md border-2 animate-spin-slow hover:[animation-play-state:paused bg-base-100 border-none`}>
              <tier.badge className="text-primary" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800">
            {user?.name || "John Doe"}
          </h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500">
            {convertNumber(user?.phoneNumber?.padStart(11, "0"))}
          </p>
          <LocationDate />
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {user?.role !== "buyer" && (
          <button
            onClick={onOpenRecyclingModal}
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
});

export default ProfileHeader;