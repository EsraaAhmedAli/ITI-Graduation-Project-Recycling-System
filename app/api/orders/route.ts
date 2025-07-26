import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - replace with actual database calls
let mockOrders = [
  {
    _id: 'order1',
    userId: 'user1',
    user: {
      userId: 'user1',
      userName: 'John Doe',
      phoneNumber: '+1234567890',
      email: 'john@example.com',
      imageUrl: 'https://example.com/avatar1.jpg'
    },
    items: [
      { name: 'Plastic Bottles', quantity: 5, price: 2.50, totalPoints: 12.5, image: '/images/plastic.jpg', points: 2.5, measurement_unit: 1, itemName: 'Plastic Bottles' },
      { name: 'Paper', quantity: 3, price: 1.00, totalPoints: 3.0, image: '/images/paper.jpg', points: 1.0, measurement_unit: 1, itemName: 'Paper' }
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cancellationReason: null,
    cancelledAt: null,
    safetyReports: []
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, items, phoneNumber, userName, email, imageUrl } = body;

    // Validate required fields
    if (!address || !items || !phoneNumber || !userName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new order with pending status
    const newOrder = {
      _id: `order${Date.now()}`,
      userId: `user${Date.now()}`,
      user: {
        userId: `user${Date.now()}`,
        userName,
        phoneNumber,
        email: email || '',
        imageUrl: imageUrl || ''
      },
      items: items.map((item: any) => ({
        ...item,
        totalPoints: item.quantity * (item.points || 0)
      })),
      address,
      status: 'pending', // Always start as pending
      courier: null,
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          notes: 'Order created - waiting for admin approval'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cancellationReason: null,
      cancelledAt: null,
      safetyReports: []
    };

    // Add to mock data
    mockOrders.push(newOrder);

    console.log('✅ Order created:', newOrder._id);

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: 'Order created successfully - waiting for admin approval'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const status = searchParams.get('status');

    if (orderId) {
      // Get specific order
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
    }

    // Get all orders with optional status filter
    let filteredOrders = [...mockOrders];
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 