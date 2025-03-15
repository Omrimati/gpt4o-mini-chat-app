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
  console.log("[DEBUG] SystemPromptProvider initializing");
  
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
    console.log("[DEBUG] SystemPromptProvider: Loading from localStorage");
    
    try {
      const savedPrompt = localStorage.getItem("systemPrompt");
      if (savedPrompt) {
        console.log("[DEBUG] Found saved system prompt in localStorage, length:", savedPrompt.length);
        console.log("[DEBUG] Saved prompt preview:", savedPrompt.substring(0, 50) + "...");
        setSystemPromptInternal(savedPrompt);
      } else {
        console.log("[DEBUG] No saved system prompt found, using default");
      }
      
      const savedEnabled = localStorage.getItem("systemPromptEnabled");
      if (savedEnabled !== null) {
        const isEnabled = savedEnabled === "true";
        console.log("[DEBUG] System prompt enabled status from localStorage:", isEnabled);
        setIsSystemPromptEnabled(isEnabled);
      } else {
        console.log("[DEBUG] No saved enabled status found, defaulting to enabled");
      }
    } catch (error) {
      console.error("[DEBUG] Error loading system prompt from localStorage:", error);
    }
  }, []);
  
  // Save system prompt to localStorage whenever it changes
  const setSystemPrompt = (prompt: string) => {
    console.log("[DEBUG] Setting new system prompt, length:", prompt.length);
    console.log("[DEBUG] New prompt preview:", prompt.substring(0, 50) + "...");
    setSystemPromptInternal(prompt);
    try {
      localStorage.setItem("systemPrompt", prompt);
      console.log("[DEBUG] Saved system prompt to localStorage");
    } catch (error) {
      console.error("[DEBUG] Error saving system prompt to localStorage:", error);
    }
  };
  
  // Toggle system prompt on/off
  const toggleSystemPrompt = () => {
    const newValue = !isSystemPromptEnabled;
    console.log("[DEBUG] Toggling system prompt enabled to:", newValue);
    setIsSystemPromptEnabled(newValue);
    try {
      localStorage.setItem("systemPromptEnabled", String(newValue));
      console.log("[DEBUG] Saved system prompt enabled status to localStorage");
    } catch (error) {
      console.error("[DEBUG] Error saving system prompt enabled status to localStorage:", error);
    }
  };
  
  // Select a predefined prompt
  const selectPredefinedPrompt = (key: string) => {
    console.log("[DEBUG] Selecting predefined prompt:", key);
    if (predefinedPrompts[key]) {
      setSystemPrompt(predefinedPrompts[key]);
      console.log("[DEBUG] Set predefined prompt:", key);
    } else {
      console.warn("[DEBUG] Predefined prompt key not found:", key);
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