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
    <div className="flex items-center space-x-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse delay-150"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse delay-300"></div>
    </div>
  );
} 