"use client";

import { useRef, useEffect } from "react";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import { CircleUser, Zap } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === "user";
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Scroll into view when a new message is added
  useEffect(() => {
    if (isLast && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLast, message]);
  
  // Ensure content is not empty
  const content = typeof message.content === 'string' && message.content.trim() 
    ? message.content 
    : isUser ? "..." : "I'm thinking...";
  
  return (
    <div 
      ref={messageRef}
      className="flex items-start gap-4 p-2 rounded-lg"
    >
      {/* Avatar with improved styling */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
        {isUser ? (
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-full h-full flex items-center justify-center">
            <CircleUser className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 w-full h-full flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      
      {/* Message content with improved styling */}
      <div className={`flex-1 overflow-hidden ${isUser ? 'pr-4' : 'pr-6'}`}>
        <div className={`prose prose-invert max-w-none p-1 ${isUser ? '' : 'pb-2'}`}>
          {typeof content === "string" ? (
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="mb-4 last:mb-0 text-[15px] leading-relaxed" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 rounded-md" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 rounded-md" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1 text-[15px]" {...props} />,
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <div className="rounded-lg bg-gray-800 p-1 my-3 shadow-inner">
                      <pre className="overflow-auto p-3 text-sm rounded-md bg-black/30">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-gray-800 rounded-md px-1.5 py-0.5 text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-300 rounded-sm" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-400 hover:text-blue-300 underline" {...props} />
                ),
                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4 pb-1 border-b border-gray-700 rounded-sm" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3 pb-1 border-b border-gray-700 rounded-sm" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-3" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            // Fallback for non-string content
            <div className="text-[15px] leading-relaxed">{String(content)}</div>
          )}
        </div>
      </div>
    </div>
  );
} 