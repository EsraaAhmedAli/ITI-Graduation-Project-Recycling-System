import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Pickups API endpoint",
    availableEndpoints: [
      "/api/pickups/safety-report",
      "/api/pickups/cancel", 
      "/api/pickups/emergency"
    ]
  });
}
