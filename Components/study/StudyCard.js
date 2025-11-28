import React from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import SpeakButton from "../shared/SpeakButton";

export default function StudyCard({ card, isFlipped, onFlip, targetLanguage }) {
  return (
    <div className="perspective-1000">
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        onClick={onFlip}
      >
        <Card className="min-h-96 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 shadow-2xl">
          <div style={{ backfaceVisibility: "hidden" }} className="w-full text-center relative">
            <div className="absolute top-0 right-0" onClick={(e) => e.stopPropagation()}>
              <SpeakButton 
                text={card.front} 
                language={targetLanguage}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full"
              />
            </div>
            <div className="mb-6">
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                Question
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-8 leading-relaxed">
              {card.front}
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <RotateCw className="w-5 h-5" />
              <span className="text-sm">Click to reveal answer</span>
            </div>
          </div>
        </Card>

        <Card 
          className="absolute inset-0 min-h-96 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 shadow-2xl"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="w-full text-center relative">
            <div className="absolute top-0 right-0" onClick={(e) => e.stopPropagation()} style={{ transform: "rotateY(180deg)" }}>
              <SpeakButton 
                text={card.back} 
                language="auto"
                className="bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full"
              />
            </div>
            <div className="mb-6">
              <span className="text-sm font-medium text-purple-600 bg-purple-100 px-4 py-2 rounded-full">
                Answer
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 leading-relaxed whitespace-pre-wrap">
              {card.back}
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}