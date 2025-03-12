"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);
  
  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="relative">
      <div className="relative rounded-xl border border-white/10 bg-[#40414F] shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message GPT-4o mini..."
          rows={1}
          className="w-full py-3 pl-4 pr-12 max-h-[120px] resize-none bg-transparent border-0 outline-none focus:ring-0 text-white rounded-xl"
          disabled={isLoading}
        />
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className={`absolute right-2 bottom-2 p-1 rounded-md ${
            message.trim() && !isLoading
              ? "text-white hover:bg-white/10"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 16 16" 
            fill="none" 
            className="h-4 w-4 m-1"
            strokeWidth="2"
          >
            <path 
              d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" 
              fill="currentColor"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
} 