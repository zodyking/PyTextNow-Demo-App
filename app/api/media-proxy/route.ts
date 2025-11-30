import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");
    const sidCookie = searchParams.get("sid");
    const csrfCookie = searchParams.get("csrf");

    if (!imageUrl || !sidCookie || !csrfCookie) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl);
    
    // Basic URL validation - just check it's a valid URL format
    try {
      new URL(decodedUrl);
    } catch (urlError) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }
    
    // Fetch the image with authentication cookies
    const response = await fetch(decodedUrl, {
      method: "GET",
      headers: {
        "Cookie": `connect.sid=${decodeURIComponent(sidCookie)}; _csrf=${decodeURIComponent(csrfCookie)}`,
        "X-CSRF-Token": decodeURIComponent(csrfCookie),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://www.textnow.com/",
        "Accept": "image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

