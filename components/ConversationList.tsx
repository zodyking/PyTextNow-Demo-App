"use client";

import { useState } from "react";
import { Button, Avatar, Chip } from "@heroui/react";
import { MessageSquare, RefreshCw, Edit2 } from "lucide-react";
import { ContactNameEditor } from "./ContactNameEditor";
import { formatPhoneNumber, getDisplayName } from "@/utils/phoneFormatter";

interface Conversation {
  id: string;
  number: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  lastMediaUrl?: string | null;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  onRefresh: () => void;
  user?: {
    sidCookie: string;
    csrfCookie: string;
  };
  friendlyNames?: Record<string, string>;
  onSaveFriendlyName?: (phoneNumber: string, name: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onRefresh,
  user,
  friendlyNames = {},
  onSaveFriendlyName,
}: ConversationListProps) {
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        <Button
          variant="light"
          size="sm"
          className="w-full justify-start text-electric-500 mb-2"
          onPress={onRefresh}
          startContent={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`w-full p-3 rounded-lg cursor-pointer group ${
                selectedConversation === conversation.id
                  ? "bg-electric-500/20 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center gap-3 w-full">
                {conversation.lastMediaUrl && conversation.lastMediaUrl.startsWith("https://media.textnow.com") ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                    <img
                      src={user ? `/api/media-proxy?url=${encodeURIComponent(conversation.lastMediaUrl)}&sid=${encodeURIComponent(user.sidCookie)}&csrf=${encodeURIComponent(user.csrfCookie)}` : conversation.lastMediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to direct URL if proxy fails
                        if (user && e.currentTarget.src !== conversation.lastMediaUrl) {
                          e.currentTarget.src = conversation.lastMediaUrl;
                        } else {
                          e.currentTarget.style.display = "none";
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Avatar
                    name={conversation.number.slice(-4)}
                    className="bg-electric-500 text-white"
                    size="sm"
                  />
                )}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <p 
                        className="font-semibold text-sm truncate cursor-pointer hover:text-electric-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSaveFriendlyName) {
                            setEditingContact(conversation.number);
                          }
                        }}
                        title="Click to edit name"
                      >
                        {getDisplayName(conversation.number, friendlyNames)}
                      </p>
                      {onSaveFriendlyName && (
                        <button
                          type="button"
                          className="text-gray-500 hover:text-electric-400 min-w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingContact(conversation.number);
                          }}
                          aria-label="Edit contact name"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <Chip
                        size="sm"
                        className="bg-electric-500 text-white ml-2"
                      >
                        {conversation.unread}
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Name Editor Modal */}
      {onSaveFriendlyName && editingContact && (
        <ContactNameEditor
          isOpen={!!editingContact}
          onClose={() => setEditingContact(null)}
          phoneNumber={editingContact}
          currentName={friendlyNames[editingContact] || ""}
          onSave={(phone, name) => {
            onSaveFriendlyName(phone, name);
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
}

