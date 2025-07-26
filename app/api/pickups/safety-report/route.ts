import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, severity } = body;

    // Validate required fields
    if (!type || !description || !severity) {
      return NextResponse.json(
        { success: false, message: "Type, description, and severity are required" },
        { status: 400 }
      );
    }

    // Validate severity levels
    const validSeverities = ["low", "medium", "high", "critical"];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { success: false, message: "Invalid severity level" },
        { status: 400 }
      );
    }

    // Here you would typically save to database
    // For now, we'll simulate a database operation
    console.log("Safety report received:", { type, description, severity });

    // Simulate potential database error (remove this in production)
    if (Math.random() < 0.1) { // 10% chance of error for testing
      throw new Error("Database connection failed");
    }



    return NextResponse.json({
      success: true,
      message: "Safety report submitted successfully",
      data: {
        id: `safety_${Date.now()}`,
        type,
        description,
        severity,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Safety report error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit safety report. Please try again." },
      { status: 500 }
    );
  }
} 