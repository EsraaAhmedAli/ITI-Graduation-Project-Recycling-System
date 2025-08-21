export const TAG_COLORS = {
  redeem: "bg-purple-100 text-purple-800 border-purple-200",
  cashback: "bg-orange-100 text-orange-800 border-orange-200",
  earn: "bg-green-100 text-green-800 border-green-200",
  bonus: "bg-blue-100 text-blue-800 border-blue-200",
  deduct: "bg-red-100 text-red-800 border-red-200",
} as const;

export const iconImports = {
  Gift: () => import("lucide-react").then((mod) => ({ default: mod.Gift })),
  Plus: () => import("lucide-react").then((mod) => ({ default: mod.Plus })),
  Award: () => import("lucide-react").then((mod) => ({ default: mod.Award })),
  Minus: () => import("lucide-react").then((mod) => ({ default: mod.Minus })),
  Eye: () => import("lucide-react").then((mod) => ({ default: mod.Eye })),
};
