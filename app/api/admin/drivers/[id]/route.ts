import { NextRequest, NextResponse } from 'next/server';

// Mock drivers data - in real implementation, this would come from database
const mockDrivers = [
  {
    _id: 'driver1',
    name: 'Ahmed Hassan',
    phone: '+20 123 456 7890',
    email: 'ahmed.hassan@example.com',
    licenseNumber: 'DL-2024-001',
    vehicleInfo: {
      type: 'Motorcycle',
      model: 'Honda',
      plateNumber: 'ABC123',
      color: 'Red'
    },
    status: 'available',
    isActive: true,
    rating: 4.8,
    currentLocation: {
      type: 'Point',
      coordinates: [31.2357, 30.0444]
    }
  },
  {
    _id: 'driver2',
    name: 'Mohamed Ali',
    phone: '+20 123 456 7891',
    email: 'mohamed.ali@example.com',
    licenseNumber: 'DL-2024-002',
    vehicleInfo: {
      type: 'Motorcycle',
      model: 'Yamaha',
      plateNumber: 'XYZ789',
      color: 'Blue'
    },
    status: 'available',
    isActive: true,
    rating: 4.6,
    currentLocation: {
      type: 'Point',
      coordinates: [31.2357, 30.0444]
    }
  },
  {
    _id: 'driver3',
    name: 'Omar Ibrahim',
    phone: '+20 123 456 7892',
    email: 'omar.ibrahim@example.com',
    licenseNumber: 'DL-2024-003',
    vehicleInfo: {
      type: 'Motorcycle',
      model: 'Suzuki',
      plateNumber: 'DEF456',
      color: 'Green'
    },
    status: 'busy',
    isActive: true,
    rating: 4.9,
    currentLocation: {
      type: 'Point',
      coordinates: [31.2357, 30.0444]
    }
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;
    const driver = mockDrivers.find(d => d._id === driverId);

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch driver' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;
    const body = await request.json();
    
    const driverIndex = mockDrivers.findIndex(d => d._id === driverId);
    
    if (driverIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Driver not found' },
        { status: 404 }
      );
    }

    // Update driver data
    const updatedDriver = {
      ...mockDrivers[driverIndex],
      ...body
    };

    mockDrivers[driverIndex] = updatedDriver;

    return NextResponse.json({
      success: true,
      data: {
        _id: updatedDriver._id,
        status: updatedDriver.status,
        rating: updatedDriver.rating
      },
      message: 'Driver updated successfully'
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update driver' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;
    const driverIndex = mockDrivers.findIndex(d => d._id === driverId);
    
    if (driverIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Driver not found' },
        { status: 404 }
      );
    }

    // Remove driver from array
    mockDrivers.splice(driverIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete driver' },
      { status: 500 }
    );
  }
} 