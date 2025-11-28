import React from "react";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SessionComplete({ deck, cardsStudied, onRestart, onBackToDeck }) {
  return (
    <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Session Complete!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Great job! You reviewed <span className="font-bold text-green-600">{cardsStudied}</span> cards from {deck?.name}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onRestart}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Study Again
            </Button>
            <Button
              onClick={onBackToDeck}
              size="lg"
              variant="outline"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Decks
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}