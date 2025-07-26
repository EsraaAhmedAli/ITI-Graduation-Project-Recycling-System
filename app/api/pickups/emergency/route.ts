import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    // Here you would typically trigger emergency protocols
    // For now, we'll just return success
    console.log("Emergency contact triggered for order:", orderId);

    return NextResponse.json({
      success: true,
      message: "Emergency services contacted successfully"
    });
  } catch (error) {
    console.error("Emergency contact error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to contact emergency services" },
      { status: 500 }
    );
  }
} 