export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  provider: "google" | "facebook" | "none";
  role: "admin" | "customer" | "buyer" | "delivery";
  isGuest: boolean;
  imgUrl?: string;
  createdAt?: string | Date; // or Date if you parse it
  updatedAt?: string | Date; // or Date if you parse it
  lastActiveAt?: string | Date; // or Date if you parse it
}
