import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { ChatProvider } from "@/lib/contexts/ChatContext";
import { SystemPromptProvider } from "@/lib/contexts/SystemPromptContext";

export const metadata: Metadata = {
  title: "GPT-4o mini Chat",
  description: "A modern AI chat interface powered by GPT-4o mini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        <ThemeProvider>
          <ChatProvider>
            <SystemPromptProvider>
              {children}
            </SystemPromptProvider>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
