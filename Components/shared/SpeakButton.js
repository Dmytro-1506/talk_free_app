import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SpeakButton({ text, language = "auto", variant = "outline", size = "icon", className = "" }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (e) => {
    e?.stopPropagation();

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text || !text.trim()) return;

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on parameter
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
      "Hindi": "hi-IN",
      "Dutch": "nl-NL",
      "Polish": "pl-PL",
      "Turkish": "tr-TR",
      "Swedish": "sv-SE",
      "Czech": "cs-CZ",
      "Greek": "el-GR",
      "Hebrew": "he-IL",
      "Thai": "th-TH",
      "Vietnamese": "vi-VN",
      "Indonesian": "id-ID",
      "Romanian": "ro-RO",
      "Ukrainian": "uk-UA",
      "Danish": "da-DK",
      "Finnish": "fi-FI",
      "Norwegian": "no-NO",
      "English": "en-US"
    };

    if (language !== "auto") {
      utterance.lang = languageMap[language] || "en-US";
    }

    utterance.rate = 0.85; // Slightly slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = (e) => {
    e?.stopPropagation();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isSpeaking ? stopSpeaking : speak}
      className={`${className} ${isSpeaking ? 'animate-pulse' : ''}`}
      type="button"
    >
      {isSpeaking ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
}