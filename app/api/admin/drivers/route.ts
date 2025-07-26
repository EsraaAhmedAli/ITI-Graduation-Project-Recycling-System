import { NextRequest, NextResponse } from 'next/server';

// Mock drivers data - replace with actual database calls
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
      coordinates: [31.2357, 30.0444] // Cairo coordinates
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
  },
  {
    _id: 'driver4',
    name: 'Hassan Mahmoud',
    phone: '+20 123 456 7893',
    email: 'hassan.mahmoud@example.com',
    licenseNumber: 'DL-2024-004',
    vehicleInfo: {
      type: 'Motorcycle',
      model: 'Kawasaki',
      plateNumber: 'GHI789',
      color: 'Black'
    },
    status: 'inactive',
    isActive: false,
    rating: 4.2,
    currentLocation: {
      type: 'Point',
      coordinates: [31.2357, 30.0444]
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let filteredDrivers = [...mockDrivers];

    // Filter by status
    if (status && status !== 'all') {
      filteredDrivers = filteredDrivers.filter(driver => driver.status === status);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDrivers = filteredDrivers.filter(driver => 
        driver.name.toLowerCase().includes(searchLower) ||
        driver.email.toLowerCase().includes(searchLower) ||
        driver.phone.includes(search)
      );
    }

    // Calculate pagination
    const totalDrivers = filteredDrivers.length;
    const totalPages = Math.ceil(totalDrivers / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        drivers: paginatedDrivers,
        pagination: {
          currentPage: page,
          totalPages,
          totalDrivers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, licenseNumber, vehicleInfo } = body;

    // Validate required fields
    if (!name || !phone || !email || !licenseNumber || !vehicleInfo) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new driver (in real implementation, save to database)
    const newDriver = {
      _id: `driver${Date.now()}`,
      name,
      phone,
      email,
      licenseNumber,
      vehicleInfo,
      status: 'available',
      isActive: true,
      rating: 0,
      currentLocation: {
        type: 'Point',
        coordinates: [31.2357, 30.0444]
      }
    };

    // Add to mock data (in real implementation, save to database)
    mockDrivers.push(newDriver);

    return NextResponse.json({
      success: true,
      data: {
        _id: newDriver._id,
        name: newDriver.name,
        status: newDriver.status,
        isActive: newDriver.isActive,
        rating: newDriver.rating
      },
      message: 'Driver created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create driver' },
      { status: 500 }
    );
  }
} 