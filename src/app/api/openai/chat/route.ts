import { StreamingTextResponse } from "ai";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req: Request) {
  console.log("API route called with OpenAI");
  
  // Ensure API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured");
    return new Response(
      JSON.stringify({ error: "OpenAI API key is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();
    console.log("Received messages:", JSON.stringify(messages).substring(0, 100) + "...");
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Use the chat completions API directly for simplicity and reliability
    console.log("Using chat completions API with gpt-4o-mini model");
    try {
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
      console.log("Chat completions API response received");

      // Convert the response to a readable stream
      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          let contentReceived = false;
          
          try {
            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                contentReceived = true;
                controller.enqueue(encoder.encode(content));
              }
            }
            console.log("Stream completed, content received:", contentReceived);
            controller.close();
          } catch (error) {
            console.error("Error processing stream:", error);
            controller.error(error);
          }
        },
      });

      return new StreamingTextResponse(readableStream);
    } catch (error) {
      console.error("Error with chat completions API:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate response", 
          details: error instanceof Error ? error.message : String(error) 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in OpenAI chat API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
