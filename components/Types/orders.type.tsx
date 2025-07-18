export interface Order {
  _id: string;
  userId: string;
  address: {
    city: string;
    area: string;
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    landmark?: string;
    notes?: string;
  };
  items: {
    name: string;
    quantity: number;
    totalPoints: number;
    image:string
    points:number
    measurement_unit:number
    price:number
    itemName:string
  }[];
  createdAt: string;
  updatedAt: string;
  status:string
}
export interface OrdersResponse {
  data: Order[];
}