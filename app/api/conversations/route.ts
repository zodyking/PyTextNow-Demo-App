import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, sidCookie, csrfCookie } = await request.json();

    if (!username || !sidCookie || !csrfCookie) {
      return NextResponse.json(
        { error: "Missing required credentials" },
        { status: 400 }
      );
    }

    // Get conversations from messages endpoint (more reliable than conversations endpoint)
    // Build conversations from all messages per issue #75
    // Use large page_size to get all conversations
    const messagesResponse = await fetch(
      `https://www.textnow.com/api/users/${username}/messages?start_message_id=0&direction=future&page_size=1000`,
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
    
    let conversations: any[] = [];
    
    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      const conversationsMap = new Map<string, any>();
      
      if (messagesData.messages && Array.isArray(messagesData.messages)) {
        messagesData.messages.forEach((msg: any) => {
          // Get contact number - normalize it (remove +, spaces, etc.)
          let number = msg.contact_value || msg.number || msg.contact || "";
          
          // Normalize phone number - remove common formatting
          if (number) {
            number = number.replace(/[\s\-\(\)\+]/g, "").trim();
          }
          
          if (!number || number === "unknown" || number === "") {
            return; // Skip invalid messages
          }
          
          // Get message content - handle media messages
          let messageContent = msg.message || msg.body || "";
          
          // If it's a media message, show indicator instead of URL
          if (msg.message_type === 2 && msg.media_url) {
            messageContent = "📷 Image";
          } else if (msg.message_type === 3) {
            messageContent = "🎤 Voice message";
          } else if (messageContent && messageContent.startsWith("https://media.textnow.com")) {
            messageContent = "📷 Media";
          }
          
          // Truncate long messages
          if (messageContent.length > 50) {
            messageContent = messageContent.substring(0, 50) + "...";
          }
          
          // Use normalized number as key to ensure same contact is grouped together
          // Get media URL for preview
          const mediaUrl = msg.media_url || msg.attachment_url || msg.attachments?.[0]?.url;
          
          if (!conversationsMap.has(number)) {
            conversationsMap.set(number, {
              id: number,
              number: number,
              lastMessage: messageContent,
              lastMessageTime: msg.date || msg.timestamp || new Date().toISOString(),
              unread: 0,
              lastMediaUrl: mediaUrl || null, // Store media URL for preview
            });
          } else {
            const conv = conversationsMap.get(number);
            const msgDate = new Date(msg.date || msg.timestamp || 0);
            const convDate = new Date(conv.lastMessageTime);
            
            // Update if this message is newer
            if (msgDate > convDate) {
              conv.lastMessage = messageContent;
              conv.lastMessageTime = msg.date || msg.timestamp || conv.lastMessageTime;
              conv.lastMediaUrl = mediaUrl || conv.lastMediaUrl; // Update media URL if available
            }
          }
        });
        
        conversations = Array.from(conversationsMap.values());
        
        // Remove duplicates - sometimes same number appears with different formatting
        const uniqueConversations = new Map();
        conversations.forEach((conv) => {
          // Normalize the number again for comparison
          const normalized = conv.number.replace(/[\s\-\(\)\+]/g, "").trim();
          if (!uniqueConversations.has(normalized)) {
            uniqueConversations.set(normalized, conv);
          } else {
            // Keep the one with the most recent message
            const existing = uniqueConversations.get(normalized);
            const existingDate = new Date(existing.lastMessageTime);
            const newDate = new Date(conv.lastMessageTime);
            if (newDate > existingDate) {
              uniqueConversations.set(normalized, conv);
            }
          }
        });
        
        conversations = Array.from(uniqueConversations.values());
      }
    } else {
      // If messages endpoint fails, try conversations endpoint as fallback
      try {
        const convResponse = await fetch(`https://www.textnow.com/api/users/${username}/conversations`, {
          method: "GET",
          headers: {
            "Cookie": `connect.sid=${sidCookie}; _csrf=${csrfCookie}`,
            "X-CSRF-Token": csrfCookie,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json",
          },
        });
        
        if (convResponse.ok) {
          const convData = await convResponse.json();
          
          if (Array.isArray(convData)) {
            conversations = convData.map((conv: any) => ({
              id: conv.contact_value || conv.number || conv.id || "unknown",
              number: conv.contact_value || conv.number || "unknown",
              lastMessage: conv.last_message || conv.message || "",
              lastMessageTime: conv.last_message_time || conv.date || new Date().toISOString(),
              unread: conv.unread_count || 0,
            }));
          } else if (convData.conversations) {
            conversations = convData.conversations.map((conv: any) => ({
              id: conv.contact_value || conv.number || conv.id || "unknown",
              number: conv.contact_value || conv.number || "unknown",
              lastMessage: conv.last_message || conv.message || "",
              lastMessageTime: conv.last_message_time || conv.date || new Date().toISOString(),
              unread: conv.unread_count || 0,
            }));
          }
        }
      } catch (error) {
        console.error("Both endpoints failed:", error);
      }
    }
    
    // Sort by last message time
    conversations.sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

