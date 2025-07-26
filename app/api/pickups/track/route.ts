import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Mock tracking data - in real app, fetch from database
    const mockTrackingData = {
      status: "en_route",
      updates: [
        {
          id: "1",
          message: "Driver is on the way to your location",
          timestamp: new Date().toISOString()
        },
        {
          id: "2", 
          message: "Order confirmed and driver assigned",
          timestamp: new Date(Date.now() - 300000).toISOString()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockTrackingData
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tracking data" },
      { status: 500 }
    );
  }
} 