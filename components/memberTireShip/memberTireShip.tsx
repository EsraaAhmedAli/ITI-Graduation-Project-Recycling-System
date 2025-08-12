import Link from "next/link";
import { Info } from "lucide-react";
import { rewardLevels } from "@/constants/rewardsTiers";
import { useLanguage } from "@/context/LanguageContext";

export function getUserTier(reycles: number) {
  return rewardLevels.find(
    (tier) => reycles >= tier.minRecycles && reycles <= tier.maxRecycles
  );
}

export default function TierStatBox({ totalRecycles }: { totalRecycles: number }) {
  const tier = getUserTier(totalRecycles);
  const { t } = useLanguage();
  if (!tier) return null;

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
        <div
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-bold shadow-md border-2 border-current animate-spin-slow hover:[animation-play-state:paused]"
          style={{ color: tier.color }}
        >
          {tier.badge}
        </div>

        <Link
          href="/profile/rewarding"
          className="p-2 rounded-full hover:bg-white/40 transition-colors"
          title="View Rewards Program"
        >
          <Info className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
