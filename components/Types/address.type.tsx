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
