import React from "react";
import { motion } from "framer-motion";
import { Trash2, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SpeakButton from "../shared/SpeakButton";

export default function FlashcardEditor({ card, index, onUpdate, onDelete, canDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2 text-gray-400 pt-8">
            <GripVertical className="w-5 h-5" />
            <span className="text-sm font-medium">{index + 1}</span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 font-medium">Front (Question)</Label>
                {card.front && (
                  <SpeakButton 
                    text={card.front} 
                    language="auto"
                    size="sm"
                    className="h-8 w-8"
                  />
                )}
              </div>
              <Textarea
                placeholder="Enter the question or term..."
                value={card.front}
                onChange={(e) => onUpdate(index, 'front', e.target.value)}
                className="min-h-32 border-gray-200 focus:border-purple-400 resize-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 font-medium">Back (Answer)</Label>
                {card.back && (
                  <SpeakButton 
                    text={card.back} 
                    language="auto"
                    size="sm"
                    className="h-8 w-8"
                  />
                )}
              </div>
              <Textarea
                placeholder="Enter the answer or definition..."
                value={card.back}
                onChange={(e) => onUpdate(index, 'back', e.target.value)}
                className="min-h-32 border-gray-200 focus:border-purple-400 resize-none"
              />
            </div>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-red-500 hover:bg-red-50 rounded-full mt-6"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}