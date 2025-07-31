// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   password?: string;
//   phoneNumber: string;
//   provider: "google" | "facebook" | "none";
//   role: "admin" | "customer" | "buyer" | "delivery";
//   isGuest: boolean;
//   imgUrl?: string;
//   createdAt?: string; // or Date if you parse it
//   updatedAt?: string; // or Date if you parse it
// }

export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  provider: "google" | "facebook" | "none";
  role: "admin" | "customer" | "buyer" | "delivery";
  isApproved: boolean;
  attachments: Record<string, any>; // flexible object
  imgUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
}
