export interface Item {
  name: string;
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
  itemt: Item[];
  measurement_unit?: 1 | 2;
  price: number;
}
