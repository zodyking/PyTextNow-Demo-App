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
} from "@heroui/react";
import { User, X } from "lucide-react";

interface ContactNameEditorProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  currentName: string;
  onSave: (phoneNumber: string, name: string) => void;
}

export function ContactNameEditor({
  isOpen,
  onClose,
  phoneNumber,
  currentName,
  onSave,
}: ContactNameEditorProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  const handleSave = () => {
    onSave(phoneNumber, name.trim());
    onClose();
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
              Edit Contact Name
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                  <p className="text-white font-mono">{phoneNumber}</p>
                </div>
                <Input
                  label="Friendly Name"
                  placeholder="Enter a name for this contact"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  startContent={<User className="w-4 h-4 text-gray-400" />}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSave();
                    }
                  }}
                />
              </div>
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
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}


