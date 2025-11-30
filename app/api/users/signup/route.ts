import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, confirmPassword, textnowUsername, sidCookie, csrfCookie } = body;

    // Validation
    if (!username || !password || !textnowUsername || !sidCookie || !csrfCookie) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Create user
    const userId = crypto.randomUUID();
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    
    db.prepare(`
      INSERT INTO users (id, username, password, textnow_username, sid_cookie, csrf_cookie, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(userId, username, hashedPassword, textnowUsername, sidCookie, csrfCookie);

    // Return user (without password)
    const user = db.prepare("SELECT id, username, textnow_username, sid_cookie, csrf_cookie, gemini_api_key, created_at FROM users WHERE id = ?").get(userId);

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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


