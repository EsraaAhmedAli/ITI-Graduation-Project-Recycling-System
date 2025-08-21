import React, { memo, useMemo, useState, useCallback } from "react";
import Image from "next/image"; // Using Next.js Image for optimization
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

// Pre-defined constants
const DEFAULT_NAME = "John Doe";

// Helper function to get user initials
const getUserInitials = (name: string): string => {
  if (!name) return "JD"; // Default initials
  
  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length === 1) {
    // If only one name, use first two characters
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  // Use first letter of first name and first letter of last name
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Memoized TierBadge component
const TierBadge = memo(({ tier }: { tier: any }) => (
  <div
    className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4
               size-10 rounded-full flex items-center justify-center
               text-2xl font-bold shadow-md border-2 animate-spin-slow 
               hover:[animation-play-state:paused] bg-base-100 border-none"
  >
    <tier.badge className="text-primary" />
  </div>
));
TierBadge.displayName = "TierBadge";

// Memoized Initials component for fallback
const InitialsAvatar = memo(
  ({ initials, size = 64 }: { initials: string; size?: number }) => (
    <div
      className="rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold shadow-md"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  )
);
InitialsAvatar.displayName = "InitialsAvatar";

// Memoized Avatar component with initials fallback
const OptimizedAvatar = memo(
  ({
    imgUrl,
    alt,
    userName,
    size = 64,
  }: {
    imgUrl: string;
    alt: string;
    userName: string;
    size?: number;
  }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleError = useCallback(() => {
      setImageError(true);
    }, []);

    const handleLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const userInitials = useMemo(() => getUserInitials(userName), [userName]);

    // If no image URL is provided or image failed to load, show initials
    if (!imgUrl || imageError) {
      return (
        <div className="relative">
          <InitialsAvatar initials={userInitials} size={size} />
        </div>
      );
    }

    return (
      <div className="relative">
        <div
          className={`relative rounded-full overflow-hidden ${
            !imageLoaded ? "bg-gray-200 animate-pulse" : ""
          }`}
        >
          <Image
            src={imgUrl}
            alt={alt}
            width={size}
            height={size}
            className="rounded-full object-cover transition-opacity duration-300"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            onError={handleError}
            onLoad={handleLoad}
            loading="lazy" // Lazy load below-fold avatars
            priority={false} // Don't prioritize avatar images
          />
          {/* Show initials while image is loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <InitialsAvatar initials={userInitials} size={size} />
            </div>
          )}
        </div>
      </div>
    );
  }
);
OptimizedAvatar.displayName = "OptimizedAvatar";

const ProfileHeader = memo(
  function ProfileHeader({
    user,
    tier,
    onOpenRecyclingModal,
    t,
  }: ProfileHeaderProps) {
    const { convertNumber } = useLanguage();

    // Memoize all derived values
    const {
      formattedPhoneNumber,
      userImage,
      userName,
      userEmail,
      showTierBadge,
      isNotBuyer,
    } = useMemo(() => {
      const phoneNumber = user?.phoneNumber;
      const formattedPhoneNumber = phoneNumber
        ? convertNumber(phoneNumber.padStart(11, "0"))
        : "";

      return {
        formattedPhoneNumber,
        userImage: user?.imgUrl, // Remove default fallback here
        userName: user?.name || DEFAULT_NAME,
        userEmail: user?.email,
        showTierBadge: user?.role === "customer" && tier,
        isNotBuyer: user?.role !== "buyer",
      };
    }, [user, tier, convertNumber]);

    // Memoize button handler
    const handleRecyclingClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenRecyclingModal();
      },
      [onOpenRecyclingModal]
    );

    return (
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative inline-block">
            <OptimizedAvatar
              imgUrl={userImage}
              alt={`${userName}'s avatar`}
              userName={userName}
              size={64}
            />

            {showTierBadge && <TierBadge tier={tier} />}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-800">{userName}</h2>
            {userEmail && <p className="text-sm text-gray-500">{userEmail}</p>}
            {formattedPhoneNumber && (
              <p className="text-sm text-gray-500">{formattedPhoneNumber}</p>
            )}
            <LocationDate />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {isNotBuyer && (
            <button
              onClick={handleRecyclingClick}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-full shadow-md hover:scale-105 transition-transform duration-200 active:scale-95"
              aria-label={t("profile.returnEarn")}
            >
              <RefreshCcw size={18} />
              {t("profile.returnEarn")}
            </button>
          )}
          <Link
            href="/editprofile"
            className="flex items-center gap-2 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-colors duration-200 active:bg-green-200"
            prefetch={false}
            aria-label={t("profile.editProfile")}
          >
            <Pencil size={16} />
            {t("profile.editProfile")}
          </Link>
        </div>
      </div>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    return (
      prevProps.user?.imgUrl === nextProps.user?.imgUrl &&
      prevProps.user?.name === nextProps.user?.name &&
      prevProps.user?.email === nextProps.user?.email &&
      prevProps.user?.phoneNumber === nextProps.user?.phoneNumber &&
      prevProps.user?.role === nextProps.user?.role &&
      prevProps.tier === nextProps.tier &&
      prevProps.onOpenRecyclingModal === nextProps.onOpenRecyclingModal &&
      prevProps.t === nextProps.t
    );
  }
);

ProfileHeader.displayName = "ProfileHeader";

export default ProfileHeader;