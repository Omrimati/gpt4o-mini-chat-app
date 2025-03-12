"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SystemPromptContextType {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  isSystemPromptEnabled: boolean;
  toggleSystemPrompt: () => void;
  predefinedPrompts: Record<string, string>;
  selectPredefinedPrompt: (key: string) => void;
}

const SystemPromptContext = createContext<SystemPromptContextType | undefined>(undefined);

export function SystemPromptProvider({ children }: { children: React.ReactNode }) {
  // Default system prompt with instructions for the AI
  const defaultSystemPrompt = "You are GPT-4o mini, a helpful AI assistant. Your responses should be informative, concise, and accurate.";
  
  // Predefined system prompts for common scenarios
  const predefinedPrompts: Record<string, string> = {
    default: defaultSystemPrompt,
    concise: "You are GPT-4o mini. Provide extremely concise responses using as few words as possible while maintaining clarity.",
    detailed: "You are GPT-4o mini. Provide detailed, comprehensive responses with thorough explanations, examples, and nuanced analysis.",
    friendly: "You are GPT-4o mini, a friendly and conversational assistant. Use a warm, casual tone with simple language and occasional humor.",
    professional: "You are GPT-4o mini, a professional assistant. Maintain formal tone, use precise terminology, and structure responses with clear sections.",
    creative: "You are GPT-4o mini, a creative assistant. Provide imaginative, original responses with vivid descriptions and unique perspectives.",
  };
  
  const [systemPrompt, setSystemPromptInternal] = useState<string>(defaultSystemPrompt);
  const [isSystemPromptEnabled, setIsSystemPromptEnabled] = useState<boolean>(true);
  
  // Load saved system prompt from localStorage on mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem("systemPrompt");
    if (savedPrompt) {
      setSystemPromptInternal(savedPrompt);
    }
    
    const savedEnabled = localStorage.getItem("systemPromptEnabled");
    if (savedEnabled !== null) {
      setIsSystemPromptEnabled(savedEnabled === "true");
    }
  }, []);
  
  // Save system prompt to localStorage whenever it changes
  const setSystemPrompt = (prompt: string) => {
    setSystemPromptInternal(prompt);
    localStorage.setItem("systemPrompt", prompt);
  };
  
  // Toggle system prompt on/off
  const toggleSystemPrompt = () => {
    const newValue = !isSystemPromptEnabled;
    setIsSystemPromptEnabled(newValue);
    localStorage.setItem("systemPromptEnabled", String(newValue));
  };
  
  // Select a predefined prompt
  const selectPredefinedPrompt = (key: string) => {
    if (predefinedPrompts[key]) {
      setSystemPrompt(predefinedPrompts[key]);
    }
  };
  
  return (
    <SystemPromptContext.Provider
      value={{
        systemPrompt,
        setSystemPrompt,
        isSystemPromptEnabled,
        toggleSystemPrompt,
        predefinedPrompts,
        selectPredefinedPrompt,
      }}
    >
      {children}
    </SystemPromptContext.Provider>
  );
}

export function useSystemPrompt() {
  const context = useContext(SystemPromptContext);
  if (context === undefined) {
    throw new Error("useSystemPrompt must be used within a SystemPromptProvider");
  }
  return context;
} 