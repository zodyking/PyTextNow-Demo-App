import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Return user (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        textnowUsername: user.textnow_username,
        sidCookie: user.sid_cookie,
        csrfCookie: user.csrf_cookie,
        geminiApiKey: user.gemini_api_key || undefined,
        createdAt: user.created_at,
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


