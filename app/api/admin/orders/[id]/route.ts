import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real implementation, this would come from database
const mockOrders = [
  {
    _id: 'order1',
    user: {
      userId: 'user1',
      userName: 'John Doe',
      phoneNumber: '+1234567890',
      email: 'john@example.com'
    },
    items: [
      { name: 'Plastic Bottles', quantity: 5, price: 2.50 },
      { name: 'Paper', quantity: 3, price: 1.00 }
    ],
    address: {
      city: 'Cairo',
      area: 'Maadi',
      street: 'Street 1',
      building: 'Building A',
      floor: '2nd Floor'
    },
    status: 'pending',
    courier: null,
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        notes: 'Order created'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order2',
    user: {
      userId: 'user2',
      userName: 'Jane Smith',
      phoneNumber: '+1234567891',
      email: 'jane@example.com'
    },
    items: [
      { name: 'Glass Bottles', quantity: 2, price: 3.00 }
    ],
    address: {
      city: 'Alexandria',
      area: 'Miami',
      street: 'Street 2',
      building: 'Building B',
      floor: '1st Floor'
    },
    status: 'assigntocourier',
    courier: {
      _id: 'driver1',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com'
    },
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Order created'
      },
      {
        status: 'assigntocourier',
        timestamp: new Date().toISOString(),
        notes: 'Assigned to courier'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const order = mockOrders.find(o => o._id === orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

 