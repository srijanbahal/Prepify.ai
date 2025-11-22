"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TranscriptMessage {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: number;
  isFinal?: boolean;
}

interface TranscriptDisplayProps {
  messages: TranscriptMessage[];
  className?: string;
}

export default function TranscriptDisplay({ messages, className = "" }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={`${msg.timestamp}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-white text-black rounded-tr-none"
                    : "bg-white/10 text-white border border-white/10 rounded-tl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {!msg.isFinal && (
                  <span className="inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse ml-1" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
