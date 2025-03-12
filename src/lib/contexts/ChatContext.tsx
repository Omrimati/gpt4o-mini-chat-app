"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Message } from "ai";

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatMessages: (chatId: string, messages: Message[]) => void;
  updateChatTitle: (chatId: string, title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Generate a random ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Create a new chat
  const createNewChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat",
      createdAt: new Date(),
      messages: [],
    };
    
    setChats((prevChats) => [...prevChats, newChat]);
    setCurrentChat(newChat);
    return newChat;
  };

  // Load chats from localStorage on mount or create a single default chat
  useEffect(() => {
    if (initialized) return;
    
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }));
        
        // If there are multiple chats stored, just keep one
        const chatsToKeep = parsedChats.length > 0 ? [parsedChats[0]] : [];
        setChats(chatsToKeep);
        
        // Set current chat to the first one if available
        if (chatsToKeep.length > 0) {
          setCurrentChat(chatsToKeep[0]);
        } else {
          // Create a default chat if none exists
          const newChat = createNewChat();
        }
      } catch (error) {
        console.error("Failed to parse stored chats:", error);
        // Create a default chat if parsing fails
        const newChat = createNewChat();
      }
    } else {
      // Create a default chat if none exists
      const newChat = createNewChat();
    }
    
    setInitialized(true);
  }, [initialized]);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (!initialized) return;
    
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats, initialized]);

  // Select a chat by ID
  const selectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
  };

  // Delete a chat by ID
  const deleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    
    // If the deleted chat was the current one, select another one
    if (currentChat?.id === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChat(remainingChats[0]);
      } else {
        setCurrentChat(null);
        // Create a new chat if all chats were deleted
        createNewChat();
      }
    }
  };

  // Update chat messages
  const updateChatMessages = (chatId: string, messages: Message[]) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, messages } : chat
      )
    );
    
    // Update current chat if it's the one being modified
    if (currentChat?.id === chatId) {
      setCurrentChat((prev) => prev ? { ...prev, messages } : null);
    }
    
    // If this is the first AI response, try to generate a title
    const chat = chats.find((c) => c.id === chatId);
    if (chat?.messages.length === 0 && messages.length >= 2) {
      const userFirstMessage = messages[0].content;
      // If the message is long enough, use it as the title
      if (userFirstMessage && typeof userFirstMessage === 'string' && userFirstMessage.length > 0) {
        const newTitle = userFirstMessage.slice(0, 30) + (userFirstMessage.length > 30 ? "..." : "");
        updateChatTitle(chatId, newTitle);
      }
    }
  };

  // Update chat title
  const updateChatTitle = (chatId: string, title: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
    
    // Update current chat if it's the one being modified
    if (currentChat?.id === chatId) {
      setCurrentChat((prev) => prev ? { ...prev, title } : null);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isLoading,
        createNewChat,
        selectChat,
        deleteChat,
        updateChatMessages,
        updateChatTitle,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
} 