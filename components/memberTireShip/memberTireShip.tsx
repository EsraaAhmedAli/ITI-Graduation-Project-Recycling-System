import Link from "next/link";
import { Info, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation"; // App Router
import { rewardLevels } from "@/constants/rewardsTiers";
import { useLanguage } from "@/context/LanguageContext";

export function getUserTier(reycles: number) {
  return rewardLevels.find(
    (tier) => reycles >= tier.minRecycles && reycles <= tier.maxRecycles
  );
}

export default function TierStatBox({
  totalRecycles,
}: {
  totalRecycles: number;
}) {
  const tier = getUserTier(totalRecycles);
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  if (!tier) return null;

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);

    startTransition(() => {
      router.push("/profile/rewarding");
      // Reset after a delay since we can't easily detect when navigation completes
      setTimeout(() => setIsNavigating(false), 1000);
    });
  };

  return (
    <div
      className={`
    p-4 rounded-xl shadow-sm flex flex-row flex-nowrap items-center justify-center border
    ${tier.color} gap-4
    w-full max-w-full
    transition-[max-width] duration-500 ease-in-out overflow-hidden
  `}
      style={{ borderColor: tier.color }}
    >
      {/* Left: Tier Name */}
      <div className="flex-grow min-w-0">
        <p className="text-xl font-bold text-left truncate">
          {t(`profile.tires.${tier.name.replace(" ", "").toLowerCase()}`)}
        </p>
      </div>

      {/* Right: Badge + Icon Link */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <tier.badge />

        <button
          onClick={handleNavigation}
          disabled={isNavigating || isPending}
          className="p-2 rounded-full hover:bg-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="View Rewards Program"
        >
          {isNavigating || isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
