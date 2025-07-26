import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock analytics data for demonstration
    const analyticsData = {
      totalOrders: 150,
      statusCounts: {
        pending: 25,
        confirmed: 45,
        assigntocourier: 30,
        completed: 40,
        cancelled: 10
      },
      dailyOrders: [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 8 },
        { date: '2024-01-03', count: 12 },
        { date: '2024-01-04', count: 6 },
        { date: '2024-01-05', count: 15 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 