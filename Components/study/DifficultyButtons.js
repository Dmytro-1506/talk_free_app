import React from "react";
import { motion } from "framer-motion";
import { XCircle, MinusCircle, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const difficulties = [
  { label: "Again", quality: 0, icon: XCircle, color: "red", description: "Forgot it" },
  { label: "Hard", quality: 3, icon: MinusCircle, color: "orange", description: "Struggled" },
  { label: "Good", quality: 4, icon: CheckCircle, color: "green", description: "Remembered" },
  { label: "Easy", quality: 5, icon: Zap, color: "blue", description: "Too easy" }
];

export default function DifficultyButtons({ onAnswer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {difficulties.map((difficulty, index) => (
        <motion.div
          key={difficulty.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            onClick={() => onAnswer(difficulty.quality)}
            className={`w-full h-24 flex flex-col items-center justify-center gap-2 bg-${difficulty.color}-50 hover:bg-${difficulty.color}-100 text-${difficulty.color}-700 border-2 border-${difficulty.color}-200 transition-all duration-300 hover:scale-105`}
            variant="outline"
          >
            <difficulty.icon className="w-6 h-6" />
            <div className="text-center">
              <div className="font-bold">{difficulty.label}</div>
              <div className="text-xs opacity-70">{difficulty.description}</div>
            </div>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}