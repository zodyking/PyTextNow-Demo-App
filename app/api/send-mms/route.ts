import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const number = formData.get("number") as string;
    const message = (formData.get("message") as string) || "";
    const username = formData.get("username") as string;
    const sidCookie = formData.get("sidCookie") as string;
    const csrfCookie = formData.get("csrfCookie") as string;

    if (!file || !number || !username || !sidCookie || !csrfCookie) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Step 1: Get upload URL from TextNow API (per issue #75)
    // According to issue #75: For images, use GET with message_type=2 (similar to voice using GET with message_type=3)
    // Voice: GET /api/v3/attachment_url?message_type=3
    // Image: GET /api/v3/attachment_url?message_type=2
    const uploadUrlResponse = await fetch(
      `https://www.textnow.com/api/v3/attachment_url?message_type=2`,
      {
        method: "GET",
        headers: {
          "Cookie": `connect.sid=${sidCookie}; _csrf=${csrfCookie}`,
          "X-CSRF-Token": csrfCookie,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": "https://www.textnow.com/",
          "Accept": "application/json",
        },
      }
    );

    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text();
      console.error("Failed to get upload URL:", uploadUrlResponse.status, errorText);
      console.error("Request URL:", `https://www.textnow.com/api/v3/attachment_url`);
      console.error("Request body:", JSON.stringify({ file_name: file.name || "image.jpg", file_size: file.size }));
      let errorMessage = "Failed to get upload URL";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: uploadUrlResponse.status }
      );
    }

    const uploadUrlData = await uploadUrlResponse.json();
    console.log("Upload URL response data:", JSON.stringify(uploadUrlData, null, 2));
    
    const uploadUrl = uploadUrlData.result || uploadUrlData.url;

    if (!uploadUrl) {
      console.error("Upload URL response structure:", uploadUrlData);
      return NextResponse.json(
        { error: "No upload URL received", details: uploadUrlData },
        { status: 500 }
      );
    }

    console.log("Got upload URL:", uploadUrl);
    console.log("File details - name:", file.name, "type:", file.type, "size:", file.size);

    // Step 2: Upload file to the pre-signed URL
    // According to issue #75: PUT {pre-signed-url} with raw image data
    const fileBuffer = await file.arrayBuffer();
    console.log("Uploading file to:", uploadUrl);
    console.log("File buffer size:", fileBuffer.byteLength);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "image/jpeg",
        // Don't add any other headers - pre-signed URLs usually don't need auth headers
      },
      body: fileBuffer,
    });

    console.log("Upload response status:", uploadResponse.status);
    console.log("Upload response headers:", Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const uploadErrorText = await uploadResponse.text();
      console.error("Failed to upload file - Status:", uploadResponse.status);
      console.error("Failed to upload file - Response:", uploadErrorText);
      return NextResponse.json(
        { error: "Failed to upload file", details: uploadErrorText },
        { status: uploadResponse.status }
      );
    }

    console.log("File uploaded successfully");

    // Step 3: Send MMS using the attachment URL (per issue #75)
    const sendFormData = new URLSearchParams();
    sendFormData.append("contact_value", number);
    sendFormData.append("contact_type", "2");
    sendFormData.append("attachment_url", uploadUrl);
    sendFormData.append("message_type", "2");
    sendFormData.append("media_type", file.type.startsWith("image/") ? "images" : "video");
    // Note: According to issue #75, message is optional for MMS
    if (message) {
      sendFormData.append("message", message);
    }

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
        { error: "Failed to send MMS" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, message: data });
  } catch (error: any) {
    console.error("Error sending MMS:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

