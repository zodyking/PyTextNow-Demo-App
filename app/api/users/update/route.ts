import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, textnowUsername, sidCookie, csrfCookie, geminiApiKey } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = db.prepare("SELECT id FROM users WHERE id = ?").get(userId) as any;
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user
    db.prepare(`
      UPDATE users 
      SET username = ?, 
          textnow_username = ?, 
          sid_cookie = ?, 
          csrf_cookie = ?,
          gemini_api_key = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      username,
      textnowUsername,
      sidCookie,
      csrfCookie,
      geminiApiKey || null,
      userId
    );

    // Return updated user
    const user = db.prepare("SELECT id, username, textnow_username, sid_cookie, csrf_cookie, gemini_api_key, created_at FROM users WHERE id = ?").get(userId) as any;

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
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


