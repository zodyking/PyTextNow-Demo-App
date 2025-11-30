import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const number = formData.get("number") as string;
    const username = formData.get("username") as string;
    const sidCookie = formData.get("sidCookie") as string;
    const csrfCookie = formData.get("csrfCookie") as string;

    if (!file || !number || !username || !sidCookie || !csrfCookie) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check if file is audio
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File must be an audio file" },
        { status: 400 }
      );
    }

    // Step 1: Get upload URL for voice message (per issue #75 - message_type=3 for voice)
    const uploadUrlResponse = await fetch(
      `https://www.textnow.com/api/v3/attachment_url?message_type=3`,
      {
        method: "GET",
        headers: {
          "Cookie": `connect.sid=${sidCookie}; _csrf=${csrfCookie}`,
          "X-CSRF-Token": csrfCookie,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json",
        },
      }
    );

    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text();
      console.error("Failed to get upload URL:", errorText);
      return NextResponse.json(
        { error: "Failed to get upload URL" },
        { status: uploadUrlResponse.status }
      );
    }

    const uploadUrlData = await uploadUrlResponse.json();
    const uploadUrl = uploadUrlData.result || uploadUrlData.url;

    if (!uploadUrl) {
      return NextResponse.json(
        { error: "No upload URL received" },
        { status: 500 }
      );
    }

    // Step 2: Upload audio file to the pre-signed URL
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "audio/mpeg",
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      console.error("Failed to upload file:", await uploadResponse.text());
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: uploadResponse.status }
      );
    }

    // Step 3: Send voice message using the attachment URL (per issue #75)
    const sendFormData = new URLSearchParams();
    sendFormData.append("contact_value", number);
    sendFormData.append("contact_type", "2");
    sendFormData.append("attachment_url", uploadUrl);
    sendFormData.append("message_type", "3");
    sendFormData.append("media_type", "audio");
    sendFormData.append("message", "");

    const response = await fetch(`https://www.textnow.com/api/v3/send_attachment`, {
      method: "POST",
      headers: {
        "Cookie": `connect.sid=${sidCookie}; _csrf=${csrfCookie}`,
        "X-CSRF-Token": csrfCookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: sendFormData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TextNow API error:", errorText);
      return NextResponse.json(
        { error: "Failed to send voice message" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, message: data });
  } catch (error: any) {
    console.error("Error sending voice message:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

