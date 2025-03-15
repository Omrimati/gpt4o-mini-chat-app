'use client';

import { useState, useEffect } from 'react';
import { useSystemPrompt } from '@/lib/contexts/SystemPromptContext';

export default function DebugPage() {
  // API Key verification
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid' | 'error'>('checking');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [testMessage, setTestMessage] = useState("Hello, are you working properly?");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Get system prompt from context
  const { systemPrompt, isSystemPromptEnabled, predefinedPrompts, selectPredefinedPrompt } = useSystemPrompt();

  // Add log message
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  // Check API key on page load
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        addLog("Checking API key...");
        const response = await fetch('/api/openai/model-check');
        const data = await response.json();
        
        if (response.ok) {
          setApiKeyStatus('valid');
          addLog("API key is valid");
        } else {
          setApiKeyStatus('invalid');
          addLog(`API key check failed: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        setApiKeyStatus('error');
        addLog(`Error checking API key: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkApiKey();
  }, []);

  // Test API call with system prompt
  const testApiCall = async () => {
    setLoading(true);
    setApiResponse(null);
    
    try {
      addLog("Sending test API call...");
      
      // Prepare messages, including system prompt if enabled
      const messages = [];
      if (isSystemPromptEnabled && systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
        addLog(`Using system prompt: ${systemPrompt.substring(0, 30)}...`);
      }
      
      messages.push({ role: "user", content: testMessage });
      addLog(`Test message: "${testMessage}"`);
      
      // Make the API call
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (response.ok) {
        // For debugging, we won't use streaming to get the full response at once
        const text = await response.text();
        setApiResponse({ success: true, content: text });
        addLog(`Received response (${text.length} characters)`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        setApiResponse({ success: false, error: errorData });
        addLog(`API request failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setApiResponse({ success: false, error });
      addLog(`Error in API call: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog("Logs cleared");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      
      {/* API Key Status */}
      <section className="mb-8 p-4 border border-gray-300 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">API Key Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            apiKeyStatus === 'checking' ? 'bg-yellow-500' :
            apiKeyStatus === 'valid' ? 'bg-green-500' :
            'bg-red-500'
          }`}></div>
          <p>
            {apiKeyStatus === 'checking' ? 'Checking API key...' :
             apiKeyStatus === 'valid' ? 'API key is valid' :
             apiKeyStatus === 'invalid' ? 'API key is invalid' :
             'Error checking API key'}
          </p>
        </div>
      </section>
      
      {/* System Prompt Status */}
      <section className="mb-8 p-4 border border-gray-300 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">System Prompt</h2>
        <div className="mb-4">
          <p><strong>Enabled:</strong> {isSystemPromptEnabled ? 'Yes' : 'No'}</p>
          <p><strong>Current Prompt:</strong></p>
          <div className="mt-2 p-3 bg-gray-100 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{systemPrompt || 'None'}</pre>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Select Predefined Prompt</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.keys(predefinedPrompts).map(key => (
              <button
                key={key}
                onClick={() => {
                  selectPredefinedPrompt(key);
                  addLog(`Selected predefined prompt: ${key}`);
                }}
                className="px-3 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Test API Call */}
      <section className="mb-8 p-4 border border-gray-300 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test API Call</h2>
        <div className="mb-4">
          <label className="block mb-2">Test Message</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>
        
        <button
          onClick={testApiCall}
          disabled={loading}
          className={`px-4 py-2 rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {loading ? 'Testing...' : 'Test API Call'}
        </button>
        
        {apiResponse && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Response</h3>
            <div className="p-3 bg-gray-100 rounded-md max-h-60 overflow-auto">
              {apiResponse.success ? (
                <div className="whitespace-pre-wrap">{apiResponse.content}</div>
              ) : (
                <div className="text-red-500">
                  <p>Error: {apiResponse.error?.error || 'Unknown error'}</p>
                  {apiResponse.error?.details && (
                    <p className="mt-2">Details: {apiResponse.error.details}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      
      {/* Debug Logs */}
      <section className="mb-8 p-4 border border-gray-300 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Debug Logs</h2>
          <button
            onClick={clearLogs}
            className="px-2 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
        
        <div className="bg-gray-900 text-green-500 p-3 rounded-md font-mono text-sm max-h-96 overflow-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </section>
    </div>
  );
} 