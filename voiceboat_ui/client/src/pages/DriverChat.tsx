import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ChatBubble from "@/components/ChatBubble";
import VoiceButton from "@/components/VoiceButton";
import VoiceCall from "@/components/VoiceCall";
import { Send, Phone, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: number;
}

export default function DriverChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I'm Voiceboat support. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(`conv-${Date.now()}`);
  const [isEscalated, setIsEscalated] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processVoiceMessage = async (text: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: text,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle response - support both formats
      if (data.message && data.message.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id || `bot-${Date.now()}`,
            sender: "bot",
            text: data.message.text,
            timestamp: data.message.timestamp || Date.now(),
          },
        ]);
      } else if (data.text) {
        // Direct text response format
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: data.text,
            timestamp: Date.now(),
          },
        ]);
      }

      if (data.shouldEscalate || data.needs_escalation) {
        setIsEscalated(true);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "bot",
          text: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: messageText,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle response - support both formats
      if (data.message && data.message.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id || `bot-${Date.now()}`,
            sender: "bot",
            text: data.message.text,
            timestamp: data.message.timestamp || Date.now(),
          },
        ]);
      } else if (data.text) {
        // Direct text response format
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: data.text,
            timestamp: Date.now(),
          },
        ]);
      }

      if (data.shouldEscalate || data.needs_escalation) {
        setIsEscalated(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "bot",
          text: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voiceboat Support</h1>
              <p className="text-gray-600 mt-1">Chat with our AI assistant</p>
            </div>
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Chat Container */}
        <Card className="h-96 md:h-[500px] flex flex-col shadow-lg border-0">
          {/* Escalation Alert */}
          {isEscalated && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">Connecting to an agent</p>
                <p className="text-sm text-amber-700">A support executive will be with you shortly.</p>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                sender={msg.sender}
                timestamp={msg.timestamp}
              />
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                </div>
                <p className="text-gray-500 text-sm">Bot is typing...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Call Section */}
          <div className="border-t border-gray-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Voice Call (Hindi/English)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("en")}
                    className="text-xs"
                  >
                    English
                  </Button>
                  <Button
                    variant={language === "hi" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("hi")}
                    className="text-xs"
                  >
                    हिंदी
                  </Button>
                </div>
              </div>
              <VoiceCall
                conversationId={conversationId}
                language={language}
                onTranscript={(text) => {
                  // Voice-only mode - don't add to chat
                  // Only for internal processing
                }}
                onResponse={(text) => {
                  // Voice-only mode - don't add to chat
                  // Bot speaks, doesn't show text
                }}
              />
            </div>
          </div>

          {/* Text Input Area */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex gap-2 items-center">
              <VoiceButton
                conversationId={conversationId}
                onTranscript={(text) => {
                  const userMessage: Message = {
                    id: `voice-user-${Date.now()}`,
                    sender: "user",
                    text: text,
                    timestamp: Date.now(),
                  };
                  setMessages((prev) => [...prev, userMessage]);
                  processVoiceMessage(text);
                }}
                onResponse={(text) => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `voice-bot-${Date.now()}`,
                      sender: "bot",
                      text: text,
                      timestamp: Date.now(),
                    },
                  ]);
                }}
              />
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={loading || isEscalated}
                className="flex-1 rounded-lg border-gray-300"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim() || isEscalated}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Available 24/7 • Typically responds in seconds</p>
        </div>
      </div>
    </div>
  );
}
