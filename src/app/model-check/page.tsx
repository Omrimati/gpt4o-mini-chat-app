'use client';

import { useState, useEffect } from 'react';

export default function ModelCheckPage() {
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkModel() {
      try {
        setLoading(true);
        const response = await fetch('/api/openai/model-check');
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        setModelInfo(data);
        setError(null);
      } catch (err) {
        console.error('Error checking model:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    checkModel();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OpenAI Model Check</h1>
      
      {loading && <p className="text-gray-600">Loading model information...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {modelInfo && (
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Model Information</h2>
          
          <div className="mb-4">
            <p><strong>Configured Model:</strong> {modelInfo.configured_model}</p>
            <p><strong>Actual Model Used:</strong> {modelInfo.actual_model}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">Response Content:</h3>
            <p className="bg-gray-100 p-2 rounded">{modelInfo.response_content}</p>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">View Full Response</summary>
            <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto text-xs">
              {JSON.stringify(modelInfo.full_response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}