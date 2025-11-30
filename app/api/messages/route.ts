import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { number, username, sidCookie, csrfCookie } = await request.json();

    if (!number || !username || !sidCookie || !csrfCookie) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get messages for specific conversation - Updated per issue #75
    // Decode cookies in case they're URL encoded
    const decodedSid = decodeURIComponent(sidCookie);
    const decodedCsrf = decodeURIComponent(csrfCookie);
    
    const response = await fetch(
      `https://www.textnow.com/api/users/${username}/messages?contact_value=${encodeURIComponent(number)}&start_message_id=0&direction=future&page_size=0`,
      {
        method: "GET",
        headers: {
          "Cookie": `connect.sid=${decodedSid}; _csrf=${decodedCsrf}`,
          "X-CSRF-Token": decodedCsrf,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Process messages according to issue #75 structure
    // message_direction: 1 = incoming, 2 = outgoing
    // message_type: 1 = text, 2 = media, 3 = voice
    const messages = (data.messages || []).map((msg: any) => {
      const direction = msg.message_direction === 2 || msg.direction === 2 ? "sent" : "received";
      const messageType = msg.message_type;
      const isMedia = messageType === 2;
      const isVoice = messageType === 3;
      
      // Get message content
      const messageContent = msg.message || msg.body || "";
      
      // Get media URL - check multiple possible fields
      let mediaUrl = msg.media_url || msg.attachment_url || msg.attachments?.[0]?.url || msg.mediaUrl;
      
      // Also check if message content itself is a media URL (common case)
      if (!mediaUrl && messageContent && typeof messageContent === "string" && messageContent.trim().startsWith("https://media.textnow.com")) {
        mediaUrl = messageContent.trim();
      }
      
      // Only filter out clearly invalid URLs (not properly formatted)
      if (mediaUrl) {
        try {
          new URL(mediaUrl); // Just validate it's a proper URL
          // Don't filter based on pathname - let the proxy/error handling deal with invalid URLs
        } catch (e) {
          // Invalid URL format - clear it
          mediaUrl = undefined;
        }
      }
      
      // Determine type - also check if content is a URL
      let type: "sms" | "mms" | "voice" = "sms";
      if (isVoice) {
        type = "voice";
      } else if (isMedia || mediaUrl || (messageContent && typeof messageContent === "string" && messageContent.trim().startsWith("https://media.textnow.com"))) {
        type = "mms";
      }
      
      // Debug logging for media messages
      if (mediaUrl || type === "mms") {
        console.log("Media message detected:", {
          id: msg.id,
          type: type,
          mediaUrl: mediaUrl,
          messageType: messageType,
          content: messageContent?.substring(0, 100),
        });
      }
      
      return {
        id: msg.id || msg.message_id || Date.now().toString(),
        content: messageContent,
        number: msg.contact_value || msg.number || number,
        date: msg.date || msg.timestamp || new Date().toISOString(),
        direction: direction,
        type: type,
        mediaUrl: mediaUrl,
        contentType: msg.content_type || (isMedia ? "image/jpeg" : isVoice ? "audio/mpeg" : undefined),
      };
    });

    // Sort by date
    messages.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

