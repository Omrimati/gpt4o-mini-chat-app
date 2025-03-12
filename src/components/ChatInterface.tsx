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
  
  // Sync messages with chat context
  useEffect(() => {
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
      
      // Update chat context
      if (currentChat) {
        updateChatMessages(currentChat.id, updatedMessages);
      }
      
      // Set loading state
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      // Create a temporary assistant message for streaming
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };
      
      // Add the assistant message to the UI
      setMessages(prev => [...prev, assistantMessage]);
      
      // Send to API
      try {
        console.log("Sending request to OpenAI API");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        // Prepare messages for API, including system prompt if enabled
        const apiMessages = isSystemPromptEnabled && systemPrompt
          ? [{ role: "system", content: systemPrompt } as Message, ...updatedMessages]
          : updatedMessages;
        
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
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API error response:", errorData);
          throw new Error(`API request failed with status ${response.status}: ${errorData?.error || 'Unknown error'}`);
        }
        
        // Process the streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          console.error("Response body is null");
          throw new Error('Response body is null');
        }
        
        let partialResponse = '';
        let receivedAnyData = false;
        
        console.log("Starting to read stream");
        // Read the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream reading complete");
            break;
          }
          
          // Decode the chunk
          const chunk = new TextDecoder().decode(value);
          console.log("Received chunk:", chunk.substring(0, 50) + (chunk.length > 50 ? "..." : ""));
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
        }
        
        if (!receivedAnyData) {
          console.warn("No data received from stream");
          throw new Error("No response received from the AI. Please try again.");
        }
        
        // Final update to chat context with complete response
        const finalMessages = [...updatedMessages, {
          ...assistantMessage,
          content: partialResponse || "I couldn't generate a response. Please try again."
        }];
        
        if (currentChat) {
          updateChatMessages(currentChat.id, finalMessages);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        let errorMessage = "There was an error communicating with the AI.";
        if (apiError instanceof Error) {
          if (apiError.name === 'AbortError') {
            errorMessage = "Request timed out. The AI service may be experiencing high traffic or issues.";
          } else {
            errorMessage = apiError.message;
          }
        }
        
        setError(new Error(errorMessage));
        
        // Remove the assistant message if there was an error
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xl px-4">
              <h1 className="text-3xl font-semibold mb-6">How can I help you today?</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                {[
                  "Explain quantum computing in simple terms",
                  "Got any creative ideas for a 10 year old's birthday?",
                  "How do I make an HTTP request in Javascript?",
                  "Write a poem about artificial intelligence"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="p-4 bg-[#3E3F4B] rounded-xl text-left hover:bg-[#2A2B32] transition-colors text-sm"
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
                className={`${message.role === 'assistant' ? 'bg-[#444654]' : 'bg-[#343541]'} py-6`}
              >
                <div className="max-w-3xl mx-auto px-4">
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
        
        {/* Error message */}
        {error && (
          <div className="p-4 mt-4 text-red-500 bg-red-900/20 border border-red-500 rounded-lg max-w-3xl mx-auto">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error.message}</p>
            <button 
              onClick={() => setError(null)} 
              className="mt-2 text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
      
      {/* Input - Fixed at bottom */}
      <div className="border-t border-white/20 bg-[#343541] py-4">
        <div className="max-w-3xl mx-auto px-4">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          <div className="text-xs text-center mt-2 text-gray-400">
            GPT-4o mini may produce inaccurate information about people, places, or facts.
          </div>
        </div>
      </div>
    </div>
  );
} 