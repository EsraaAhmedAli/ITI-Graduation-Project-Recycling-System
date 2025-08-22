import { CartItem } from "@/models/cart";

export interface Item {
  _id: string;
  name: string | { en: string; ar: string };
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
}

export interface Category {
  _id: string;
  categoryName: string;
  name: string;
  points: number;
  quantity: number;
  image: string;
  description?: string;
  items: CartItem[];
  measurement_unit?: 1 | 2;
  price: number;
}
