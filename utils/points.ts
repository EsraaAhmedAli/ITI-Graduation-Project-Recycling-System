import { PointsTag } from "@/components/Types/points.type";

export const categorizeEntry = (reason: string, points: number): PointsTag => {
  if (points < 0) return "deduct";

  const message = reason.toLowerCase();
  if (message.includes("cashback")) return "cashback";
  if (message.includes("redeem") || message.includes("voucher"))
    return "redeem";
  if (
    message.includes("bonus") ||
    message.includes("welcome") ||
    message.includes("referral")
  )
    return "bonus";
  return "earn";
};

export const formatDate = (timestamp: string): string => {
  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};
