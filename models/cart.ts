export interface ICartItem {
  _id: string;
  originalCategoryId: string;
  categoryId: string;
  categoryName: string;
  itemName: string;
  image?: string;
  points: number;
  price: number;
  measurement_unit: number;
  quantity: number;
  availableQty?: number;
} 