import React from "react";
import { motion } from "framer-motion";
import { Plus, History } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function StartOptions({ onNewDialogue, onContinue, hasSavedDialogues }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            onClick={onNewDialogue}
            className="p-8 cursor-pointer bg-gradient-to-br from-blue-500 to-purple-600 border-0 text-white hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Start New Dialogue</h3>
                <p className="text-white/80 text-sm">Begin a fresh conversation practice session</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: hasSavedDialogues ? 1.02 : 1 }}
          whileTap={{ scale: hasSavedDialogues ? 0.98 : 1 }}
        >
          <Card
            onClick={hasSavedDialogues ? onContinue : undefined}
            className={`p-8 border-2 transition-all duration-300 ${
              hasSavedDialogues
                ? "cursor-pointer bg-white/60 backdrop-blur-sm border-purple-200 hover:border-purple-400 hover:shadow-xl"
                : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                hasSavedDialogues ? "bg-purple-100" : "bg-gray-200"
              }`}>
                <History className={`w-8 h-8 ${hasSavedDialogues ? "text-purple-600" : "text-gray-400"}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${hasSavedDialogues ? "text-gray-900" : "text-gray-400"}`}>
                  Continue Saved Dialogue
                </h3>
                <p className={`text-sm ${hasSavedDialogues ? "text-gray-500" : "text-gray-400"}`}>
                  {hasSavedDialogues ? "Resume a previous conversation" : "No saved dialogues yet"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}