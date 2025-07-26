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
  status: string;
  // Cancellation data
  cancellationReason?: string;
  cancelledAt?: string;
  // Safety reports
  safetyReports?: SafetyReport[];
}

export interface SafetyReport {
  _id: string;
  orderId: string;
  type: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical'; // Made optional since we removed it from frontend
  createdAt: string;
}

export interface OrdersResponse {
  data: Order[];
}