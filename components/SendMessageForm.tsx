"use client";

import { useState, useRef } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Send, Image as ImageIcon, Mic, X, Sparkles } from "lucide-react";

interface SendMessageFormProps {
  number: string;
  user: {
    textnowUsername: string;
    sidCookie: string;
    csrfCookie: string;
    geminiApiKey?: string;
  };
  onMessageSent: () => void;
}

export function SendMessageForm({
  number,
  user,
  onMessageSent,
}: SendMessageFormProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isVoice, setIsVoice] = useState(false);
  const [showAIVoice, setShowAIVoice] = useState(false);
  const [aiText, setAiText] = useState("");
  const [accent, setAccent] = useState("american");
  const [mood, setMood] = useState("neutral");
  const [tone, setTone] = useState("conversational");
  const [voice, setVoice] = useState("Zephyr");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const handleSendSMS = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number,
          message,
          username: user.textnowUsername,
          sidCookie: user.sidCookie,
          csrfCookie: user.csrfCookie,
        }),
      });

      if (response.ok) {
        setMessage("");
        onMessageSent();
      } else {
        let errorMessage = "Failed to send message";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAIVoice = async () => {
    if (!aiText.trim() || !user.geminiApiKey) {
      alert("Please enter text and configure your Gemini API key in settings");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Generate TTS audio using Gemini
      const ttsResponse = await fetch("/api/gemini-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiText,
          apiKey: user.geminiApiKey,
          voice,
          accent,
          mood,
          tone,
        }),
      });

      if (!ttsResponse.ok) {
        let errorMessage = "Failed to generate AI voice";
        try {
          const error = await ttsResponse.json();
          errorMessage = error.error || errorMessage;
        } catch {
          const errorText = await ttsResponse.text();
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
        setLoading(false);
        return;
      }

      // Step 2: Wait for and convert audio blob to File (WAV format from PCM conversion)
      // Ensure we fully wait for the blob to be loaded before proceeding
      const audioBlob = await ttsResponse.blob();
      
      // Verify blob is valid and has data
      if (!audioBlob || audioBlob.size === 0) {
        alert("Received empty audio file from Gemini API");
        setLoading(false);
        return;
      }
      
      const audioFile = new File([audioBlob], "ai-voice.wav", {
        type: "audio/wav",
      });

      // Step 3: Send as voice message (only after audio is fully loaded)
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("number", number);
      formData.append("username", user.textnowUsername);
      formData.append("sidCookie", user.sidCookie);
      formData.append("csrfCookie", user.csrfCookie);

      const voiceResponse = await fetch("/api/send-voice", {
        method: "POST",
        body: formData,
      });

      if (voiceResponse.ok) {
        setAiText("");
        setShowAIVoice(false);
        onMessageSent();
      } else {
        let errorMessage = "Failed to send AI voice message";
        try {
          const error = await voiceResponse.json();
          errorMessage = error.error || errorMessage;
        } catch {
          const errorText = await voiceResponse.text();
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error sending AI voice:", error);
      alert("Failed to send AI voice message");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    // Check if AI voice mode is active
    if (showAIVoice) {
      await handleSendAIVoice();
      return;
    }

    console.log("handleSend called:", {
      isVoice,
      hasSelectedFile: !!selectedFile,
      selectedFileType: selectedFile?.type,
      selectedFileName: selectedFile?.name,
      hasMessage: !!message.trim(),
    });

    // Auto-detect message type
    if (isVoice && selectedFile) {
      console.log("Sending as VOICE message");
      await handleSendVoice(selectedFile);
      return;
    }

    if (selectedFile && !isVoice) {
      console.log("Sending as MMS message");
      await handleSendMMS();
      return;
    }

    // Plain SMS
    if (message.trim()) {
      console.log("Sending as SMS message");
      await handleSendSMS();
    }
  };

  const handleSendMMS = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      // Step 1: Send the image first (without message)
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("number", number);
      formData.append("message", ""); // Send image without message first
      formData.append("username", user.textnowUsername);
      formData.append("sidCookie", user.sidCookie);
      formData.append("csrfCookie", user.csrfCookie);

      const response = await fetch("/api/send-mms", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to send MMS";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
        setLoading(false);
        return;
      }

      // Step 2: If there's a message, wait 10 seconds then send it as SMS
      if (message.trim()) {
        // Wait 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10000));

        // Send the message as SMS
        const smsResponse = await fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number,
            message: message.trim(),
            username: user.textnowUsername,
            sidCookie: user.sidCookie,
            csrfCookie: user.csrfCookie,
          }),
        });

        if (!smsResponse.ok) {
          console.error("Failed to send follow-up message");
          // Don't alert here, image was sent successfully
        }
      }

      // Clear form
      setMessage("");
      setSelectedFile(null);
      setFilePreview(null);
      setIsVoice(false);
      onMessageSent();
    } catch (error) {
      console.error("Error sending MMS:", error);
      alert("Failed to send MMS");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVoice = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("number", number);
      formData.append("username", user.textnowUsername);
      formData.append("sidCookie", user.sidCookie);
      formData.append("csrfCookie", user.csrfCookie);

      const response = await fetch("/api/send-voice", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        setSelectedFile(null);
        setFilePreview(null);
        setIsVoice(false);
        onMessageSent();
      } else {
        let errorMessage = "Failed to send voice message";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error sending voice:", error);
      alert("Failed to send voice message");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine which input was used based on the accept attribute or file type
    const isFromVoiceInput = e.target === voiceInputRef.current;
    const isAudioFile = file.type.startsWith("audio/");
    const isImageFile = file.type.startsWith("image/");
    const isVideoFile = file.type.startsWith("video/");

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      isFromVoiceInput,
      isAudioFile,
      isImageFile,
      isVideoFile,
    });

    // If it's from voice input OR it's an audio file, treat as voice
    if (isFromVoiceInput || isAudioFile) {
      setIsVoice(true);
      setSelectedFile(file);
      setFilePreview(null);
    } else if (isImageFile || isVideoFile) {
      // It's an image or video - treat as MMS
      setIsVoice(false);
      setSelectedFile(file);
      // Create preview URL for images
      if (isImageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    } else {
      // Unknown file type - default to MMS
      console.warn("Unknown file type, defaulting to MMS:", file.type);
      setIsVoice(false);
      setSelectedFile(file);
      setFilePreview(null);
    }
    
    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (voiceInputRef.current) {
      voiceInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setIsVoice(false);
  };

  return (
    <div className="space-y-3">
      {/* AI Voice Message Panel */}
      {showAIVoice && (
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-500" />
              <span className="text-sm font-semibold text-white">AI Voice Message</span>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-400 hover:text-red-400"
              onPress={() => {
                setShowAIVoice(false);
                setAiText("");
              }}
              aria-label="Close AI voice"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Input
            placeholder="Type your message for AI voice..."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            size="sm"
            classNames={{
              input: "text-white text-sm focus:outline-none",
              inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
            }}
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select
              label="Voice"
              selectedKeys={[voice]}
              onSelectionChange={(keys) => setVoice(Array.from(keys)[0] as string)}
              size="sm"
              classNames={{
                trigger: "bg-[#0a0a0a] border-gray-700",
                label: "text-gray-400",
                value: "text-white text-xs",
              }}
            >
              <SelectItem key="Zephyr">Zephyr (Bright)</SelectItem>
              <SelectItem key="Puck">Puck (Upbeat)</SelectItem>
              <SelectItem key="Charon">Charon (Informative)</SelectItem>
              <SelectItem key="Kore">Kore (Firm)</SelectItem>
              <SelectItem key="Fenrir">Fenrir (Excitable)</SelectItem>
              <SelectItem key="Leda">Leda (Youthful)</SelectItem>
              <SelectItem key="Orus">Orus (Firm)</SelectItem>
              <SelectItem key="Aoede">Aoede (Breezy)</SelectItem>
              <SelectItem key="Callirrhoe">Callirrhoe (Easy-going)</SelectItem>
              <SelectItem key="Autonoe">Autonoe (Bright)</SelectItem>
              <SelectItem key="Enceladus">Enceladus (Breathy)</SelectItem>
              <SelectItem key="Iapetus">Iapetus (Clear)</SelectItem>
              <SelectItem key="Umbriel">Umbriel (Easy-going)</SelectItem>
              <SelectItem key="Algieba">Algieba (Smooth)</SelectItem>
              <SelectItem key="Despina">Despina (Smooth)</SelectItem>
              <SelectItem key="Erinome">Erinome (Clear)</SelectItem>
              <SelectItem key="Algenib">Algenib (Gravelly)</SelectItem>
              <SelectItem key="Rasalgethi">Rasalgethi (Informative)</SelectItem>
              <SelectItem key="Laomedeia">Laomedeia (Upbeat)</SelectItem>
              <SelectItem key="Achernar">Achernar (Soft)</SelectItem>
              <SelectItem key="Alnilam">Alnilam (Firm)</SelectItem>
              <SelectItem key="Schedar">Schedar (Even)</SelectItem>
              <SelectItem key="Gacrux">Gacrux (Mature)</SelectItem>
              <SelectItem key="Pulcherrima">Pulcherrima (Forward)</SelectItem>
              <SelectItem key="Achird">Achird (Friendly)</SelectItem>
              <SelectItem key="Zubenelgenubi">Zubenelgenubi (Casual)</SelectItem>
              <SelectItem key="Vindemiatrix">Vindemiatrix (Gentle)</SelectItem>
              <SelectItem key="Sadachbia">Sadachbia (Lively)</SelectItem>
              <SelectItem key="Sadaltager">Sadaltager (Knowledgeable)</SelectItem>
              <SelectItem key="Sulafat">Sulafat (Warm)</SelectItem>
            </Select>
            
            <Select
              label="Accent"
              selectedKeys={[accent]}
              onSelectionChange={(keys) => setAccent(Array.from(keys)[0] as string)}
              size="sm"
              classNames={{
                trigger: "bg-[#0a0a0a] border-gray-700",
                label: "text-gray-400",
                value: "text-white text-xs",
              }}
            >
              <SelectItem key="american">American</SelectItem>
              <SelectItem key="british">British</SelectItem>
              <SelectItem key="australian">Australian</SelectItem>
              <SelectItem key="canadian">Canadian</SelectItem>
              <SelectItem key="indian">Indian</SelectItem>
              <SelectItem key="jamaican">Jamaican</SelectItem>
              <SelectItem key="irish">Irish</SelectItem>
              <SelectItem key="scottish">Scottish</SelectItem>
              <SelectItem key="south-african">South African</SelectItem>
              <SelectItem key="new-zealand">New Zealand</SelectItem>
              <SelectItem key="spanish">Spanish</SelectItem>
              <SelectItem key="french">French</SelectItem>
              <SelectItem key="german">German</SelectItem>
              <SelectItem key="italian">Italian</SelectItem>
            </Select>
            
            <Select
              label="Mood"
              selectedKeys={[mood]}
              onSelectionChange={(keys) => setMood(Array.from(keys)[0] as string)}
              size="sm"
              classNames={{
                trigger: "bg-[#0a0a0a] border-gray-700",
                label: "text-gray-400",
                value: "text-white text-xs",
              }}
            >
              <SelectItem key="neutral">Neutral</SelectItem>
              <SelectItem key="happy">Happy</SelectItem>
              <SelectItem key="sad">Sad</SelectItem>
              <SelectItem key="excited">Excited</SelectItem>
              <SelectItem key="calm">Calm</SelectItem>
              <SelectItem key="energetic">Energetic</SelectItem>
              <SelectItem key="melancholic">Melancholic</SelectItem>
              <SelectItem key="cheerful">Cheerful</SelectItem>
              <SelectItem key="serious">Serious</SelectItem>
              <SelectItem key="playful">Playful</SelectItem>
              <SelectItem key="romantic">Romantic</SelectItem>
              <SelectItem key="nostalgic">Nostalgic</SelectItem>
              <SelectItem key="confident">Confident</SelectItem>
              <SelectItem key="anxious">Anxious</SelectItem>
              <SelectItem key="relaxed">Relaxed</SelectItem>
              <SelectItem key="passionate">Passionate</SelectItem>
              <SelectItem key="mysterious">Mysterious</SelectItem>
              <SelectItem key="optimistic">Optimistic</SelectItem>
              <SelectItem key="pessimistic">Pessimistic</SelectItem>
              <SelectItem key="grateful">Grateful</SelectItem>
              <SelectItem key="apologetic">Apologetic</SelectItem>
            </Select>
            
            <Select
              label="Tone"
              selectedKeys={[tone]}
              onSelectionChange={(keys) => setTone(Array.from(keys)[0] as string)}
              size="sm"
              classNames={{
                trigger: "bg-[#0a0a0a] border-gray-700",
                label: "text-gray-400",
                value: "text-white text-xs",
              }}
            >
              <SelectItem key="conversational">Conversational</SelectItem>
              <SelectItem key="formal">Formal</SelectItem>
              <SelectItem key="casual">Casual</SelectItem>
              <SelectItem key="friendly">Friendly</SelectItem>
              <SelectItem key="professional">Professional</SelectItem>
            </Select>
          </div>
          
          {!user.geminiApiKey && (
            <p className="text-xs text-yellow-400">
              ⚠️ Please configure your Gemini API key in Settings
            </p>
          )}
        </div>
      )}

      {/* File Preview */}
      {selectedFile && !showAIVoice && (
        <div className="relative bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="absolute top-2 right-2 text-gray-400 hover:text-red-400 z-10"
            onPress={handleRemoveFile}
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </Button>
          {isVoice ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-electric-500/20 flex items-center justify-center">
                <Mic className="w-6 h-6 text-electric-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Voice Message
                </p>
              </div>
            </div>
          ) : filePreview ? (
            <div className="mb-2">
              <img
                src={filePreview}
                alt="Preview"
                className="max-w-full max-h-48 rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="mb-2 text-sm text-gray-400">
              File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
      )}

      {/* Message Input - Hidden when AI Voice is active */}
      {!showAIVoice && (
        <div className="flex gap-2">
          <Input
            placeholder={selectedFile ? (isVoice ? "Voice message ready to send..." : "Optional message...") : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            size="sm"
            classNames={{
              input: "text-white text-sm focus:outline-none",
              inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
            }}
          />
        
          {/* File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={voiceInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex gap-1">
            {!selectedFile && (
              <>
                <Button
                  isIconOnly
                  variant="bordered"
                  size="sm"
                  className="border-electric-500 text-electric-500"
                  onPress={() => fileInputRef.current?.click()}
                  aria-label="Attach image or video"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="bordered"
                  size="sm"
                  className="border-electric-500 text-electric-500"
                  onPress={() => voiceInputRef.current?.click()}
                  aria-label="Attach voice message"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="bordered"
                  size="sm"
                  className="border-electric-500 text-electric-500"
                  onPress={() => {
                    if (!user.geminiApiKey) {
                      alert("Please configure your Gemini API key in Settings → AI Settings");
                      return;
                    }
                    setShowAIVoice(true);
                  }}
                  aria-label="AI voice message"
                  title="AI Voice Message"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              color="primary"
              isIconOnly
              size="sm"
              className="bg-electric-500 text-white min-w-10"
              onPress={handleSend}
              isLoading={loading}
              isDisabled={(!message.trim() && !selectedFile)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Send Button for AI Voice - Only visible when AI Voice is active */}
      {showAIVoice && (
        <div className="flex justify-end">
          <Button
            color="primary"
            size="sm"
            className="bg-electric-500 text-white"
            onPress={handleSend}
            isLoading={loading}
            isDisabled={!aiText.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            Send AI Voice
          </Button>
        </div>
      )}
    </div>
  );
}

