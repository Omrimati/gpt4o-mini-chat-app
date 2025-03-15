"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ChatSidebar } from "./ChatSidebar";
import { ChatInterface } from "./ChatInterface";

export function ChatLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if the screen is mobile-sized on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Listen for window resize
    window.addEventListener("resize", checkIsMobile);
    
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);
  
  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen w-full bg-[#343541] text-white">
      {/* Chat Sidebar */}
      <ChatSidebar 
        isMobile={isMobile} 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {/* Centered chat container */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
} 