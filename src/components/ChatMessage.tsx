"use client";

import { useRef, useEffect } from "react";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === "user";
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Scroll into view when a new message is added
  useEffect(() => {
    if (isLast && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLast, message]);
  
  // Ensure content is not empty
  const content = typeof message.content === 'string' && message.content.trim() 
    ? message.content 
    : isUser ? "..." : "I'm thinking...";
  
  return (
    <div 
      ref={messageRef}
      className="flex items-start gap-4"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center">
        {isUser ? (
          <div className="bg-[#5436DA] w-full h-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="bg-[#10A37F] w-full h-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      
      {/* Message content */}
      <div className="flex-1 overflow-hidden">
        <div className="prose prose-invert max-w-none">
          {typeof content === "string" ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            // Fallback for non-string content
            <div>{String(content)}</div>
          )}
        </div>
      </div>
    </div>
  );
} 