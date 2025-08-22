import { SetStateAction } from "react";

export type City =
  | "Cairo"
  | "Giza"
  | "Alexandria"
  | "Mansoura"
  | "Aswan"
  | "Asyut"
  | "Beni Suef"
  | "Damietta"
  | "Faiyum"
  | "Ismailia"
  | "Kafr El Sheikh"
  | "Luxor"
  | "Matruh"
  | "Minya"
  | "Monufia"
  | "New Valley"
  | "North Sinai"
  | "Port Said"
  | "Qalyubia"
  | "Qena"
  | "Red Sea"
  | "Sharqia"
  | "Sohag"
  | "South Sinai"
  | "Suez"
  | "Beheira"
  | "Dakahlia"
  | "Gharbia";

export type Area =
  | "Nasr City"
  | "Heliopolis"
  | "Maadi"
  | "Dokki"
  | "Mohandessin"
  | "6th October"
  | "Stanley"
  | "Smouha"
  | "Gleem"
  | "Sporting"
  | "El-Mansheya"
  | "Talkha"
  | "Sherbin"
  | "New Mansoura"
  | "El-Sahel"
  | "El-Nuba";

export type FormInputs = {
  street: string;
  landmark: string;
  building: string | number;
  floor: number | null;
  apartment: number | string;
  notes: string;
  city: string;
  area: string;
  _id: SetStateAction<string | null>;
};

export type CityAreas = Record<City, Area[]>;
