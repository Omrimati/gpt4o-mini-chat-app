"use client";

import { useState, useRef, useEffect } from "react";

export default function ApiTestPage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setResponse("");
    addLog(`Sending request with message: ${input}`);
    
    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      });
      
      addLog(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        addLog(`Error response: ${JSON.stringify(errorData)}`);
        throw new Error(`API request failed with status ${response.status}: ${errorData?.error || 'Unknown error'}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }
      
      addLog("Starting to read stream");
      let receivedText = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          addLog("Stream complete");
          break;
        }
        
        const chunk = new TextDecoder().decode(value);
        addLog(`Chunk received (${chunk.length} chars)`);
        receivedText += chunk;
        setResponse(receivedText);
      }
      
      if (!receivedText) {
        addLog("Warning: No data received from stream");
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">OpenAI API Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your message here..."
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                rows={4}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 rounded-md disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </form>
            
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Response:</h2>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-md min-h-[200px] whitespace-pre-wrap">
                {response || (isLoading ? "Waiting for response..." : "No response yet")}
              </div>
              
              {error && (
                <div className="mt-2 p-3 bg-red-900/30 border border-red-500 rounded-md text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Debug Logs:</h2>
            <div className="p-3 bg-gray-800 border border-gray-700 rounded-md h-[400px] overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 