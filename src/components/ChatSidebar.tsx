"use client";

import { useChat } from "@/lib/contexts/ChatContext";
import { MessageSquarePlus, Trash2, Menu, X, Plus, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { SystemPromptSettings } from "./SystemPromptSettings";

interface ChatSidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isMobile, isOpen, onToggle }: ChatSidebarProps) {
  const { chats, currentChat, createNewChat, selectChat, deleteChat } = useChat();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showSystemPromptSettings, setShowSystemPromptSettings] = useState(false);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onToggle();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, onToggle]);
  
  // Sort chats by date (newest first)
  const sortedChats = [...chats].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20" />
      )}
      
      {/* System Prompt Settings Modal */}
      {showSystemPromptSettings && (
        <SystemPromptSettings onClose={() => setShowSystemPromptSettings(false)} />
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed md:relative z-30 flex flex-col h-full w-[260px] bg-[#202123]
          transition-transform duration-300 ease-in-out
          ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={createNewChat}
            className="flex items-center justify-center gap-2 w-full py-3 px-3 rounded-md border border-white/20 text-white hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </button>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          <div className="text-xs text-gray-400 font-medium uppercase px-2 py-2">
            Previous {sortedChats.length > 0 ? sortedChats.length : ''} chats
          </div>
          
          {sortedChats.length === 0 ? (
            <div className="px-2 py-2 text-gray-400 text-sm">
              No chats yet. Start a new chat!
            </div>
          ) : (
            <ul className="space-y-1">
              {sortedChats.map((chat) => (
                <li key={chat.id} className="group">
                  <button
                    onClick={() => selectChat(chat.id)}
                    className={`
                      flex items-center justify-between w-full px-3 py-3 text-sm rounded-md
                      ${currentChat?.id === chat.id 
                        ? "bg-[#343541]/90" 
                        : "hover:bg-[#2A2B32]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquarePlus className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate text-left font-medium">
                        {chat.title}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded-md"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-white/20 p-2">
          <div className="flex flex-col space-y-2">
            {/* System Prompt Settings Button */}
            <button
              onClick={() => setShowSystemPromptSettings(true)}
              className="flex items-center gap-3 px-3 py-3 text-sm rounded-md hover:bg-[#2A2B32] transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              <span>System Prompt Settings</span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 px-3 py-3 text-sm rounded-md hover:bg-[#2A2B32] cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-medium">U</span>
                </div>
                <span>User</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile toggle button */}
      {isMobile && !isOpen && (
        <button
          onClick={onToggle}
          className="fixed z-20 left-4 top-4 p-2 bg-[#202123] rounded-md shadow-md"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  );
} 