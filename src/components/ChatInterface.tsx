"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { TypingAnimation } from "./TypingAnimation";
import { useChat } from "@/lib/contexts/ChatContext";
import { useSystemPrompt } from "@/lib/contexts/SystemPromptContext";
import { Message } from "ai";

export function ChatInterface() {
  const {
    currentChat,
    updateChatMessages,
  } = useChat();
  
  const { systemPrompt, isSystemPromptEnabled } = useSystemPrompt();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Log system prompt status on mount and when it changes
  useEffect(() => {
    console.log("[DEBUG] System prompt status:", isSystemPromptEnabled ? "enabled" : "disabled");
    if (isSystemPromptEnabled && systemPrompt) {
      console.log("[DEBUG] System prompt content preview:", systemPrompt.substring(0, 50) + "...");
    }
  }, [systemPrompt, isSystemPromptEnabled]);
  
  // Sync messages with chat context
  useEffect(() => {
    console.log("[DEBUG] Chat context updated, messages count:", currentChat?.messages.length || 0);
    if (currentChat && currentChat.messages.length > 0) {
      setMessages(currentChat.messages);
    } else {
      setMessages([]);
    }
  }, [currentChat]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    console.log("[DEBUG] Sending message:", content.substring(0, 50) + (content.length > 50 ? "..." : ""));
    
    try {
      // Create a user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content,
      };
      
      // Update messages with the new user message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      console.log("[DEBUG] Updated messages array with user message, count:", updatedMessages.length);
      
      // Update chat context
      if (currentChat) {
        updateChatMessages(currentChat.id, updatedMessages);
        console.log("[DEBUG] Updated chat context with user message");
      }
      
      // Set loading state
      setIsLoading(true);
      setError(null); // Clear any previous errors
      console.log("[DEBUG] Set loading state, cleared previous errors");
      
      // Create a temporary assistant message for streaming
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };
      
      // Add the assistant message to the UI
      setMessages(prev => [...prev, assistantMessage]);
      console.log("[DEBUG] Added temporary assistant message to UI");
      
      // Send to API
      try {
        console.log("[DEBUG] Preparing API request");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        console.log("[DEBUG] Set request timeout to 30 seconds");
        
        // Prepare messages for API, including system prompt if enabled
        const apiMessages = isSystemPromptEnabled && systemPrompt
          ? [{ role: "system", content: systemPrompt } as Message, ...updatedMessages]
          : updatedMessages;
        
        console.log("[DEBUG] API messages prepared:", { 
          count: apiMessages.length, 
          hasSystemPrompt: isSystemPromptEnabled && systemPrompt ? "yes" : "no",
          firstMessageRole: apiMessages[0]?.role || "none"
        });
        
        console.log("[DEBUG] Sending fetch request to /api/openai/chat");
        const response = await fetch('/api/openai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: apiMessages,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log("[DEBUG] API response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("[DEBUG] API error response:", errorData);
          throw new Error(`API request failed with status ${response.status}: ${errorData?.error || 'Unknown error'}`);
        }
        
        // Process the streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          console.error("[DEBUG] Response body is null");
          throw new Error('Response body is null');
        }
        
        let partialResponse = '';
        let receivedAnyData = false;
        let chunkCount = 0;
        
        console.log("[DEBUG] Starting to read stream");
        // Read the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("[DEBUG] Stream reading complete, chunks received:", chunkCount);
            break;
          }
          
          // Decode the chunk
          chunkCount++;
          const chunk = new TextDecoder().decode(value);
          const previewChunk = chunk.substring(0, 50) + (chunk.length > 50 ? "..." : "");
          console.log(`[DEBUG] Received chunk #${chunkCount}:`, previewChunk);
          
          partialResponse += chunk;
          receivedAnyData = true;
          
          // Update the assistant message with the new content
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: partialResponse } 
                : msg
            )
          );
          
          if (chunkCount % 10 === 0) {
            console.log(`[DEBUG] Updated UI with ${chunkCount} chunks of data so far`);
          }
        }
        
        if (!receivedAnyData) {
          console.warn("[DEBUG] No data received from stream");
          throw new Error("No response received from the AI. Please try again.");
        }
        
        // Final update to chat context with complete response
        const finalMessages = [...updatedMessages, {
          ...assistantMessage,
          content: partialResponse || "I couldn't generate a response. Please try again."
        }];
        
        console.log("[DEBUG] Final response length:", partialResponse.length);
        
        if (currentChat) {
          updateChatMessages(currentChat.id, finalMessages);
          console.log("[DEBUG] Updated chat context with final response");
        }
      } catch (apiError) {
        console.error('[DEBUG] API Error:', apiError);
        
        let errorMessage = "There was an error communicating with the AI.";
        if (apiError instanceof Error) {
          if (apiError.name === 'AbortError') {
            errorMessage = "Request timed out. The AI service may be experiencing high traffic or issues.";
            console.error("[DEBUG] Request timed out after 30 seconds");
          } else {
            errorMessage = apiError.message;
            console.error("[DEBUG] Error message:", errorMessage);
          }
        }
        
        setError(new Error(errorMessage));
        console.log("[DEBUG] Set error state with message:", errorMessage);
        
        // Remove the assistant message if there was an error
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
        console.log("[DEBUG] Removed temporary assistant message due to error");
      }
      
    } catch (err) {
      console.error('[DEBUG] Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      console.log("[DEBUG] Reset loading state to false");
    }
  };
  
  return (
    <div className="flex flex-col h-full items-center justify-center">
      {/* Centered Container with improved rounded corners and shadow */}
      <div className="w-full max-w-3xl mx-auto flex flex-col bg-[#343541] rounded-2xl shadow-2xl overflow-hidden border border-white/10" style={{ maxHeight: '80vh', boxShadow: '0 0 40px rgba(0, 0, 0, 0.3)' }}>
        {/* Messages - Scrollable section */}
        <div className="flex-1 overflow-y-auto p-1 md:p-2" style={{ maxHeight: '60vh' }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-xl px-6">
                <h1 className="text-3xl font-semibold mb-8 text-white/90">Hanna, how can I help you today?</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {[
                    "Explain quantum computing in simple terms",
                    "Got any creative ideas for a 10 year old's birthday?",
                    "How do I make an HTTP request in Javascript?",
                    "Write a poem about artificial intelligence"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-4 bg-[#3E3F4B] rounded-xl text-left hover:bg-[#2A2B32] transition-colors text-sm shadow-md border border-white/5 hover:border-white/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {messages.map((message, index) => (
                <div 
                  key={message.id || index}
                  className={`${message.role === 'assistant' ? 'bg-[#444654]' : 'bg-[#343541]'} py-4 px-2 md:px-4 rounded-lg mb-1`}
                >
                  <div className="max-w-3xl mx-auto">
                    <ChatMessage 
                      message={message} 
                      isLast={index === messages.length - 1} 
                    />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 mx-4 mb-4 rounded-lg text-sm">
            <p className="font-medium">Error: {error.message}</p>
          </div>
        )}
        
        {/* Input area with improved styling */}
        <div className="p-2 md:p-4 bg-[#343541] border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <ChatInput 
              onSend={handleSendMessage} 
              isLoading={isLoading} 
            />
            {isLoading && (
              <div className="text-xs text-gray-400 mt-2 flex items-center">
                <TypingAnimation />
                <span className="ml-2">Jack is thinking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 