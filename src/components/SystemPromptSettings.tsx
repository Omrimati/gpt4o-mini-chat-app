"use client";

import { useState, useEffect } from "react";
import { useSystemPrompt } from "@/lib/contexts/SystemPromptContext";

export function SystemPromptSettings({ onClose }: { onClose: () => void }) {
  const { 
    systemPrompt, 
    setSystemPrompt, 
    isSystemPromptEnabled, 
    toggleSystemPrompt,
    predefinedPrompts,
    selectPredefinedPrompt
  } = useSystemPrompt();
  
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  
  // Update local prompt when system prompt changes
  useEffect(() => {
    setLocalPrompt(systemPrompt);
  }, [systemPrompt]);
  
  const handleSave = () => {
    setSystemPrompt(localPrompt);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-[#2A2B32] rounded-lg w-full max-w-xl p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">System Prompt Settings</h2>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium">Enable System Prompt</label>
            <button 
              onClick={toggleSystemPrompt}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${isSystemPromptEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isSystemPromptEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            The system prompt gives instructions to the AI about how it should respond. It will be added at the beginning of every conversation.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block font-medium mb-2">Custom System Prompt</label>
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            rows={6}
            className="w-full p-3 bg-[#40414F] rounded-md border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
            placeholder="Enter custom instructions for the AI..."
            disabled={!isSystemPromptEnabled}
          />
        </div>
        
        <div className="mb-6">
          <label className="block font-medium mb-2">Predefined Prompts</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(predefinedPrompts).map(([key, value]) => (
              <button
                key={key}
                onClick={() => selectPredefinedPrompt(key)}
                className="p-2 text-left bg-[#40414F] rounded-md hover:bg-[#5a5b70] transition-colors text-sm"
                disabled={!isSystemPromptEnabled}
              >
                <span className="font-medium block mb-1 capitalize">{key}</span>
                <span className="text-xs text-gray-300 line-clamp-2">{value.substring(0, 60)}...</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md hover:bg-[#40414F]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#10A37F] hover:bg-[#0D8F6F] rounded-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 