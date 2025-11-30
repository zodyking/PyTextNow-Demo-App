"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { Phone, X } from "lucide-react";

interface NewMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (number: string) => void;
}

export function NewMessageDialog({
  isOpen,
  onClose,
  onStartConversation,
}: NewMessageDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleStart = () => {
    if (phoneNumber.trim()) {
      // Normalize phone number (remove formatting)
      const normalized = phoneNumber.replace(/\D/g, "");
      onStartConversation(normalized);
      setPhoneNumber("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              New Message
            </ModalHeader>
            <ModalBody>
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                startContent={<Phone className="w-4 h-4 text-gray-400" />}
                classNames={{
                  input: "text-white",
                  label: "text-gray-400",
                  inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleStart();
                  }
                }}
              />
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
                onPress={handleStart}
                className="bg-electric-500 text-white"
                isDisabled={!phoneNumber.trim()}
              >
                Start Conversation
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}


