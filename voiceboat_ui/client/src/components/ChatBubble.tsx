import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  sender: "user" | "bot";
  timestamp?: number;
}

export default function ChatBubble({ message, sender, timestamp }: ChatBubbleProps) {
  const isUser = sender === "user";
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm",
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        )}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        {time && (
          <p className={cn("text-xs mt-1", isUser ? "text-blue-100" : "text-gray-500")}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
