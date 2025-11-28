import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Eye, Brain, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const levelColors = {
  A1: "bg-green-100 text-green-700 border-green-200",
  A2: "bg-blue-100 text-blue-700 border-blue-200",
  B1: "bg-purple-100 text-purple-700 border-purple-200",
  B2: "bg-orange-100 text-orange-700 border-orange-200",
  C1: "bg-red-100 text-red-700 border-red-200",
  C2: "bg-gray-100 text-gray-700 border-gray-200"
};

const topicIcons = {
  "Basic Vocabulary": "📚",
  "Food & Drinks": "🍕",
  "Travel": "✈️",
  "Family": "👨‍👩‍👧‍👦",
  "Work & Business": "💼",
  "Health": "🏥",
  "Shopping": "🛒",
  "Weather": "🌤️",
  "Hobbies": "🎨",
  "Technology": "💻"
};

export default function WordListCard({ list, progress }) {
  const totalWords = list.words?.length || 0;
  const masteredWords = progress.filter(p => p.status === "mastered").length;
  const learningWords = progress.filter(p => p.status === "learning").length;
  const progressPercent = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all overflow-hidden">
        {/* Preview Image */}
        {list.words?.[0]?.image_url && (
          <div className="h-32 overflow-hidden">
            <img
              src={list.words[0].image_url}
              alt={list.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{topicIcons[list.topic] || "📖"}</span>
                <Badge className={levelColors[list.level]}>{list.level}</Badge>
              </div>
              <h3 className="font-bold text-gray-900">{list.title}</h3>
              <p className="text-sm text-gray-500">{totalWords} words • {list.language}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-purple-600">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{masteredWords} mastered</span>
              <span>{learningWords} learning</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              size="sm"
              onClick={() => window.location.href = `${createPageUrl("WordViewer")}?listId=${list.id}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600" 
              size="sm"
              onClick={() => window.location.href = `${createPageUrl("WordQuiz")}?listId=${list.id}`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Learn
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}