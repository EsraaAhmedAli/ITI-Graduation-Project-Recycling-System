export interface Item {
  name: string;
  image: string;
  points: number;
  price: number;
  measurement_unit: 1 | 2;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  description?: string; 
  items: Item[];
}
