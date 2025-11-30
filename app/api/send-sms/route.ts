import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { number, message, username, sidCookie, csrfCookie } = await request.json();

    if (!number || !message || !username || !sidCookie || !csrfCookie) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Send SMS via TextNow API
    const response = await fetch(`https://www.textnow.com/api/users/${username}/messages`, {
      method: "POST",
      headers: {
        "Cookie": `connect.sid=${sidCookie}; _csrf=${csrfCookie}`,
        "X-CSRF-Token": csrfCookie,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        contact_value: number,
        message: message,
        read: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TextNow API error:", errorText);
      return NextResponse.json(
        { error: "Failed to send SMS" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, message: data });
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


