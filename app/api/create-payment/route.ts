import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    const body = await request.json();

    let backendEndpoint = "";

    if (path.endsWith("/stripe-customer")) {
      backendEndpoint = `/users/${userId}/stripe-customer`;
    } else if (path.endsWith("/create-payment-intent")) {
      backendEndpoint = `/users/${userId}/create-payment-intent`;
    } else {
      return NextResponse.json({ error: "Unknown API endpoint" }, { status: 404 });
    }

    // Proxy the request to backend
    const backendRes = await fetch(`${BACKEND_URL}${backendEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json({ error: data.error || "Backend error" }, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
