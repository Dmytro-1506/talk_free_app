import React from "react";
import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import SpeakButton from "../shared/SpeakButton";

export default function ChatMessage({ message, language }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-purple-600"
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            : "bg-white/80 border border-gray-100 text-gray-900"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        
        {message.translation && (
          <p className={`text-xs mt-2 pt-2 border-t ${
            isUser ? "border-white/20 text-white/80" : "border-gray-200 text-gray-500"
          }`}>
            {message.translation}
          </p>
        )}

        <div className={`flex justify-end mt-2 ${isUser ? "" : ""}`}>
          <SpeakButton
            text={message.content}
            language={language}
            size="sm"
            variant="ghost"
            className={`h-7 w-7 ${isUser ? "text-white/80 hover:text-white hover:bg-white/20" : "text-gray-400 hover:text-gray-600"}`}
          />
        </div>
      </div>
    </motion.div>
  );
}