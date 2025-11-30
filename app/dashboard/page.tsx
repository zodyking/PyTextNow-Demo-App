"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Mic,
  LogOut,
  User,
  Search,
  Settings,
} from "lucide-react";
import { ConversationList } from "@/components/ConversationList";
import { MessageView } from "@/components/MessageView";
import { SendMessageForm } from "@/components/SendMessageForm";
import { NewMessageDialog } from "@/components/NewMessageDialog";
import { UserSettings } from "@/components/UserSettings";

interface User {
  id: string;
  username: string;
  textnowUsername: string;
  sidCookie: string;
  csrfCookie: string;
  geminiApiKey?: string;
}

interface Conversation {
  id: string;
  number: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendlyNames, setFriendlyNames] = useState<Record<string, string>>({});
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("textnow_user");
      if (!userData) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadConversations();
      loadFriendlyNames();
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadFriendlyNames = () => {
    try {
      const saved = localStorage.getItem("textnow_friendly_names");
      if (saved) {
        setFriendlyNames(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load friendly names:", error);
    }
  };

  const saveFriendlyName = (phoneNumber: string, name: string) => {
    try {
      const updated = { ...friendlyNames };
      if (name.trim()) {
        updated[phoneNumber] = name.trim();
      } else {
        delete updated[phoneNumber];
      }
      setFriendlyNames(updated);
      localStorage.setItem("textnow_friendly_names", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save friendly name:", error);
    }
  };

  const handleStartNewConversation = (number: string) => {
    setSelectedConversation(number);
  };

  const handleSaveUserSettings = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const loadConversations = async () => {
    try {
      const userData = localStorage.getItem("textnow_user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.textnowUsername,
          sidCookie: user.sidCookie,
          csrfCookie: user.csrfCookie,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const loadedConversations = data.conversations || [];
        console.log("Loaded conversations:", loadedConversations.length);
        setConversations(loadedConversations);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to load conversations:", errorData);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("textnow_user");
    router.push("/");
  };

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    const numberMatch = conv.number.includes(searchQuery);
    const nameMatch = friendlyNames[conv.number]?.toLowerCase().includes(searchLower);
    return numberMatch || nameMatch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">PyTextNow</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              color="primary"
              className="bg-electric-500 text-white"
              onPress={() => setShowNewMessage(true)}
            >
              New Message
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  className="text-white"
                  aria-label="User menu"
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User actions"
                className="bg-[#1a1a1a] border border-gray-800"
              >
                <DropdownItem
                  key="profile"
                  className="text-white hover:bg-gray-800"
                  startContent={<User className="w-4 h-4" />}
                >
                  {user.username}
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  className="text-white hover:bg-gray-800"
                  startContent={<Settings className="w-4 h-4" />}
                  onPress={() => setShowSettings(true)}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-red-400 hover:bg-red-500/10"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={handleLogout}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar - Conversations List */}
        <div className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-80 bg-[#0a0a0a] border-r border-gray-800 flex flex-col min-w-0`}>
          <div className="p-4 border-b border-gray-800 flex-shrink-0">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{
                input: "text-white",
                inputWrapper: "bg-[#1a1a1a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
              }}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onRefresh={loadConversations}
            user={user}
            friendlyNames={friendlyNames}
            onSaveFriendlyName={saveFriendlyName}
          />
        </div>

        {/* Main Content - Message View */}
        <div className={`${
          selectedConversation ? "flex" : "hidden md:flex"
        } flex-1 flex flex-col bg-black min-w-0`}>
          {selectedConversation ? (
            <MessageView
              conversationId={selectedConversation}
              user={user}
              onRefresh={loadConversations}
              onBack={() => setSelectedConversation(null)}
              friendlyNames={friendlyNames}
              onSaveFriendlyName={saveFriendlyName}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-gray-800 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-center text-xs text-gray-500">
          <p>
            Developed by{" "}
            <a
              href="https://github.com/zodyking?tab=overview&from=2025-11-01&to=2025-11-29"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400 transition-colors no-underline"
            >
              Zody King
            </a>{" "}
            2025
          </p>
        </div>
      </footer>

      {/* New Message Dialog */}
      <NewMessageDialog
        isOpen={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        onStartConversation={handleStartNewConversation}
      />

      {/* User Settings Modal */}
      {user && (
        <UserSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          user={user}
          onSave={handleSaveUserSettings}
        />
      )}
    </div>
  );
}

