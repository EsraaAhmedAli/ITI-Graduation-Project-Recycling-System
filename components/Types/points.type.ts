export interface PointsEntry {
  _id: string;
  reason: string;
  points: number;
  timestamp: string;
}

export interface UserPoints {
  pointsHistory: PointsEntry[];
}

export type PointsTag = "redeem" | "cashback" | "earn" | "bonus" | "deduct";
