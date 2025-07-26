import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, reason } = body;

    console.log("Order cancellation request:", { orderId, reason });

    // Validate required fields
    if (!orderId || !reason) {
      return NextResponse.json(
        { success: false, message: "Order ID and reason are required" },
        { status: 400 }
      );
    }

    // Validate orderId format (basic validation)
    if (typeof orderId !== 'string' || orderId.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID format" },
        { status: 400 }
      );
    }

    // Validate reason length
    if (reason.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Cancellation reason must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Here you would typically update the order status in database
    // For now, we'll simulate a database operation
    console.log("Order cancellation processed:", { orderId, reason });

    // Simulate potential database error (remove this in production)
    if (Math.random() < 0.1) { // 10% chance of error for testing
      throw new Error("Database connection failed");
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: { 
        orderId, 
        reason, 
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel order. Please try again." },
      { status: 500 }
    );
  }
} 