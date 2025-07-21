import { Area, City } from "@/components/Types/address.type";

export type CityAreas = Record<City, Area[]>;

export const cityAreas: CityAreas = {
  Cairo: ['Nasr City', 'Heliopolis', 'Maadi'],
  Giza: ['Dokki', 'Mohandessin', '6th October'],
  Alexandria: ['Stanley', 'Smouha', 'Gleem', 'Sporting', 'El-Mansheya'],
  Mansoura: ['Talkha', 'Sherbin', 'New Mansoura'],
  Aswan: ['El-Sahel', 'El-Nuba'],
};
