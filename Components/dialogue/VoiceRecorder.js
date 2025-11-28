import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceRecorder({ onTranscript, language, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const isHoldingRef = useRef(false);

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
    "English": "en-US",
    "Dutch": "nl-NL",
    "Polish": "pl-PL",
    "Turkish": "tr-TR",
    "Swedish": "sv-SE",
    "Greek": "el-GR"
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = languageMap[language] || "en-US";

      recognitionRef.current.onresult = (event) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          onTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsProcessing(false);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (isHoldingRef.current) {
          // User is still holding, restart recognition
          try {
            recognitionRef.current.start();
            setIsRecording(true);
          } catch (e) {
            console.error("Failed to restart recognition:", e);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscript]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || disabled || isProcessing) return;
    
    isHoldingRef.current = true;
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
  }, [disabled, isProcessing]);

  const stopRecording = useCallback(() => {
    isHoldingRef.current = false;
    if (recognitionRef.current && isRecording) {
      setIsProcessing(true);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to stop recognition:", e);
      }
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [isRecording]);

  // Handle mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    startRecording();
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    stopRecording();
  };

  const handleMouseLeave = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // Handle touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    startRecording();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopRecording();
  };

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return (
      <div className="text-center text-gray-500 text-sm">
        Speech recognition is not supported in your browser. Please use Chrome.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-red-500"
          >
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled || isProcessing}
        whileTap={{ scale: 0.95 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 select-none touch-none ${
          isRecording
            ? "bg-red-500 shadow-lg shadow-red-500/50 scale-110"
            : disabled || isProcessing
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-br from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30"
        }`}
        style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : (
          <Mic className={`w-8 h-8 text-white ${isRecording ? 'animate-pulse' : ''}`} />
        )}
      </motion.button>

      <p className="text-sm text-gray-500 text-center">
        {isProcessing ? "Processing..." : isRecording ? "Release to send" : "Hold to speak"}
      </p>
    </div>
  );
}