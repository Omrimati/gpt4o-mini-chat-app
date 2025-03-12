import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

export async function GET() {
  // Ensure API key is available
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured" },
      { status: 500 }
    );
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Define the model we want to use
    const model = "gpt-4o-mini";
    
    // Make a simple non-streaming request to check the model
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: "Say 'Hello, I am GPT-4o mini'" }],
      max_tokens: 20,
    });

    // Return the model information and response
    return NextResponse.json({
      configured_model: model,
      actual_model: response.model,
      response_content: response.choices[0]?.message?.content,
      full_response: response
    });
  } catch (error) {
    console.error("Error in OpenAI model check API:", error);
    return NextResponse.json(
      { 
        error: "Failed to check model",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 