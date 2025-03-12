"use client";

import { useEffect, useState } from "react";

export function TypingAnimation() {
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center space-x-1">
      <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse delay-150"></div>
      <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse delay-300"></div>
    </div>
  );
} 