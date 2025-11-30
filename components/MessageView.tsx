"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar, Button } from "@heroui/react";
import { SendMessageForm } from "./SendMessageForm";
import { ArrowLeft, Edit2 } from "lucide-react";
import { ContactNameEditor } from "./ContactNameEditor";
import { formatPhoneNumber, getDisplayName } from "@/utils/phoneFormatter";

function VoiceMessagePlayer({ 
  mediaUrl, 
  contentType, 
  user 
}: { 
  mediaUrl: string; 
  contentType?: string; 
  user: { sidCookie: string; csrfCookie: string } 
}) {
  const [duration, setDuration] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration) {
        setDuration(formatDuration(audio.duration));
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    
    // Try to load duration if already available
    if (audio.duration) {
      setDuration(formatDuration(audio.duration));
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(mediaUrl)}&sid=${encodeURIComponent(user.sidCookie)}&csrf=${encodeURIComponent(user.csrfCookie)}`;

  return (
    <div className="w-full flex flex-col items-start gap-2">
      <audio 
        ref={audioRef}
        controls 
        className="w-full h-9"
        style={{ 
          width: '100%',
          minWidth: '280px',
          display: 'block'
        }}
        preload="metadata"
        title="Voice Message"
      >
        <source 
          src={proxyUrl} 
          type={contentType || "audio/mpeg"} 
        />
      </audio>
      <div className="flex items-center gap-1.5">
        <span className="text-xs">🎤</span>
        <span className="text-xs text-gray-300">Voice Message</span>
        {duration && (
          <>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{duration}</span>
          </>
        )}
      </div>
    </div>
  );
}

interface Message {
  id: string;
  content: string;
  number: string;
  date: string;
  direction: "sent" | "received";
  type: "sms" | "mms" | "voice";
  mediaUrl?: string;
  contentType?: string;
}

interface MessageViewProps {
  conversationId: string;
  user: {
    textnowUsername: string;
    sidCookie: string;
    csrfCookie: string;
    geminiApiKey?: string;
  };
  onRefresh: () => void;
  onBack?: () => void;
  friendlyNames?: Record<string, string>;
  onSaveFriendlyName?: (phoneNumber: string, name: string) => void;
}

export function MessageView({
  conversationId,
  user,
  onRefresh,
  onBack,
  friendlyNames = {},
  onSaveFriendlyName,
}: MessageViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNameEditorOpen, setIsNameEditorOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId || !user) return;
    
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: conversationId,
          username: user.textnowUsername,
          sidCookie: user.sidCookie,
          csrfCookie: user.csrfCookie,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        // Handle non-OK responses
        try {
          const errorData = await response.json();
          console.error("Failed to load messages:", errorData);
        } catch {
          const errorText = await response.text();
          console.error("Failed to load messages:", response.status, errorText);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Conversation Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <Button
            isIconOnly
            variant="light"
            className="md:hidden text-white"
            onPress={onBack}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Avatar
          name={conversationId.slice(-4)}
          className="bg-electric-500 text-white"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p 
              className="font-semibold text-white cursor-pointer hover:text-electric-400 transition-colors"
              onClick={() => setIsNameEditorOpen(true)}
              title="Click to edit name"
            >
              {getDisplayName(conversationId, friendlyNames)}
            </p>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-gray-400 hover:text-electric-400 min-w-6 h-6"
              onPress={() => setIsNameEditorOpen(true)}
              aria-label="Edit contact name"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-400">PyTextNow conversation</p>
        </div>
      </div>

      {/* Contact Name Editor Modal */}
      {onSaveFriendlyName && (
        <ContactNameEditor
          isOpen={isNameEditorOpen}
          onClose={() => setIsNameEditorOpen(false)}
          phoneNumber={conversationId}
          currentName={friendlyNames[conversationId] || ""}
          onSave={onSaveFriendlyName}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.direction === "sent" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${message.type === "voice" ? "max-w-[85%] md:max-w-[75%] min-w-[320px]" : "max-w-[85%] md:max-w-[60%]"} rounded-lg px-3 py-2 text-sm ${
                  message.direction === "sent"
                    ? "bg-electric-500 text-white"
                    : "bg-[#1a1a1a] text-gray-100 border border-gray-800"
                }`}
              >
                {/* Check if content is a media URL and display as image (exclude voice messages) */}
                {message.type !== "voice" && (() => {
                  // Check if message has media (images/videos only, not voice)
                  const hasMedia = message.type === "mms" || 
                    message.mediaUrl ||
                    (message.content && typeof message.content === "string" && message.content.startsWith("https://media.textnow.com"));
                  
                  if (!hasMedia) return null;
                  
                  // Get the image URL from various sources
                  let imageUrl = message.mediaUrl;
                  if (!imageUrl && message.content && typeof message.content === "string" && message.content.startsWith("https://media.textnow.com")) {
                    imageUrl = message.content.trim();
                  }
                  
                  if (!imageUrl) return null;
                  
                  // Try to load the image - let error handling deal with invalid URLs
                  const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(imageUrl)}&sid=${encodeURIComponent(user.sidCookie)}&csrf=${encodeURIComponent(user.csrfCookie)}`;
                  
                  return (
                    <div className="mb-2">
                      <img
                        src={proxyUrl}
                        alt="Media"
                        className="rounded-lg max-w-full h-auto max-h-64 object-contain cursor-pointer"
                        onClick={() => window.open(imageUrl, "_blank")}
                        onError={(e) => {
                          // Silently handle errors - try direct URL, then hide if that fails
                          const img = e.currentTarget;
                          if (img.src.includes("/api/media-proxy")) {
                            // First attempt failed, try direct URL
                            img.src = imageUrl;
                          } else {
                            // Direct URL also failed, hide the image
                            img.style.display = "none";
                          }
                        }}
                      />
                    </div>
                  );
                })()}
                {message.type === "voice" && (
                  <div className="mb-2 w-full">
                    {message.mediaUrl ? (
                      <VoiceMessagePlayer 
                        mediaUrl={message.mediaUrl}
                        contentType={message.contentType}
                        user={user}
                      />
                    ) : (
                      <span className="text-sm">🎤 Voice Message</span>
                    )}
                  </div>
                )}
                {/* Only show text content if it's not just a media URL or if there's actual text */}
                {message.content && 
                 !message.content.startsWith("https://media.textnow.com") && 
                 message.content.trim() && (
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )}
                {/* Show media URL as text only if it's not displayed as image and there's no other content */}
                {message.type === "mms" && message.mediaUrl && 
                 (!message.content || message.content.startsWith("https://media.textnow.com")) && 
                 message.content && (
                  <p className="text-xs text-gray-400 italic">Media message</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.direction === "sent"
                      ? "text-electric-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.date)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-[#1a1a1a] border-t border-gray-800 p-4">
        <SendMessageForm
          number={conversationId}
          user={user}
          onMessageSent={() => {
            loadMessages();
            onRefresh();
          }}
        />
      </div>
    </div>
  );
}

