
export type City = 'Cairo' | 'Giza';

export type Area =
  | 'Nasr City'
  | 'Heliopolis'
  | 'Maadi'
  | 'Dokki'
  | 'Mohandessin'
  | '6th October';

export type CityAreas = Record<City, Area[]>;
