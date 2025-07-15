
export type City = 'Cairo' | 'Giza';

export type Area =
  | 'Nasr City'
  | 'Heliopolis'
  | 'Maadi'
  | 'Dokki'
  | 'Mohandessin'
  | '6th October';
  export type FormInputs = {
        street:string,
      landmark: string
      building: string|number
      floor: number|null
      apartment: number|string
      notes: string,
      city:string,
      area:string
    }
  

export type CityAreas = Record<City, Area[]>;
