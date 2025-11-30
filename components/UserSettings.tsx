"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
} from "@heroui/react";
import { Settings, User, Key, Cookie, Save, X } from "lucide-react";

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    textnowUsername: string;
    sidCookie: string;
    csrfCookie: string;
    geminiApiKey?: string;
  };
  onSave: (updatedUser: any) => void;
}

export function UserSettings({
  isOpen,
  onClose,
  user,
  onSave,
}: UserSettingsProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    textnowUsername: user.textnowUsername,
    sidCookie: user.sidCookie,
    csrfCookie: user.csrfCookie,
    geminiApiKey: user.geminiApiKey || "",
  });

  useEffect(() => {
    setFormData({
      username: user.username,
      textnowUsername: user.textnowUsername,
      sidCookie: user.sidCookie,
      csrfCookie: user.csrfCookie,
      geminiApiKey: user.geminiApiKey || "",
    });
  }, [user, isOpen]);

  const handleSave = async () => {
    try {
      // Update user in database via API
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: formData.username,
          textnowUsername: formData.textnowUsername,
          sidCookie: formData.sidCookie,
          csrfCookie: formData.csrfCookie,
          geminiApiKey: formData.geminiApiKey || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update user settings");
        return;
      }

      // Update current user in localStorage
      localStorage.setItem("textnow_user", JSON.stringify(data.user));
      onSave(data.user);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user settings");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "bg-[#1a1a1a] border border-gray-800",
        header: "border-b border-gray-800",
        body: "py-4",
        footer: "border-t border-gray-800",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-white">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span>User Settings</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <Tabs
                aria-label="Settings tabs"
                classNames={{
                  tabList: "bg-[#0a0a0a] border border-gray-800",
                  tab: "text-gray-400 data-[selected=true]:text-electric-500",
                  panel: "p-0 mt-4",
                }}
              >
                <Tab key="account" title="Account">
                  <div className="space-y-4">
                    <Input
                      label="Username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      startContent={<User className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        input: "text-white",
                        label: "text-gray-400",
                        inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                      }}
                    />
                  </div>
                </Tab>

                <Tab key="api" title="API Settings">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400 mb-4">
                      Update your TextNow API credentials. These are required to send and receive messages.
                    </p>
                    <Input
                      label="TextNow Username"
                      value={formData.textnowUsername}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          textnowUsername: e.target.value,
                        })
                      }
                      startContent={<User className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        input: "text-white",
                        label: "text-gray-400",
                        inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                      }}
                    />
                    <Textarea
                      label="Connect.sid Cookie"
                      value={formData.sidCookie}
                      onChange={(e) =>
                        setFormData({ ...formData, sidCookie: e.target.value })
                      }
                      minRows={2}
                      startContent={<Cookie className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        input: "text-white",
                        label: "text-gray-400",
                        inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                      }}
                    />
                    <Input
                      label="CSRF Cookie"
                      value={formData.csrfCookie}
                      onChange={(e) =>
                        setFormData({ ...formData, csrfCookie: e.target.value })
                      }
                      startContent={<Key className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        input: "text-white",
                        label: "text-gray-400",
                        inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                      }}
                    />
                  </div>
                </Tab>

                <Tab key="ai" title="AI Settings">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400 mb-4">
                      Configure Gemini AI for voice message generation. Get your API key from Google AI Studio.
                    </p>
                    <Input
                      label="Gemini API Key"
                      type="password"
                      value={formData.geminiApiKey}
                      onChange={(e) =>
                        setFormData({ ...formData, geminiApiKey: e.target.value })
                      }
                      placeholder="Enter your Gemini API key"
                      startContent={<Key className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        input: "text-white",
                        label: "text-gray-400",
                        inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Used for AI-generated voice messages using Gemini 2.5 Pro Preview TTS model.
                    </p>
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSave}
                className="bg-electric-500 text-white"
                startContent={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

