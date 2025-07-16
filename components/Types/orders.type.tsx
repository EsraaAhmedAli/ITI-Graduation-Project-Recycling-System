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
  }[];
  createdAt: string;
  updatedAt: string;
}
