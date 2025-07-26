import { NextRequest, NextResponse } from 'next/server';

interface Courier {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  user: {
    userId: string;
    userName: string;
    phoneNumber: string;
    email: string;
  };
  items: Array<{ name: string; quantity: number; price: number }>;
  address: {
    city: string;
    area: string;
    street: string;
    building: string;
    floor: string;
  };
  status: string;
  courier: Courier | null;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    notes: string;
  }>;
  createdAt: string;
}

// Mock data - in real implementation, this would come from database
const mockOrders: Order[] = [
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
  }
];

// Mock drivers data
const mockDrivers = [
  {
    _id: 'driver1',
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com'
  },
  {
    _id: 'driver2',
    name: 'Mohamed Ali',
    email: 'mohamed@example.com'
  }
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { status, adminNotes, courierId } = body;

    const orderIndex = mockOrders.findIndex(o => o._id === orderId);
    
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'assigntocourier', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = { ...mockOrders[orderIndex] };
    updatedOrder.status = status;
    
    // Add to status history
    updatedOrder.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      notes: adminNotes || `Status updated to ${status}`
    });

    // Handle courier assignment
    if (courierId && status === 'assigntocourier') {
      const courier = mockDrivers.find(d => d._id === courierId);
      if (courier) {
        updatedOrder.courier = courier;
      }
    }

    mockOrders[orderIndex] = updatedOrder;

    return NextResponse.json({
      success: true,
      data: {
        _id: updatedOrder._id,
        status: updatedOrder.status,
        adminNotes: adminNotes || `Status updated to ${status}`,
        courier: updatedOrder.courier?._id || null
      },
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 