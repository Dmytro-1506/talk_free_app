import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, RotateCcw, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import VoiceRecorder from "./VoiceRecorder";
import DialogueAnalysis from "./DialogueAnalysis";

export default function DialogueChat({ session, onBack, onUpdate, user }) {
  const [messages, setMessages] = useState(session.messages || []);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      initializeConversation();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      onUpdate(messages);
    }
  }, [messages]);

  const initializeConversation = async () => {
    setIsInitializing(true);
    const nativeLanguage = user?.native_language || "English";
    const levelInfo = session.level ? ` at ${session.level} level` : "";

    // Set a timeout to handle slow responses
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("timeout")), 5000)
    );

    try {
      const response = await Promise.race([
        base44.integrations.Core.InvokeLLM({
          prompt: `${session.prompt} Speak only in ${session.language}${levelInfo}.

Start the conversation with a greeting. This is the first message to begin the role-play scenario. After your ${session.language} response, provide the ${nativeLanguage} translation.`,
          response_json_schema: {
            type: "object",
            properties: {
              message: { type: "string" },
              translation: { type: "string" }
            }
          }
        }),
        timeoutPromise
      ]);

      const initialMessage = {
        role: "assistant",
        content: response.message,
        translation: response.translation
      };

      setMessages([initialMessage]);
      speakMessage(response.message);
    } catch (error) {
      // Use a fallback greeting if timeout or error
      const fallbackGreetings = {
        "Spanish": { message: "¡Hola! ¿Cómo estás?", translation: "Hello! How are you?" },
        "French": { message: "Bonjour! Comment allez-vous?", translation: "Hello! How are you?" },
        "German": { message: "Hallo! Wie geht es Ihnen?", translation: "Hello! How are you?" },
        "Italian": { message: "Ciao! Come stai?", translation: "Hello! How are you?" },
        "Portuguese": { message: "Olá! Como você está?", translation: "Hello! How are you?" },
        "Russian": { message: "Привет! Как дела?", translation: "Hello! How are you?" },
        "Chinese": { message: "你好！你好吗？", translation: "Hello! How are you?" },
        "Japanese": { message: "こんにちは！お元気ですか？", translation: "Hello! How are you?" },
        "Korean": { message: "안녕하세요! 어떻게 지내세요?", translation: "Hello! How are you?" },
        "Arabic": { message: "مرحبا! كيف حالك؟", translation: "Hello! How are you?" }
      };
      
      const fallback = fallbackGreetings[session.language] || { message: "Hello!", translation: "Hello!" };
      const initialMessage = {
        role: "assistant",
        content: fallback.message,
        translation: fallback.translation
      };

      setMessages([initialMessage]);
      speakMessage(fallback.message);
    }
    
    setIsInitializing(false);
  };

  const speakMessage = (text) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const languageMap = {
      "Spanish": "es-ES",
      "French": "fr-FR",
      "German": "de-DE",
      "Italian": "it-IT",
      "Portuguese": "pt-PT",
      "Russian": "ru-RU",
      "Chinese": "zh-CN",
      "Japanese": "ja-JP",
      "Korean": "ko-KR",
      "Arabic": "ar-SA",
      "English": "en-US"
    };

    utterance.lang = languageMap[session.language] || "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to get a native voice for the language
    const voices = window.speechSynthesis.getVoices();
    const langCode = languageMap[session.language]?.split('-')[0];
    const nativeVoice = voices.find(v => v.lang.startsWith(langCode) && v.localService === false) ||
                        voices.find(v => v.lang.startsWith(langCode));
    if (nativeVoice) {
      utterance.voice = nativeVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleUserMessage = async (transcript) => {
    if (!transcript.trim()) return;

    const newMessages = [...messages, { role: "user", content: transcript }];
    setMessages(newMessages);
    setIsAIThinking(true);

    const nativeLanguage = user?.native_language || "English";

    const conversationHistory = newMessages.map(m => 
      `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    ).join("\n");

    const levelInfo = session.level ? ` at ${session.level} level` : "";
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${session.prompt} Speak only in ${session.language}${levelInfo}.

Conversation so far:
${conversationHistory}

Continue the conversation naturally. Respond to what the user said. Keep your response short (1-2 sentences). After your ${session.language} response, provide the ${nativeLanguage} translation.`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          translation: { type: "string" }
        }
      }
    });

    const newAssistantMessage = {
      role: "assistant",
      content: response.message,
      translation: response.translation
    };

    setMessages([...newMessages, newAssistantMessage]);
    speakMessage(response.message);
    setIsAIThinking(false);
  };

  const handleNewDialogue = () => {
    setMessages([]);
    initializeConversation();
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-bold text-lg text-gray-900">{session.topic_title}</h2>
              <p className="text-sm text-gray-500">{session.language}{session.level ? ` • ${session.level}` : ""}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalysis(true)}
              disabled={messages.filter(m => m.role === "user").length === 0}
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Analyze
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewDialogue}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm border-white/20 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 min-h-full">
              {isInitializing && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="bg-white/80 rounded-2xl px-4 py-3 border border-gray-100">
                    <p className="text-sm text-gray-500">Starting conversation...</p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  message={message} 
                  language={session.language}
                />
              ))}
              
              {isAIThinking && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="bg-white/80 rounded-2xl px-4 py-3 border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-gray-100 p-6 bg-white/30">
            <VoiceRecorder
              onTranscript={handleUserMessage}
              language={session.language}
              disabled={isAIThinking || isInitializing}
            />
          </div>
        </Card>
      </div>

      {showAnalysis && (
        <DialogueAnalysis
          messages={messages}
          language={session.language}
          nativeLanguage={user?.native_language || "English"}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  );
}