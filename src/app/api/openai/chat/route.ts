import { StreamingTextResponse } from "ai";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req: Request) {
  console.log("[DEBUG] API route called with OpenAI");
  
  // Log environment variables (without exposing the full API key)
  const apiKeyPrefix = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 8) + "..." : "undefined";
  console.log(`[DEBUG] API Key status: ${apiKeyPrefix ? "Present" : "Missing"}, prefix: ${apiKeyPrefix}`);
  
  // Ensure API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error("[DEBUG] OpenAI API key is not configured");
    return new Response(
      JSON.stringify({ error: "OpenAI API key is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { messages } = body;
    console.log(`[DEBUG] Received ${messages?.length || 0} messages`);
    console.log("[DEBUG] First few messages:", JSON.stringify(messages?.slice(0, 2) || []).substring(0, 200) + "...");
    
    // Check for system prompt
    const hasSystemPrompt = messages && messages.length > 0 && messages[0]?.role === "system";
    console.log(`[DEBUG] System prompt ${hasSystemPrompt ? "detected" : "not detected"}`);
    if (hasSystemPrompt) {
      console.log(`[DEBUG] System prompt content preview: ${messages[0].content.substring(0, 50)}...`);
    }
    
    // Initialize OpenAI client
    console.log("[DEBUG] Initializing OpenAI client");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Use the chat completions API directly for simplicity and reliability
    console.log("[DEBUG] Using chat completions API with gpt-4o-mini model");
    try {
      console.log("[DEBUG] Preparing API request with messages", 
        messages.map((m: any) => ({ role: m.role, contentLength: (typeof m.content === 'string' ? m.content.length : 0) })));
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages.map((message: any) => ({
          role: message.role,
          content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
        })),
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });
      console.log("[DEBUG] Chat completions API response received");

      // Convert the response to a readable stream
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          let contentReceived = false;
          let chunkCount = 0;
          
          try {
            console.log("[DEBUG] Starting to process stream");
            for await (const chunk of response) {
              chunkCount++;
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                contentReceived = true;
                controller.enqueue(encoder.encode(content));
                if (chunkCount % 10 === 0) {
                  console.log(`[DEBUG] Processed ${chunkCount} stream chunks so far`);
                }
              }
            }
            console.log(`[DEBUG] Stream completed, processed ${chunkCount} chunks, content received: ${contentReceived}`);
            controller.close();
          } catch (error) {
            console.error("[DEBUG] Error processing stream:", error);
            controller.error(error);
          }
        },
      });

      return new StreamingTextResponse(readableStream);
    } catch (error) {
      console.error("[DEBUG] Error with chat completions API:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[DEBUG] Error details: ${errorMessage}`);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate response", 
          details: errorMessage
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[DEBUG] Error in OpenAI chat API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
