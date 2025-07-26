import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if backend is accessible
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    
    return NextResponse.json({
      success: true,
      message: 'Frontend API is working',
      backendUrl: backendUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Frontend API error', error: error },
      { status: 500 }
    );
  }
} 